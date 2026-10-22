"use client";

import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";

import { RustdocJsonRenderer } from "./RustdocJsonRenderer";
import { RustdocLoadingState } from "./RustdocLoadingState";
import { useRustdoc } from "./RustdocProvider";
import { getRustdocSourceForSlug } from "@/lib/rustdoc/rustdoc";

interface RustdocPageProps {
  slug: string[];
}

export function RustdocPage({ slug }: RustdocPageProps) {
  const { sources, states, getPageBySlug, reloadSource } = useRustdoc();
  const source = getRustdocSourceForSlug(sources, slug);

  if (!source) {
    return (
      <DocsPage tableOfContent={{ enabled: false }}>
        <DocsBody>
          <RustdocLoadingState error="Rustdoc source is not configured." />
        </DocsBody>
      </DocsPage>
    );
  }

  const state = states[source.slug] ?? { status: "idle" };
  const match = getPageBySlug(slug);

  if (!match) {
    return (
      <DocsPage tableOfContent={{ enabled: false }}>
        <DocsBody>
          <RustdocLoadingState
            error={state.status === "error" ? state.error : undefined}
            onRetry={() => void reloadSource(source.slug)}
          />
        </DocsBody>
      </DocsPage>
    );
  }

  return (
    <DocsPage tableOfContent={{ enabled: false }}>
      <DocsTitle>{match.page.data.title}</DocsTitle>
      {match.page.data.description && (
        <DocsDescription>{match.page.data.description}</DocsDescription>
      )}
      <DocsBody className="docs-body">
        <RustdocJsonRenderer data={match.page.data.body} />
      </DocsBody>
    </DocsPage>
  );
}
