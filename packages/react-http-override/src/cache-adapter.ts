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
  mutate,
}: {
  cache: SwrLikeCache;
  mutate: SwrLikeMutate;
}): {
  cacheAdapter: HttpOverrideCacheAdapter;
  onRevalidate: (key: string) => void;
} => ({
  cacheAdapter: {
    getEntries: () =>
      [...cache.keys()].map((key) => {
        const state = (cache.get(key) ?? {}) as SwrState;
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