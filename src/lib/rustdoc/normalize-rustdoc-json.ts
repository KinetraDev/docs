import type {
  RustdocImplGroups,
  RustdocSourceJson,
} from "@/lib/rustdoc/rustdoc";

export interface RustdocRawJson {
  format_version: number;
  root: number | string;
  crate_version?: string | null;
  index: Record<string, RustdocRawItem>;
  paths?: Record<string, RustdocRawPath>;
  [key: string]: unknown;
}

interface RustdocRawItem {
  id: number | string;
  crate_id?: number;
  name?: string | null;
  docs?: string | null;
  visibility?: unknown;
  deprecation?: {
    since?: string | null;
    note?: string | null;
  } | null;
  inner?: Record<string, unknown>;
  [key: string]: unknown;
}

interface RustdocRawPath {
  crate_id: number;
  path: string[];
  kind: string;
  [key: string]: unknown;
}

interface KindConfig {
  title: string;
  icon: string;
  slug: string;
  pagePrefix: string;
}

const KIND_CONFIG: Record<string, KindConfig> = {
  module: {
    title: "Modules",
    icon: "FolderTree",
    slug: "modules",
    pagePrefix: "Module",
  },
  struct: {
    title: "Structs",
    icon: "Box",
    slug: "structs",
    pagePrefix: "Struct",
  },
  trait: {
    title: "Traits",
    icon: "BadgeCheck",
    slug: "traits",
    pagePrefix: "Trait",
  },
  function: {
    title: "Functions",
    icon: "SquareFunction",
    slug: "functions",
    pagePrefix: "Function",
  },
  enum: { title: "Enums", icon: "List", slug: "enums", pagePrefix: "Enum" },
  union: { title: "Unions", icon: "Box", slug: "unions", pagePrefix: "Union" },
  constant: {
    title: "Constants",
    icon: "Variable",
    slug: "constants",
    pagePrefix: "Constant",
  },
  static: {
    title: "Statics",
    icon: "Variable",
    slug: "statics",
    pagePrefix: "Static",
  },
  type_alias: {
    title: "Type Aliases",
    icon: "FileType",
    slug: "type-aliases",
    pagePrefix: "Type Alias",
  },
  macro: {
    title: "Macros",
    icon: "Braces",
    slug: "macros",
    pagePrefix: "Macro",
  },
};

export function normalizeRustdocJson(raw: RustdocRawJson): RustdocSourceJson {
  const root = raw.index[String(raw.root)];
  const pages: RustdocSourceJson["pages"] = [
    {
      path: "index.json",
      data: {
        title: `Crate ${root?.name ?? "rustdoc"}`,
        description:
          descriptionFromDocs(root?.docs ?? undefined) ??
          "Rustdoc JSON normalized for the runtime docs loader.",
        body: {
          kind: "crate",
          name: root?.name ?? "rustdoc",
          crate_version: raw.crate_version ?? undefined,
          format_version: raw.format_version,
          docs: root?.docs ?? undefined,
        },
      },
    },
  ];
  const metasByPath = new Map<string, RustdocSourceJson["metas"][number]>();
  const groups = new Map<string, string[]>();
  const usedSlugs = new Set([""]);
  const idToSlug = new Map<string, string>();
  const plannedItems = getLocalItems(raw).map(([id, itemPath, item]) => {
    const config = getKindConfig(itemPath.kind);
    const pathParts = itemPath.path.slice(1).map(slugify);
    const itemSlug = dedupeSlug([config.slug, ...pathParts], usedSlugs);
    const pageName = itemSlug.at(-1) ?? "item";
    const groupPages = groups.get(config.slug) ?? [];

    groupPages.push(pageName);
    groups.set(config.slug, groupPages);
    idToSlug.set(String(id), itemSlug.join("/"));

    return { id, itemPath, item, itemSlug, config };
  });

  for (const { id, itemPath, item, itemSlug, config } of plannedItems) {
    const body = {
      id,
      kind: itemPath.kind,
      name: item.name,
      path: itemPath.path.join("::"),
      docs: item.docs ?? undefined,
      visibility: item.visibility,
      deprecation: item.deprecation,
      inner: item.inner,
      impls: undefined as RustdocImplGroups | undefined,
      implementations: undefined as RustdocImplGroups | undefined,
    };

    if (itemPath.kind === "struct") {
      body.impls = buildImplGroups(getStructImplIds(item), raw.index, idToSlug);
    }

    if (itemPath.kind === "trait") {
      body.implementations = buildImplGroups(
        getTraitImplementationIds(item),
        raw.index,
        idToSlug,
      );
    }

    pages.push({
      path: `${itemSlug.join("/")}.json`,
      slugs: itemSlug,
      data: {
        title: `${config.pagePrefix} ${item.name ?? itemPath.path.at(-1) ?? id}`,
        description: descriptionFromDocs(item.docs ?? undefined),
        body,
      },
    });
  }

  const rootPages = ["index"];
  for (const config of Object.values(KIND_CONFIG)) {
    const groupPages = groups.get(config.slug);
    if (!groupPages || groupPages.length === 0) continue;

    rootPages.push(config.slug);
    metasByPath.set(`${config.slug}/meta.json`, {
      path: `${config.slug}/meta.json`,
      data: {
        title: config.title,
        icon: config.icon,
        pages: [...new Set(groupPages)].sort(),
      },
    });
  }

  return {
    metas: [
      {
        path: "meta.json",
        data: {
          root: true,
          title: `${root?.name ?? "Rustdoc"} Rustdoc`,
          description: "Rustdoc JSON normalized for the runtime docs loader.",
          icon: "Bug",
          pages: rootPages,
        },
      },
      ...[...metasByPath.values()].sort((a, b) => a.path.localeCompare(b.path)),
    ],
    pages,
  };
}

function getLocalItems(
  raw: RustdocRawJson,
): Array<[string, RustdocRawPath, RustdocRawItem]> {
  return Object.entries(raw.paths ?? {})
    .filter(
      ([id, itemPath]) =>
        itemPath.crate_id === 0 && String(id) !== String(raw.root),
    )
    .map(([id, itemPath]) => [id, itemPath, raw.index[String(id)]] as const)
    .filter(
      (entry): entry is [string, RustdocRawPath, RustdocRawItem] =>
        Boolean(entry[2]) && entry[1]?.path?.length > 1,
    )
    .sort(
      ([, a], [, b]) =>
        a.kind.localeCompare(b.kind) ||
        a.path.join("::").localeCompare(b.path.join("::")),
    );
}

function buildImplGroups(
  ids: unknown[],
  index: RustdocRawJson["index"],
  idToSlug: Map<string, string>,
): RustdocImplGroups {
  const groups: RustdocImplGroups = {
    inherent: [],
    trait: [],
    autoTrait: [],
    blanket: [],
  };

  for (const id of ids) {
    const summary = summarizeImpl(id, index, idToSlug);
    if (summary) groups[summary.group].push(summary);
  }

  return groups;
}

function summarizeImpl(
  id: unknown,
  index: RustdocRawJson["index"],
  idToSlug: Map<string, string>,
) {
  const item = index[String(id)];
  const impl = item?.inner?.impl as Record<string, unknown> | undefined;
  if (!impl) return undefined;

  const group = implGroup(impl);
  const target = renderType(impl.for);
  const trait = impl.trait as
    | { path?: string; id?: number | string }
    | undefined;
  const traitName = trait?.path;

  return {
    id: String(id),
    group,
    summary: traitName ? `impl ${traitName} for ${target}` : `impl ${target}`,
    target,
    traitName,
    link: resolveLinkByType(impl.for, idToSlug),
    traitLink:
      trait?.id === undefined ? undefined : idToSlug.get(String(trait.id)),
    items: implItems(impl.items, index),
    isUnsafe: Boolean(impl.is_unsafe),
    isNegative: Boolean(impl.is_negative),
    isSynthetic: Boolean(impl.is_synthetic),
    isBlanket: impl.blanket_impl !== null && impl.blanket_impl !== undefined,
  };
}

function implGroup(impl: Record<string, unknown>): keyof RustdocImplGroups {
  if (impl.blanket_impl !== null && impl.blanket_impl !== undefined)
    return "blanket";
  if (impl.is_synthetic) return "autoTrait";
  if (impl.trait) return "trait";
  return "inherent";
}

function implItems(items: unknown, index: RustdocRawJson["index"]) {
  if (!Array.isArray(items)) return [];

  return items
    .map((id) => index[String(id)])
    .filter(Boolean)
    .map((item) => ({
      id: String(item.id),
      name: item.name,
      kind: Object.keys(item.inner ?? {})[0],
    }));
}

function getStructImplIds(item: RustdocRawItem): unknown[] {
  const structInner = item.inner?.struct as { impls?: unknown[] } | undefined;
  return structInner?.impls ?? [];
}

function getTraitImplementationIds(item: RustdocRawItem): unknown[] {
  const traitInner = item.inner?.trait as
    | { implementations?: unknown[] }
    | undefined;
  return traitInner?.implementations ?? [];
}

function resolveLinkByType(type: unknown, idToSlug: Map<string, string>) {
  if (!type || typeof type !== "object") return undefined;

  const value = type as { resolved_path?: { id?: number | string } };
  const id = value.resolved_path?.id;
  return id === undefined ? undefined : idToSlug.get(String(id));
}

function getKindConfig(kind: string): KindConfig {
  return (
    KIND_CONFIG[kind] ?? {
      title: `${titleCaseKind(kind)}s`,
      icon: "FileText",
      slug: `${slugify(kind)}s`,
      pagePrefix: titleCaseKind(kind),
    }
  );
}

function renderType(type: unknown): string {
  if (typeof type === "string") return type;
  if (!type || typeof type !== "object") return "_";

  const value = type as Record<string, unknown>;
  if (typeof value.primitive === "string") return value.primitive;
  if (typeof value.generic === "string") return value.generic;
  if ("unit" in value) return "()";
  if (isRecord(value.resolved_path)) {
    return String(value.resolved_path.path ?? "Self");
  }
  if (isRecord(value.borrowed_ref)) {
    const mutable = value.borrowed_ref.is_mutable ? "mut " : "";
    return `&${mutable}${renderType(value.borrowed_ref.type)}`;
  }
  if (Array.isArray(value.tuple)) {
    return `(${value.tuple.map(renderType).join(", ")})`;
  }
  if (isRecord(value.slice)) return `[${renderType(value.slice)}]`;
  if (isRecord(value.array)) {
    return `[${renderType(value.array.type)}; ${String(value.array.len ?? "_")}]`;
  }
  if (isRecord(value.qualified_path)) {
    return String(value.qualified_path.name ?? "_");
  }

  return "_";
}

function descriptionFromDocs(docs: string | undefined) {
  if (!docs) return undefined;

  const text = docs
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, (_, label: string) => label)
    .replace(/[`*_#<>]/g, "")
    .split(/\n\s*\n/)[0]
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return undefined;
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function slugify(value: unknown) {
  const slug = String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "item";
}

function dedupeSlug(slugs: string[], used: Set<string>) {
  const base = slugs.join("/");
  let current = base;
  let index = 2;

  while (used.has(current)) {
    current = `${base}-${index}`;
    index += 1;
  }

  used.add(current);
  return current.split("/");
}

function titleCaseKind(kind: string) {
  return kind
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
