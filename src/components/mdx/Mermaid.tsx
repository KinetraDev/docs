"use client";

import { type FunctionComponent, use, useEffect, useId, useState } from "react";

import { useTheme } from "next-themes";

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(
  key: string,
  setPromise: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const promise = setPromise();
  cache.set(key, promise);

  return promise;
}

type MermaidContentProps = {
  chart: string;
};

const MermaidContent: FunctionComponent<MermaidContentProps> = ({ chart }) => {
  const id = useId();
  const { resolvedTheme, systemTheme, theme } = useTheme();
  const { default: mermaid } = use(
    cachePromise("mermaid", () => import("mermaid")),
  );

  const currentTheme = resolvedTheme || systemTheme || theme || "light";

  // clear cache when theme changes to force re-render
  useEffect(() => {
    const cacheKey = `${chart}-${currentTheme}`;
    if (cache.has(cacheKey)) {
      cache.delete(cacheKey);
    }
  }, [chart, currentTheme]);

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    fontFamily: "inherit",
    themeCSS: `
      margin: 1.5rem auto 0;
    `,
    theme: currentTheme === "dark" ? "dark" : "default",
  });

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${currentTheme}`, () => {
      return mermaid.render(id, chart.replaceAll("\\n", "\n"));
    }),
  );

  return (
    <div
      ref={(container) => {
        if (container) bindFunctions?.(container);
      }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid renders the SVG
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

type MermaidProps = {
  chart: string;
};

export const Mermaid: FunctionComponent<MermaidProps> = ({ chart }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return;
  return <MermaidContent chart={chart} />;
};
