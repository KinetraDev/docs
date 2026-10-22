import {
  Badge,
  EntityDeclaration,
  EntityDocs,
  EntityScaffold,
} from "./EntityRendererParts";
import { ImplementationsList } from "./ImplementationsList";
import { getGenericParamCount, getKindInner } from "./rustdoc-format";
import type { RustdocEntity } from "./types";

export function TraitEntityRenderer({ entity }: { entity: RustdocEntity }) {
  const inner = getKindInner(entity) as
    | {
        is_auto?: boolean;
        is_dyn_compatible?: boolean;
        is_unsafe?: boolean;
        items?: unknown[];
        implementations?: unknown[];
        bounds?: unknown[];
      }
    | undefined;
  const genericParams = getGenericParamCount(entity);

  return (
    <EntityScaffold entity={entity} label="trait">
      <EntityDeclaration entity={entity} />
      <div className="flex flex-wrap gap-2">
        {inner?.is_auto && <Badge>auto trait</Badge>}
        {inner?.is_unsafe && <Badge tone="warning">unsafe</Badge>}
        {inner?.is_dyn_compatible === false && (
          <Badge muted>not dyn compatible</Badge>
        )}
        <Badge muted>
          {genericParams} generic parameter{genericParams === 1 ? "" : "s"}
        </Badge>
        <Badge muted>{inner?.bounds?.length ?? 0} bounds</Badge>
      </div>
      {inner?.items && inner.items.length > 0 && (
        <details className="rounded-lg border bg-fd-card p-4">
          <summary className="cursor-pointer font-medium">
            Required and provided items{" "}
            <span className="text-fd-muted-foreground">
              ({inner.items.length})
            </span>
          </summary>
          <p className="mt-4 text-sm text-fd-muted-foreground">
            This rustdoc payload exposes item IDs here; method-level pages can
            be added once the normalizer emits trait item documents.
          </p>
        </details>
      )}
      <ImplementationsList
        groups={entity.implementations}
        title="Implementors"
      />
      <EntityDocs docs={entity.docs} />
    </EntityScaffold>
  );
}
