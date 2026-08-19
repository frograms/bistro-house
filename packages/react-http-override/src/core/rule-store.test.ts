import { describe, expect, it, vi } from "vitest";

import { createRuleStore } from "./rule-store";
import { createMemoryStorage } from "./safe-storage";

const STORAGE_KEY = "__HTTP_OVERRIDE_RULES__";

describe("createRuleStore", () => {
  it("add는 id를 생성하고 storage에 영속한다", () => {
    const storage = createMemoryStorage();
    const store = createRuleStore(storage);
    const rule = store.add({ pattern: "users", status: 500 });
    expect(rule.id).toBeTruthy();
    expect(store.getSnapshot()).toEqual([rule]);
    expect(JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]")).toEqual([rule]);
  });

  it("같은 storage로 새로 만들면 룰이 복원된다", () => {
    const storage = createMemoryStorage();
    const rule = createRuleStore(storage).add({ pattern: "users", status: 500 });
    expect(createRuleStore(storage).getSnapshot()).toEqual([rule]);
  });

  it("update / remove / clear", () => {
    const store = createRuleStore(createMemoryStorage());
    const rule = store.add({ pattern: "users", status: 500 });
    store.update(rule.id, { delayMs: 100, status: undefined });
    expect(store.getSnapshot()[0]).toMatchObject({
      delayMs: 100,
      id: rule.id,
      status: undefined,
    });
    store.remove(rule.id);
    expect(store.getSnapshot()).toEqual([]);
    store.add({ pattern: "a" });
    store.clear();
    expect(store.getSnapshot()).toEqual([]);
  });

  it("깨진 저장 데이터는 빈 목록으로 복원한다", () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, "not-json{");
    expect(createRuleStore(storage).getSnapshot()).toEqual([]);
    storage.setItem(STORAGE_KEY, JSON.stringify([{ pattern: 1 }, null]));
    expect(createRuleStore(storage).getSnapshot()).toEqual([]);
  });

  it("변경 시 구독자에게 알린다", () => {
    const store = createRuleStore(createMemoryStorage());
    const listener = vi.fn();
    store.subscribe(listener);
    store.add({ pattern: "users" });
    expect(listener).toHaveBeenCalledOnce();
  });
});
