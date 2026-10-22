import type {
  InferMetaType,
  InferPageType,
  LoaderOutput,
} from "fumadocs-core/source";
import { loader, source } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";

import type { CacheAdapter, CacheEntryMetadata } from "@/lib/rustdoc/cache";
import { normalizeRustdocJson } from "@/lib/rustdoc/normalize-rustdoc-json";

const CACHE_KEY_PREFIX = "rustdoc";

export interface RustdocPageData {
  title: string;
  description?: string;
  icon?: string;
  body: RustdocEntityData | unknown;
}

export interface RustdocEntityData {
  id?: string;
  kind: string;
  name?: string | null;
  path?: string;
  docs?: string;
  visibility?: unknown;
  deprecation?: {
    since?: string | null;
    note?: string | null;
  } | null;
  inner?: Record<string, unknown>;
  crate_version?: string;
  format_version?: number;
  source?: string;
  impls?: RustdocImplGroups;
  implementations?: RustdocImplGroups;
}

export interface RustdocImplGroups {
  inherent: RustdocImplSummary[];
  trait: RustdocImplSummary[];
  autoTrait: RustdocImplSummary[];
  blanket: RustdocImplSummary[];
}

export interface RustdocImplSummary {
  id: string;
  group: keyof RustdocImplGroups;
  summary: string;
  target: string;
  traitName?: string;
  link?: string;
  traitLink?: string;
  items: Array<{
    id: string;
    name?: string | null;
    kind?: string;
  }>;
  isUnsafe: boolean;
  isNegative: boolean;
  isSynthetic: boolean;
  isBlanket: boolean;
}

export interface RustdocMetaData {
  root?: boolean;
  title?: string;
  icon?: string;
  pages?: string[];
  description?: string;
  defaultOpen?: boolean;
  collapsible?: boolean;
}

export interface RustdocSourceJson {
  pages: Array<{
    path: string;
    slugs?: string[];
    data: RustdocPageData;
  }>;
  metas: Array<{
    path: string;
    data: RustdocMetaData;
  }>;
}

export interface RustdocSourceConfig {
  slug: string;
  url: string;
}

export type RustdocLoader = LoaderOutput<{
  page: InferPageType<ReturnType<typeof createRustdocLoader>>;
  meta: InferMetaType<ReturnType<typeof createRustdocLoader>>;
  i18n: undefined;
}>;

export type RustdocPage = InferPageType<ReturnType<typeof createRustdocLoader>>;
export type RustdocMeta = InferMetaType<ReturnType<typeof createRustdocLoader>>;

export interface RustdocLoadResult {
  loader: ReturnType<typeof createRustdocLoader>;
  fromCache: boolean;
}

function createRustdocLoader(
  config: RustdocSourceConfig,
  json: RustdocSourceJson,
) {
  return loader({
    baseUrl: getRustdocSourceBaseUrl(config),
    source: source<RustdocPageData, RustdocMetaData>({
      pages: json.pages.map((page) => ({
        type: "page",
        path: page.path,
        slugs: page.slugs,
        data: page.data,
      })),
      metas: json.metas.map((meta) => ({
        type: "meta",
        path: meta.path,
        data: meta.data,
      })),
    }),
    pageTree: {
      idPrefix: config.slug,
    },
    plugins: [lucideIconsPlugin()],
  });
}

export async function loadRustdocSource(
  config: RustdocSourceConfig,
  cache: CacheAdapter,
): Promise<RustdocLoadResult> {
  const { json, fromCache } = await fetchRustdocJson(config, cache);

  return {
    loader: createRustdocLoader(config, json),
    fromCache,
  };
}

async function fetchRustdocJson(
  config: RustdocSourceConfig,
  cache: CacheAdapter,
): Promise<{ json: RustdocSourceJson; fromCache: boolean }> {
  const cacheKey = getRustdocCacheKey(config);
  const cached = await cache.get<RustdocSourceJson>(cacheKey);

  try {
    if (cached && (await canReuseCachedRustdoc(config, cached.metadata))) {
      return { json: cached.value, fromCache: true };
    }

    const response = await fetch(config.url);
    if (!response.ok) {
      throw new Error(`Failed to load rustdoc JSON: ${response.status}`);
    }

    const json = normalizeRustdocJson(await response.json());
    await cache.set(cacheKey, json, getResponseCacheMetadata(response));

    return { json, fromCache: false };
  } catch (error) {
    if (cached) return { json: cached.value, fromCache: true };
    throw error;
  }
}

export function getRustdocCacheKey(config: RustdocSourceConfig): string {
  return `${CACHE_KEY_PREFIX}::${config.slug}`;
}

export function getRustdocSourceBaseUrl(
  config: RustdocSourceConfig,
): `/docs/${string}` {
  return `/docs/${config.slug}`;
}

export function getRustdocSourceSlugPrefix(
  config: RustdocSourceConfig,
): string[] {
  return config.slug.split("/").filter(Boolean);
}

export function getRustdocSourceForSlug(
  sources: RustdocSourceConfig[],
  slug: string[] | undefined,
): RustdocSourceConfig | undefined {
  if (!slug || slug.length === 0) return undefined;

  return sources.find((sourceConfig) => {
    const prefix = getRustdocSourceSlugPrefix(sourceConfig);
    return prefix.every((part, index) => slug[index] === part);
  });
}

export function getRustdocPageSlug(
  sourceConfig: RustdocSourceConfig,
  slug: string[],
): string[] {
  return slug.slice(getRustdocSourceSlugPrefix(sourceConfig).length);
}

async function canReuseCachedRustdoc(
  config: RustdocSourceConfig,
  cachedMetadata: CacheEntryMetadata | undefined,
): Promise<boolean> {
  const latestMetadata = await loadRustdocCacheMetadata(config);
  if (!latestMetadata) return false;

  if (cachedMetadata?.etag && latestMetadata.etag) {
    return cachedMetadata.etag === latestMetadata.etag;
  }

  if (cachedMetadata?.lastModified && latestMetadata.lastModified) {
    return cachedMetadata.lastModified === latestMetadata.lastModified;
  }

  return isFreshByCacheLifetime(latestMetadata);
}

async function loadRustdocCacheMetadata(
  config: RustdocSourceConfig,
): Promise<CacheEntryMetadata | undefined> {
  const response = await fetch(config.url, { method: "HEAD" });
  if (!response.ok) return undefined;

  return getResponseCacheMetadata(response);
}

function getResponseCacheMetadata(response: Response): CacheEntryMetadata {
  return {
    etag: response.headers.get("etag") ?? undefined,
    lastModified: response.headers.get("last-modified") ?? undefined,
    cacheControl: response.headers.get("cache-control") ?? undefined,
    expires: response.headers.get("expires") ?? undefined,
  };
}

function isFreshByCacheLifetime(metadata: CacheEntryMetadata): boolean {
  if (metadata.cacheControl?.includes("no-cache")) return false;
  if (metadata.cacheControl?.includes("no-store")) return false;
  if (metadata.cacheControl?.includes("immutable")) return true;

  const expiresAt = metadata.expires
    ? Date.parse(metadata.expires)
    : Number.NaN;
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
