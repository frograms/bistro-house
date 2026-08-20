export type Store<T> = {
  getSnapshot(): T;
  setSnapshot(next: T): void;
  subscribe(listener: () => void): () => void;
};

export const createStore = <T>(initial: T): Store<T> => {
  let snapshot = initial;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    setSnapshot: (next) => {
      if (Object.is(next, snapshot)) return;
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
