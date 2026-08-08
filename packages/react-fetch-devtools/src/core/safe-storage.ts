import type { FetchDevtoolsStorage } from "./types";

export const createMemoryStorage = (): FetchDevtoolsStorage => {
  const map = new Map<string, string>();

  return {
    getItem: (key) => map.get(key) ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
};

/** Web Storage가 없거나 throw하는 환경(일부 웹뷰나 시크릿 모드)에서는 인메모리로 폴백 */
export const createSafeStorage = (
  getBackingStore: () => FetchDevtoolsStorage | undefined
): FetchDevtoolsStorage => {
  const memory = createMemoryStorage();
  const backing = (): FetchDevtoolsStorage | undefined => {
    try {
      return getBackingStore();
    } catch {
      return undefined;
    }
  };

  return {
    getItem: (key) => {
      try {
        const value = backing()?.getItem(key);
        if (value !== undefined && value !== null) return value;
      } catch {
        // 폴백
      }
      return memory.getItem(key);
    },
    removeItem: (key) => {
      memory.removeItem(key);
      try {
        backing()?.removeItem(key);
      } catch {
        // 폴백
      }
    },
    setItem: (key, value) => {
      memory.setItem(key, value);
      try {
        backing()?.setItem(key, value);
      } catch {
        // 폴백
      }
    },
  };
};
