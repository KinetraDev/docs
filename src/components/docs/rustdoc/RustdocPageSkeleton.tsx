"use client";

const skeletonRows = ["w-full", "w-11/12", "w-10/12", "w-8/12"] as const;

export function RustdocPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-9 w-72 animate-pulse rounded-md bg-fd-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-fd-muted" />
      </div>

      <div className="space-y-3">
        {skeletonRows.map((width) => (
          <div
            className={`${width} h-4 animate-pulse rounded bg-fd-muted`}
            key={width}
          />
        ))}
      </div>

      <div className="space-y-3 rounded-lg border border-fd-border p-4">
        <div className="h-4 w-28 animate-pulse rounded bg-fd-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-fd-muted" />
      </div>
    </div>
  );
}
