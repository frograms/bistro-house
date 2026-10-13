import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getHttpOverride,
  installHttpOverride,
  uninstallHttpOverride,
} from "./install";
import { createMemoryStorage } from "./safe-storage";

const stubWindow = (baseFetch: typeof fetch) => {
  vi.stubGlobal("window", { fetch: baseFetch });
};

describe("installHttpOverride", () => {
  afterEach(() => {
    uninstallHttpOverride();
    vi.unstubAllGlobals();
  });

  it("window가 없으면(SSR) no-op이다", () => {
    expect(installHttpOverride()).toBeNull();
    expect(getHttpOverride()).toBeNull();
  });

  it("window.fetch를 가로채고, 중복 호출 시 기존 설치를 반환한다", () => {
    const baseFetch = vi.fn(async () => new Response("real"));
    stubWindow(baseFetch);
    const api = installHttpOverride({ storage: createMemoryStorage() });
    expect(api).not.toBeNull();
    expect(getHttpOverride()).toBe(api);
    expect(window.fetch).not.toBe(baseFetch);
    expect(installHttpOverride()).toBe(api);
  });

  it("window에 전역 핸들을 붙이지 않는다", () => {
    stubWindow(vi.fn(async () => new Response("real")));
    installHttpOverride({ storage: createMemoryStorage() });
    expect(Object.keys(window)).toEqual(["fetch"]);
  });

  it("가로챈 fetch로 룰 목 응답과 원래 요청 통과가 동작한다", async () => {
    const baseFetch = vi.fn(async () => new Response("real", { status: 200 }));
    stubWindow(baseFetch);
    const api = installHttpOverride({ storage: createMemoryStorage() });
    if (api === null) throw new Error("install 실패");

    api.rules.add({ body: '{"message":"boom"}', pattern: "/users", status: 500 });
    const mocked = await window.fetch("https://api.test/users");
    expect(mocked.status).toBe(500);
    expect(baseFetch).not.toHaveBeenCalled();

    const passed = await window.fetch("https://api.test/others");
    expect(passed.status).toBe(200);
    expect(baseFetch).toHaveBeenCalledOnce();
    expect(api.records.getSnapshot()).toHaveLength(2);
  });

  it("uninstall하면 원래 fetch로 돌아가고 다시 설치할 수 있다", () => {
    const baseFetch = vi.fn(async () => new Response("real"));
    stubWindow(baseFetch);
    const first = installHttpOverride({ storage: createMemoryStorage() });
    uninstallHttpOverride();
    expect(window.fetch).toBe(baseFetch);
    expect(getHttpOverride()).toBeNull();

    const second = installHttpOverride({ storage: createMemoryStorage() });
    expect(second).not.toBe(first);
  });

  it("설치 뒤 다른 코드가 fetch를 다시 패치했다면 uninstall이 그 패치를 덮지 않는다", () => {
    stubWindow(vi.fn(async () => new Response("real")));
    installHttpOverride({ storage: createMemoryStorage() });
    const outer = vi.fn(async () => new Response("outer"));
    window.fetch = outer;
    uninstallHttpOverride();
    expect(window.fetch).toBe(outer);
  });
});
