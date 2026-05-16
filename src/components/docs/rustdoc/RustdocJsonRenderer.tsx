"use client";

import { CrateEntityRenderer } from "./entity-renderers/CrateEntityRenderer";
import { FunctionEntityRenderer } from "./entity-renderers/FunctionEntityRenderer";
import { ModuleEntityRenderer } from "./entity-renderers/ModuleEntityRenderer";
import { StructEntityRenderer } from "./entity-renderers/StructEntityRenderer";
import { TraitEntityRenderer } from "./entity-renderers/TraitEntityRenderer";
import { isRustdocEntity } from "./entity-renderers/types";
import { UnknownEntityRenderer } from "./entity-renderers/UnknownEntityRenderer";

interface RustdocJsonRendererProps {
  data: unknown;
}

export function RustdocJsonRenderer({ data }: RustdocJsonRendererProps) {
  if (isRustdocEntity(data)) {
    switch (data.kind) {
      case "crate":
        return <CrateEntityRenderer entity={data} />;
      case "module":
        return <ModuleEntityRenderer entity={data} />;
      case "struct":
        return <StructEntityRenderer entity={data} />;
      case "trait":
        return <TraitEntityRenderer entity={data} />;
      case "function":
        return <FunctionEntityRenderer entity={data} />;
      default:
        return <UnknownEntityRenderer entity={data} />;
    }
  }

  return (
    <pre className="overflow-x-auto rounded-lg border bg-fd-card p-4 text-sm">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
