import { createStore } from "./create-store";
import type { HttpOverrideStorage } from "./types";

const STORAGE_KEY = "__HTTP_OVERRIDE_PRESET_NAMES__";

export type PresetNameStore = {
  getSnapshot(): Record<string, string>;
  reset(id: string): void;
  set(id: string, name: string): void;
  subscribe(listener: () => void): () => void;
};

const loadNames = (
  storage: HttpOverrideStorage
): Record<string, string> => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const entries = Object.entries(parsed).filter(
      ([, value]) => typeof value === "string"
    );
    return Object.fromEntries(entries) as Record<string, string>;
  } catch {
    return {};
  }
};

export const createPresetNameStore = (
  storage: HttpOverrideStorage
): PresetNameStore => {
  const store = createStore<Record<string, string>>(loadNames(storage));

  const setNames = (names: Record<string, string>) => {
    store.setSnapshot(names);
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(names));
    } catch {
      // 실패해도 메모리 상태로 계속 동작
    }
  };

  return {
    getSnapshot: store.getSnapshot,
    reset: (id) => {
      const { [id]: removed, ...rest } = store.getSnapshot();
      if (removed === undefined) return;
      setNames(rest);
    },
    set: (id, name) => {
      setNames({ ...store.getSnapshot(), [id]: name });
    },
    subscribe: store.subscribe,
  };
};
