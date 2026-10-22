import {
  Badge,
  EntityDeclaration,
  EntityDocs,
  EntityScaffold,
} from "./EntityRendererParts";
import { getGenericParamCount, getKindInner } from "./rustdoc-format";
import type { RustdocEntity } from "./types";

export function FunctionEntityRenderer({ entity }: { entity: RustdocEntity }) {
  const inner = getKindInner(entity) as
    | {
        header?: {
          is_async?: boolean;
          is_const?: boolean;
          is_unsafe?: boolean;
        };
        sig?: { inputs?: unknown[] };
      }
    | undefined;
  const genericParams = getGenericParamCount(entity);

  return (
    <EntityScaffold entity={entity} label="function">
      <EntityDeclaration entity={entity} />
      <div className="flex flex-wrap gap-2">
        {inner?.header?.is_const && <Badge>const</Badge>}
        {inner?.header?.is_async && <Badge>async</Badge>}
        {inner?.header?.is_unsafe && <Badge tone="warning">unsafe</Badge>}
        <Badge muted>{inner?.sig?.inputs?.length ?? 0} parameters</Badge>
        <Badge muted>
          {genericParams} generic parameter{genericParams === 1 ? "" : "s"}
        </Badge>
      </div>
      <EntityDocs docs={entity.docs} />
    </EntityScaffold>
  );
}
