import { describe, expect, it, vi } from "vitest";

import { createStore } from "./create-store";

describe("createStore", () => {
  it("변경 전까지 같은 스냅샷 참조를 반환한다", () => {
    const store = createStore([1, 2]);
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it("setSnapshot 시 구독자에게 알린다", () => {
    const store = createStore(0);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setSnapshot(1);
    expect(listener).toHaveBeenCalledOnce();
    expect(store.getSnapshot()).toBe(1);
  });

  it("같은 값이면 알리지 않는다", () => {
    const store = createStore(1);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setSnapshot(1);
    expect(listener).not.toHaveBeenCalled();
  });

  it("구독 해제 후에는 알리지 않는다", () => {
    const store = createStore(0);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setSnapshot(1);
    expect(listener).not.toHaveBeenCalled();
  });
});
