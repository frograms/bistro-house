import type { HttpOverrideCacheAdapter } from "./core";

export type SwrLikeCache = {
  get(key: string): unknown;
  keys(): IterableIterator<string>;
};

export type SwrLikeMutate = (key: string) => unknown;

type SwrState = {
  data?: unknown;
  error?: unknown;
  isValidating?: boolean;
};

export const createSwrAdapter = ({
  cache,
  fallback,
  mutate,
}: {
  cache: SwrLikeCache;
  fallback?: Record<string, unknown>;
  mutate: SwrLikeMutate;
}): {
  cacheAdapter: HttpOverrideCacheAdapter;
  onRevalidate: (key: string) => void;
} => ({
  cacheAdapter: {
    getEntries: () =>
      [...cache.keys()].map((key) => {
        const state = (cache.get(key) ?? {}) as SwrState;
        if (
          state.data === undefined &&
          fallback !== undefined &&
          key in fallback
        ) {
          return {
            data: fallback[key],
            error: state.error,
            isFallback: true,
            isValidating: state.isValidating,
            key,
          };
        }
        return {
          data: state.data,
          error: state.error,
          isValidating: state.isValidating,
          key,
        };
      }),
  },
  onRevalidate: (url) => {
    for (const key of cache.keys()) {
      if (key.includes(url)) void mutate(key);
    }
  },
});
