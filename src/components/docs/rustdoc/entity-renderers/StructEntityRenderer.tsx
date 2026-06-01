import {
  Badge,
  EntityDeclaration,
  EntityDocs,
  EntityScaffold,
} from "./EntityRendererParts";
import { ImplementationsList } from "./ImplementationsList";
import { getGenericParamCount } from "./rustdoc-format";
import type { RustdocEntity } from "./types";

export function StructEntityRenderer({ entity }: { entity: RustdocEntity }) {
  const genericParams = getGenericParamCount(entity);

  return (
    <EntityScaffold entity={entity} label="struct">
      <EntityDeclaration entity={entity} />
      <div className="flex flex-wrap gap-2">
        {entity.deprecation?.note && (
          <Badge tone="warning">{entity.deprecation.note}</Badge>
        )}
        <Badge muted>
          {genericParams} generic parameter{genericParams === 1 ? "" : "s"}
        </Badge>
      </div>
      <ImplementationsList groups={entity.impls} />
      <EntityDocs docs={entity.docs} />
    </EntityScaffold>
  );
}
