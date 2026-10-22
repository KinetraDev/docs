"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Folder, Root } from "fumadocs-core/page-tree";

import {
  type CacheAdapter,
  localStorageCacheAdapter,
} from "@/lib/rustdoc/cache";
import {
  getRustdocPageSlug,
  getRustdocSourceForSlug,
  loadRustdocSource,
  type RustdocLoader,
  type RustdocPage,
  type RustdocSourceConfig,
} from "@/lib/rustdoc/rustdoc";
import { mergeRustdocTrees, toRustdocFolder } from "@/lib/rustdoc/utils";

export type RustdocLoadState =
  | { status: "idle" }
  | { status: "loading-from-network" }
  | { status: "ready"; fromCache: boolean }
  | { status: "error"; error: string };

interface RustdocPageMatch {
  page: RustdocPage;
  source: RustdocSourceConfig;
  loader: RustdocLoader;
}

interface RustdocContextValue {
  sources: RustdocSourceConfig[];
  states: Record<string, RustdocLoadState>;
  loaders: Record<string, RustdocLoader>;
  mergedTree: Root;
  reloadSource: (sourceSlug: string) => Promise<void>;
  getPageBySlug: (slug: string[]) => RustdocPageMatch | undefined;
  getNodeSection: (node: { $ref?: string; $id?: string }) => string | undefined;
}

const RustdocContext = createContext<RustdocContextValue | null>(null);

interface RustdocProviderProps {
  children: ReactNode;
  staticTree: Root;
  sources: RustdocSourceConfig[];
  cache?: CacheAdapter;
}

export function RustdocProvider({
  children,
  staticTree,
  sources,
  cache = localStorageCacheAdapter,
}: RustdocProviderProps) {
  const [states, setStates] = useState<Record<string, RustdocLoadState>>(() =>
    Object.fromEntries(
      sources.map((source) => [source.slug, { status: "idle" }]),
    ),
  );
  const [loaders, setLoaders] = useState<Record<string, RustdocLoader>>({});
  const pathname = usePathname();

  const loadSource = useCallback(
    async (sourceConfig: RustdocSourceConfig) => {
      setStates((current) => ({
        ...current,
        [sourceConfig.slug]: { status: "loading-from-network" },
      }));

      try {
        const result = await loadRustdocSource(sourceConfig, cache);
        setLoaders((current) => ({
          ...current,
          [sourceConfig.slug]: result.loader,
        }));
        setStates((current) => ({
          ...current,
          [sourceConfig.slug]: {
            status: "ready",
            fromCache: result.fromCache,
          },
        }));
      } catch (error) {
        setStates((current) => ({
          ...current,
          [sourceConfig.slug]: {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        }));
      }
    },
    [cache],
  );

  useEffect(() => {
    let cancelled = false;

    setStates((current) => ({
      ...Object.fromEntries(
        sources.map((source) => [
          source.slug,
          current[source.slug] ?? { status: "idle" },
        ]),
      ),
    }));

    for (const sourceConfig of sources) {
      if (cancelled) break;
      void loadSource(sourceConfig);
    }

    return () => {
      cancelled = true;
    };
  }, [loadSource, sources]);

  const runtimeFoldersBySlug = useMemo(() => {
    const out: Record<string, Folder> = {};

    for (const sourceConfig of sources) {
      const loader = loaders[sourceConfig.slug];
      if (loader) out[sourceConfig.slug] = toRustdocFolder(loader);
    }

    return out;
  }, [loaders, sources]);

  const rustdocSourceSlugs = useMemo(
    () => sources.map((source) => source.slug),
    [sources],
  );

  const loadingUrlsBySlug = useMemo(() => {
    const out: Record<string, string | undefined> = {};

    for (const source of sources) {
      if (loaders[source.slug]) continue;
      const prefix = `/docs/${source.slug}`;
      if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
        out[source.slug] = pathname;
      }
    }

    return out;
  }, [loaders, pathname, sources]);

  const mergedTree = useMemo(
    () =>
      mergeRustdocTrees(
        staticTree,
        runtimeFoldersBySlug,
        rustdocSourceSlugs,
        loadingUrlsBySlug,
      ),
    [loadingUrlsBySlug, runtimeFoldersBySlug, rustdocSourceSlugs, staticTree],
  );

  const reloadSource = useCallback(
    async (sourceSlug: string) => {
      const sourceConfig = sources.find((source) => source.slug === sourceSlug);
      if (sourceConfig) await loadSource(sourceConfig);
    },
    [loadSource, sources],
  );

  const getPageBySlug = useCallback(
    (slug: string[]): RustdocPageMatch | undefined => {
      const sourceConfig = getRustdocSourceForSlug(sources, slug);
      if (!sourceConfig) return undefined;

      const rustdocLoader = loaders[sourceConfig.slug];
      if (!rustdocLoader) return undefined;

      const page = rustdocLoader.getPage(
        getRustdocPageSlug(sourceConfig, slug),
      );
      if (!page) return undefined;

      return { page, source: sourceConfig, loader: rustdocLoader };
    },
    [loaders, sources],
  );

  const getNodeSection = useCallback(
    (node: { $ref?: string; $id?: string }) => {
      const sourceConfig = sources.find((source) =>
        node.$id?.startsWith(source.slug),
      );
      if (sourceConfig) return sourceConfig.slug;

      if (node.$ref) return node.$ref.split("/")[0];
    },
    [sources],
  );

  const value = useMemo<RustdocContextValue>(
    () => ({
      sources,
      states,
      loaders,
      mergedTree,
      reloadSource,
      getPageBySlug,
      getNodeSection,
    }),
    [
      sources,
      states,
      loaders,
      mergedTree,
      reloadSource,
      getPageBySlug,
      getNodeSection,
    ],
  );

  return (
    <RustdocContext.Provider value={value}>{children}</RustdocContext.Provider>
  );
}

export function useRustdoc() {
  const context = useContext(RustdocContext);
  if (!context) {
    throw new Error("useRustdoc must be used inside RustdocProvider");
  }

  return context;
}
