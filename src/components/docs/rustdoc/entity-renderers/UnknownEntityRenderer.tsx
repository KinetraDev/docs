import {
  EntityDeclaration,
  EntityDocs,
  EntityScaffold,
} from "./EntityRendererParts";
import type { RustdocEntity } from "./types";

export function UnknownEntityRenderer({ entity }: { entity: RustdocEntity }) {
  return (
    <EntityScaffold entity={entity} label={entity.kind}>
      <EntityDeclaration entity={entity} />
      <EntityDocs docs={entity.docs} />
    </EntityScaffold>
  );
}
