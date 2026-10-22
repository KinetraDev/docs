import {
  Badge,
  EntityDeclaration,
  EntityDocs,
  EntityScaffold,
} from "./EntityRendererParts";
import type { RustdocEntity } from "./types";

export function CrateEntityRenderer({ entity }: { entity: RustdocEntity }) {
  return (
    <EntityScaffold entity={entity} label="crate">
      <div className="flex flex-wrap gap-2">
        {entity.crate_version && <Badge>version {entity.crate_version}</Badge>}
        {entity.format_version && (
          <Badge muted>rustdoc format {entity.format_version}</Badge>
        )}
      </div>
      <EntityDeclaration entity={entity} />
      <EntityDocs docs={entity.docs} />
    </EntityScaffold>
  );
}
