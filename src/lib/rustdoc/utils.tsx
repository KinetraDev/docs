import type { Folder, Item, Root } from "fumadocs-core/page-tree";

import { icons } from "lucide-react";

import type {
  RustdocLoader,
  RustdocMeta,
  RustdocSourceJson,
} from "@/lib/rustdoc/rustdoc";

export function mergeRustdocTrees(
  staticTree: Root,
  runtimeFoldersBySlug: Record<string, Folder>,
  rustdocSourceSlugs: string[],
  loadingUrlsBySlug: Record<string, string | undefined>,
): Root {
  const loadedSlugs = Object.keys(runtimeFoldersBySlug).sort();
  const rustdocSlugs = new Set(rustdocSourceSlugs);
  const loadingUrls = Object.values(loadingUrlsBySlug).filter(Boolean);

  return {
    ...staticTree,
    $id: [staticTree.$id ?? "root", ...loadedSlugs, ...loadingUrls].join(":"),
    children: staticTree.children.map((node) => {
      if (node.type !== "folder" || !node.root) return node;

      const slug = node.$ref?.split("/")[0];
      if (!slug || !rustdocSlugs.has(slug)) return node;

      const runtime = slug ? runtimeFoldersBySlug[slug] : undefined;
      if (!runtime) {
        const loadingUrl = loadingUrlsBySlug[slug];
        const loadingIndex = loadingUrl
          ? createLoadingRustdocIndex(slug, loadingUrl)
          : undefined;

        return {
          ...node,
          index: loadingIndex,
          children: loadingIndex ? [loadingIndex] : [],
        };
      }

      return {
        ...node,
        index: runtime.index,
        children: runtime.children,
      };
    }),
  };
}

function createLoadingRustdocIndex(sourceSlug: string, url: string): Item {
  return {
    type: "page",
    $id: `${sourceSlug}:loading:${url}`,
    $ref: `${sourceSlug}/loading.json`,
    name: "Loading rustdoc",
    url,
  };
}

export function toRustdocFolder(loader: RustdocLoader): Folder {
  const tree = loader.pageTree;
  const meta = loader.getNodeMeta(tree);
  const index = tree.children.find(
    (node): node is Item => node.type === "page",
  );

  return {
    type: "folder",
    $id: tree.$id,
    $ref: tree.$ref,
    root: true,
    name: tree.name,
    description: tree.description,
    icon: resolveRustdocIcon(meta),
    index,
    children: tree.children,
  };
}

function resolveRustdocIcon(meta: RustdocMeta | undefined) {
  const iconName = meta?.data.icon as keyof typeof icons | undefined;
  const Icon = iconName ? icons[iconName] : undefined;

  return Icon ? <Icon /> : undefined;
}

export function getRustdocStaticSlugsFromJson(
  json: RustdocSourceJson,
): string[][] {
  const slugs = new Map<string, string[]>();

  slugs.set("", []);

  for (const page of json.pages) {
    const pageSlug = page.slugs ?? getSlugsFromPath(page.path);

    slugs.set(pageSlug.join("/"), pageSlug);

    for (let index = 1; index < pageSlug.length; index++) {
      const parentSlug = pageSlug.slice(0, index);
      slugs.set(parentSlug.join("/"), parentSlug);
    }
  }

  return [...slugs.values()];
}

function getSlugsFromPath(path: string): string[] {
  const segments = path
    .replace(/\.[^/.]+$/, "")
    .split("/")
    .filter(Boolean);

  if (segments.at(-1) === "index") segments.pop();

  return segments;
}
