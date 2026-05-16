"use client";

import { buttonVariants } from "fumadocs-ui/components/ui/button";

import { RustdocPageSkeleton } from "./RustdocPageSkeleton";

interface RustdocLoadingStateProps {
  error?: string;
  onRetry?: () => void;
}

export function RustdocLoadingState({
  error,
  onRetry,
}: RustdocLoadingStateProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-fd-border bg-fd-card p-6">
        <h2 className="font-semibold text-fd-foreground">
          Rustdoc unavailable
        </h2>
        <p className="mt-2 text-sm text-fd-muted-foreground">{error}</p>
        {onRetry && (
          <button
            className={buttonVariants({
              className: "mt-4",
              size: "sm",
            })}
            type="button"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return <RustdocPageSkeleton />;
}
