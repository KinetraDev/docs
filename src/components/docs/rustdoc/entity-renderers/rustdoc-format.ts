import type { RustdocEntity } from "./types";

interface FunctionInner {
  sig?: {
    inputs?: Array<[string, unknown]>;
    output?: unknown;
  };
  generics?: Generics;
  header?: {
    is_async?: boolean;
    is_const?: boolean;
    is_unsafe?: boolean;
  };
}

interface Generics {
  params?: Array<{
    name: string;
    kind?: Record<string, unknown>;
  }>;
}

export function getDisplayName(entity: RustdocEntity): string {
  if (entity.kind === "crate") return entity.name ?? "crate";
  return entity.name ?? entity.path?.split("::").at(-1) ?? entity.id ?? "item";
}

export function getVisibility(entity: RustdocEntity): string {
  if (entity.visibility === "public") return "pub";
  if (typeof entity.visibility === "string") return entity.visibility;
  if (!entity.visibility) return "";

  return "pub";
}

export function getEntityDeclaration(entity: RustdocEntity): string {
  const visibility = getVisibility(entity);
  const prefix = visibility ? `${visibility} ` : "";
  const name = getDisplayName(entity);

  switch (entity.kind) {
    case "crate":
      return `crate ${name};`;
    case "module":
      return `${prefix}mod ${name};`;
    case "struct":
      return `${prefix}struct ${name}${renderGenerics(getInnerGenerics(entity, "struct"))};`;
    case "trait":
      return `${prefix}trait ${name}${renderGenerics(getInnerGenerics(entity, "trait"))} { ... }`;
    case "function":
      return renderFunctionDeclaration(entity, prefix);
    default:
      return `${prefix}${entity.kind} ${name};`;
  }
}

export function getKindInner(entity: RustdocEntity): unknown {
  return entity.inner?.[entity.kind];
}

export function getGenericParamCount(entity: RustdocEntity): number {
  const inner = getKindInner(entity) as { generics?: Generics } | undefined;
  return inner?.generics?.params?.length ?? 0;
}

function getInnerGenerics(
  entity: RustdocEntity,
  kind: string,
): Generics | undefined {
  const inner = entity.inner?.[kind] as { generics?: Generics } | undefined;
  return inner?.generics;
}

function renderFunctionDeclaration(
  entity: RustdocEntity,
  prefix: string,
): string {
  const functionInner = getKindInner(entity) as FunctionInner | undefined;
  const header = functionInner?.header;
  const qualifiers = [
    prefix.trim(),
    header?.is_const ? "const" : undefined,
    header?.is_unsafe ? "unsafe" : undefined,
    header?.is_async ? "async" : undefined,
    "fn",
  ].filter(Boolean);
  const inputs =
    functionInner?.sig?.inputs
      ?.map(([name, type]) => `${name}: ${renderRustType(type)}`)
      .join(", ") ?? "";
  const output = functionInner?.sig?.output
    ? ` -> ${renderRustType(functionInner.sig.output)}`
    : "";

  return `${qualifiers.join(" ")} ${getDisplayName(entity)}${renderGenerics(functionInner?.generics)}(${inputs})${output};`;
}

function renderGenerics(generics: Generics | undefined): string {
  const params = generics?.params?.map(renderGenericParam).filter(Boolean);
  return params?.length ? `<${params.join(", ")}>` : "";
}

function renderGenericParam(param: {
  name: string;
  kind?: Record<string, unknown>;
}) {
  if (!param.kind) return param.name;
  if ("const" in param.kind) return `const ${param.name}`;
  return param.name;
}

function renderRustType(type: unknown): string {
  if (typeof type === "string") return type;
  if (!type || typeof type !== "object") return "()";

  const value = type as Record<string, unknown>;
  if (typeof value.primitive === "string") return value.primitive;
  if (typeof value.generic === "string") return value.generic;
  if ("unit" in value) return "()";

  if (isRecord(value.resolved_path)) {
    return String(value.resolved_path.path ?? "Self");
  }

  if (isRecord(value.borrowed_ref)) {
    const inner = value.borrowed_ref;
    const mutable = inner.is_mutable ? "mut " : "";
    return `&${mutable}${renderRustType(inner.type)}`;
  }

  if (Array.isArray(value.tuple)) {
    return `(${value.tuple.map(renderRustType).join(", ")})`;
  }

  if (isRecord(value.slice)) {
    return `[${renderRustType(value.slice)}]`;
  }

  if (isRecord(value.array)) {
    return `[${renderRustType(value.array.type)}; ${String(value.array.len ?? "_")}]`;
  }

  return "...";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
