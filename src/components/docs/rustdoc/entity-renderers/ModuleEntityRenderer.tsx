import {
  EntityDeclaration,
  EntityDocs,
  EntityScaffold,
} from "./EntityRendererParts";
import type { RustdocEntity } from "./types";

export function ModuleEntityRenderer({ entity }: { entity: RustdocEntity }) {
  return (
    <EntityScaffold entity={entity} label="module">
      <EntityDeclaration entity={entity} />
      <EntityDocs docs={entity.docs} />
    </EntityScaffold>
  );
}
