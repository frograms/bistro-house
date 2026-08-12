export type FetchDevtoolsCacheEntry = {
  data?: unknown;
  error?: unknown;
  isValidating?: boolean;
  key: string;
};

export type FetchDevtoolsCacheAdapter = {
  getEntries(): FetchDevtoolsCacheEntry[];
};

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
  cacheAdapter: FetchDevtoolsCacheAdapter;
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
  onRevalidate: (key) => {
    void mutate(key);
  },
});