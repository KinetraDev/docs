"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";

import { Badge } from "./EntityRendererParts";
import type { RustdocImplGroups, RustdocImplSummary } from "./types";
import { SafeLink } from "@/components/shared/SafeLink";

const GROUPS: Array<{
  key: keyof RustdocImplGroups;
  title: string;
}> = [
  { key: "inherent", title: "Inherent implementations" },
  { key: "trait", title: "Trait implementations" },
  { key: "autoTrait", title: "Auto trait implementations" },
  { key: "blanket", title: "Blanket implementations" },
];

export function ImplementationsList({
  groups,
  title = "Implementations",
}: {
  groups?: RustdocImplGroups;
  title?: string;
}) {
  const pathname = usePathname();
  const sourceSlug = pathname.split("/").filter(Boolean)[1];

  if (!groups) return null;

  const nonEmptyGroups = GROUPS.map((group) => ({
    ...group,
    items: groups[group.key] ?? [],
  })).filter((group) => group.items.length > 0);

  if (nonEmptyGroups.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2">
        {nonEmptyGroups.map((group) => (
          <details
            className="rounded-lg border bg-fd-card p-4"
            key={group.key}
            open={group.key === "inherent" || group.key === "trait"}
          >
            <summary className="cursor-pointer font-medium">
              {group.title}{" "}
              <span className="text-fd-muted-foreground">
                ({group.items.length})
              </span>
            </summary>
            <div className="mt-4 divide-y">
              {group.items.map((item) => (
                <ImplementationRow
                  item={item}
                  key={item.id}
                  sourceSlug={sourceSlug}
                />
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function ImplementationRow({
  item,
  sourceSlug,
}: {
  item: RustdocImplSummary;
  sourceSlug: string | undefined;
}) {
  return (
    <div className="space-y-2 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded bg-fd-muted px-1.5 py-1 font-mono text-sm">
          {item.summary}
        </code>
        {item.isUnsafe && <Badge tone="warning">unsafe</Badge>}
        {item.isNegative && <Badge tone="warning">negative</Badge>}
        {item.isSynthetic && <Badge muted>synthetic</Badge>}
        {item.isBlanket && <Badge muted>blanket</Badge>}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {sourceSlug && item.link && (
          <SafeLink
            className="text-fd-primary underline-offset-4 hover:underline"
            href={`/docs/${sourceSlug}/${item.link}` as Route}
          >
            Target: {item.target}
          </SafeLink>
        )}
        {sourceSlug && item.traitLink && item.traitName && (
          <SafeLink
            className="text-fd-primary underline-offset-4 hover:underline"
            href={`/docs/${sourceSlug}/${item.traitLink}` as Route}
          >
            Trait: {item.traitName}
          </SafeLink>
        )}
        {item.items.length > 0 && (
          <span className="text-fd-muted-foreground">
            {item.items.length} item{item.items.length === 1 ? "" : "s"}:{" "}
            {item.items
              .map((implItem) => implItem.name)
              .filter(Boolean)
              .join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
