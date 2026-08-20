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

  it("캐시에 data가 없으면 fallback에서 보충하고 isFallback을 표시한다", () => {
    const cache = new Map<string, unknown>([
      ["/api/session/region", {}],
      ["/api/users/me", { data: { name: "캐시값" } }],
      ["/api/others", {}],
    ]);
    const { cacheAdapter } = createSwrAdapter({
      cache,
      fallback: {
        "/api/session/region": { country: "KR" },
        "/api/users/me": { name: "fallback값" },
      },
      mutate: () => {},
    });
    const entries = cacheAdapter.getEntries();
    expect(entries[0]).toMatchObject({
      data: { country: "KR" },
      isFallback: true,
      key: "/api/session/region",
    });
    expect(entries[1]).toMatchObject({
      data: { name: "캐시값" },
      key: "/api/users/me",
    });
    expect(entries[1]?.isFallback).toBeUndefined();
    expect(entries[2]?.data).toBeUndefined();
    expect(entries[2]?.isFallback).toBeUndefined();
  });

  it("onRevalidate는 URL을 포함하는 캐시 키만 mutate한다 (배열 직렬화 키 포함)", () => {
    const mutate = vi.fn();
    const cache = new Map<string, unknown>([
      ["/api/settings", {}],
      ['@"/api/settings","ko",', {}],
      ["/api/others", {}],
    ]);
    const { onRevalidate } = createSwrAdapter({ cache, mutate });
    onRevalidate("/api/settings");
    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate).toHaveBeenCalledWith("/api/settings");
    expect(mutate).toHaveBeenCalledWith('@"/api/settings","ko",');
  });

  it("onRevalidate는 매칭되는 키가 없으면 mutate하지 않는다", () => {
    const mutate = vi.fn();
    const { onRevalidate } = createSwrAdapter({ cache: new Map(), mutate });
    onRevalidate("/settings");
    expect(mutate).not.toHaveBeenCalled();
  });
});
