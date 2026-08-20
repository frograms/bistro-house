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
  // 기록 url(절대/상대)과 캐시 키(절대/상대)의 조합이 어긋나도 매칭되도록 수정
  onRevalidate: (url) => {
    const needles = new Set<string>([url, url.split("?")[0] ?? ""]);
    try {
      const parsed = new URL(url);
      needles.add(`${parsed.pathname}${parsed.search}`);
      needles.add(parsed.pathname);
    } catch {
    }
    needles.delete("");
    for (const key of cache.keys()) {
      const matched = [...needles].some((needle) => key.includes(needle));
      if (matched) void mutate(key);
    }
  },
});
