export interface CacheEntry<T> {
  value: T;
  storedAt: number;
  metadata?: CacheEntryMetadata;
}

export interface CacheEntryMetadata {
  etag?: string;
  lastModified?: string;
  cacheControl?: string;
  expires?: string;
}

export interface CacheAdapter {
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, value: T, metadata?: CacheEntryMetadata): Promise<void>;
  delete(key: string): Promise<void>;
}

export function createMemoryCacheAdapter(): CacheAdapter {
  const store = new Map<string, CacheEntry<unknown>>();

  return {
    async get<T>(key: string) {
      return (store.get(key) as CacheEntry<T> | undefined) ?? null;
    },
    async set<T>(key: string, value: T, metadata?: CacheEntryMetadata) {
      store.set(key, { value, storedAt: Date.now(), metadata });
    },
    async delete(key: string) {
      store.delete(key);
    },
  };
}

export const memoryCacheAdapter = createMemoryCacheAdapter();

export const localStorageCacheAdapter: CacheAdapter = {
  async get<T>(key: string) {
    if (typeof window === "undefined") return memoryCacheAdapter.get<T>(key);

    try {
      const value = window.localStorage.getItem(key);
      if (!value) return null;

      return JSON.parse(value) as CacheEntry<T>;
    } catch {
      return null;
    }
  },
  async set<T>(key: string, value: T, metadata?: CacheEntryMetadata) {
    if (typeof window === "undefined") {
      await memoryCacheAdapter.set(key, value, metadata);
      return;
    }

    try {
      const entry: CacheEntry<T> = { value, storedAt: Date.now(), metadata };
      window.localStorage.setItem(key, JSON.stringify(entry));
    } catch {}
  },
  async delete(key: string) {
    if (typeof window === "undefined") {
      await memoryCacheAdapter.delete(key);
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};
