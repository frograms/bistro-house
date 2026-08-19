import { describe, expect, it, vi } from "vitest";

import { createSwrAdapter } from "./cache-adapter";

describe("createSwrAdapter", () => {
  it("SWR 캐시 Map을 getEntries 형태로 변환한다", () => {
    const cache = new Map<string, unknown>([
      ["/settings", { data: { ok: true }, isValidating: false }],
      ["/fail", { error: new Error("boom") }],
    ]);
    const { cacheAdapter } = createSwrAdapter({ cache, mutate: () => {} });
    const entries = cacheAdapter.getEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      data: { ok: true },
      isValidating: false,
      key: "/settings",
    });
    expect(entries[1]?.error).toBeInstanceOf(Error);
  });

  it("onRevalidate가 mutate를 그 키로 호출한다", () => {
    const mutate = vi.fn();
    const { onRevalidate } = createSwrAdapter({ cache: new Map(), mutate });
    onRevalidate("/settings");
    expect(mutate).toHaveBeenCalledExactlyOnceWith("/settings");
  });
});
