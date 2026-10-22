export type RustdocEntityKind =
  | "crate"
  | "module"
  | "struct"
  | "trait"
  | "function";

export interface RustdocEntity {
  id?: string;
  kind: RustdocEntityKind | string;
  name?: string | null;
  path?: string;
  docs?: string;
  visibility?: unknown;
  deprecation?: {
    since?: string | null;
    note?: string | null;
  } | null;
  inner?: Record<string, unknown>;
  crate_version?: string;
  format_version?: number;
  source?: string;
  impls?: RustdocImplGroups;
  implementations?: RustdocImplGroups;
}

export interface RustdocImplGroups {
  inherent: RustdocImplSummary[];
  trait: RustdocImplSummary[];
  autoTrait: RustdocImplSummary[];
  blanket: RustdocImplSummary[];
}

export interface RustdocImplSummary {
  id: string;
  group: keyof RustdocImplGroups;
  summary: string;
  target: string;
  traitName?: string;
  link?: string;
  traitLink?: string;
  items: Array<{
    id: string;
    name?: string | null;
    kind?: string;
  }>;
  isUnsafe: boolean;
  isNegative: boolean;
  isSynthetic: boolean;
  isBlanket: boolean;
}

export function isRustdocEntity(value: unknown): value is RustdocEntity {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    typeof (value as { kind?: unknown }).kind === "string"
  );
}
