import { afterEach, describe, expect, it, vi } from "vitest";

import { installHttpOverride } from "./install";
import { createMemoryStorage } from "./safe-storage";

describe("installHttpOverride", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("enabled=false면 아무것도 설치하지 않는다", () => {
    vi.stubGlobal("window", {});
    expect(installHttpOverride({ enabled: false })).toBeNull();
    expect(window.__HTTP_OVERRIDE__).toBeUndefined();
  });

  it("window가 없으면(SSR) no-op이다", () => {
    expect(installHttpOverride({ enabled: true })).toBeNull();
  });

  it("window.__HTTP_OVERRIDE__를 설치하고, 중복 호출 시 기존 것을 반환한다", () => {
    vi.stubGlobal("window", {});
    const api = installHttpOverride({ enabled: true });
    expect(api).not.toBeNull();
    expect(window.__HTTP_OVERRIDE__).toBe(api);
    expect(installHttpOverride({ enabled: true })).toBe(api);
  });

  it("설치된 api로 룰 추가와 목 응답이 동작한다", async () => {
    vi.stubGlobal("window", {});
    const baseFetch = vi.fn(async () => new Response("real", { status: 200 }));
    const api = installHttpOverride({
      baseFetch,
      enabled: true,
      storage: createMemoryStorage(),
    });
    if (api === null) throw new Error("install 실패");

    api.rules.add({ body: '{"message":"boom"}', pattern: "/users", status: 500 });
    const mocked = await api.fetch("https://api.test/users");
    expect(mocked.status).toBe(500);
    expect(baseFetch).not.toHaveBeenCalled();

    const passed = await api.fetch("https://api.test/others");
    expect(passed.status).toBe(200);
    expect(baseFetch).toHaveBeenCalledOnce();
    expect(api.records.getSnapshot()).toHaveLength(2);
  });
});
