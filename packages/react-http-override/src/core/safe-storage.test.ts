import { describe, expect, it } from "vitest";

import { createMemoryStorage, createSafeStorage } from "./safe-storage";

describe("createSafeStorage", () => {
  it("backing store가 있으면 그대로 읽고 쓴다", () => {
    const backing = createMemoryStorage();
    const storage = createSafeStorage(() => backing);
    storage.setItem("key", "value");
    expect(backing.getItem("key")).toBe("value");
    expect(storage.getItem("key")).toBe("value");
    storage.removeItem("key");
    expect(backing.getItem("key")).toBeNull();
  });

  it("backing store 접근이 throw하면 인메모리로 폴백한다", () => {
    const storage = createSafeStorage(() => {
      throw new Error("SecurityError");
    });
    storage.setItem("key", "value");
    expect(storage.getItem("key")).toBe("value");
  });

  it("backing store 쓰기가 throw해도 인메모리에는 남는다", () => {
    const backing = createMemoryStorage();
    const storage = createSafeStorage(() => ({
      ...backing,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    }));
    storage.setItem("key", "value");
    expect(storage.getItem("key")).toBe("value");
  });

  it("backing store가 undefined면 인메모리로 동작한다", () => {
    const storage = createSafeStorage(() => undefined);
    storage.setItem("key", "value");
    expect(storage.getItem("key")).toBe("value");
    storage.removeItem("key");
    expect(storage.getItem("key")).toBeNull();
  });
});
