import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getHttpOverride,
  installHttpOverride,
  uninstallHttpOverride,
} from "./install";
import { createMemoryStorage } from "./safe-storage";

const stubWindow = (baseFetch: typeof fetch) => {
  vi.stubGlobal("window", {
    addEventListener: vi.fn(),
    fetch: baseFetch,
    removeEventListener: vi.fn(),
  });
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

  it("window.fetch가 없으면(폴리필 전 구형 브라우저) 설치하지 않는다", () => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    expect(installHttpOverride({ storage: createMemoryStorage() })).toBeNull();
    expect(getHttpOverride()).toBeNull();
    expect("fetch" in window).toBe(false);
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
    expect(Object.keys(window).sort()).toEqual([
      "addEventListener",
      "fetch",
      "removeEventListener",
    ]);
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

  it("onRevalidate가 있으면 method와 상관없이 그 콜백으로 재요청한다", () => {
    const baseFetch = vi.fn(async () => new Response("real"));
    stubWindow(baseFetch);
    const onRevalidate = vi.fn();
    const api = installHttpOverride({
      onRevalidate,
      storage: createMemoryStorage(),
    });
    expect(api?.canRevalidate("POST")).toBe(true);
    api?.revalidate("https://api.test/users", "POST");
    expect(onRevalidate).toHaveBeenCalledExactlyOnceWith(
      "https://api.test/users"
    );
    expect(baseFetch).not.toHaveBeenCalled();
  });

  it("onRevalidate가 없으면 GET만 같은 URL로 다시 보낸다", () => {
    const baseFetch = vi.fn(async () => new Response("real"));
    stubWindow(baseFetch);
    const api = installHttpOverride({ storage: createMemoryStorage() });
    expect(api?.canRevalidate("GET")).toBe(true);
    expect(api?.canRevalidate("POST")).toBe(false);
    expect(api?.canRevalidate("SSR")).toBe(false);

    api?.revalidate("https://api.test/users", "POST");
    expect(baseFetch).not.toHaveBeenCalled();
    api?.revalidate("https://api.test/users", "GET");
    expect(baseFetch).toHaveBeenCalledOnce();
  });

  it("replay는 기록된 요청을 같은 method와 본문으로 다시 보내고 그때 룰을 적용한다", async () => {
    const baseFetch = vi.fn(async () => new Response("real", { status: 201 }));
    stubWindow(baseFetch);
    const api = installHttpOverride({ storage: createMemoryStorage() });
    if (api === null) throw new Error("install 실패");

    await window.fetch("https://api.test/wishes", {
      body: '{"code":"m5aV9mp"}',
      method: "POST",
    });
    const first = api.records.getSnapshot()[0];
    if (first === undefined) throw new Error("기록 없음");
    expect(api.canReplay(first.seq)).toBe(true);

    api.rules.add({ pattern: "wishes", status: 500 });
    api.replay(first.seq);
    await vi.waitFor(() => {
      expect(api.records.getSnapshot()).toHaveLength(2);
    });
    expect(baseFetch).toHaveBeenCalledOnce();
    expect(api.records.getSnapshot()[1]).toMatchObject({
      method: "POST",
      mocked: true,
      requestBody: '{"code":"m5aV9mp"}',
      status: 500,
      url: "https://api.test/wishes",
    });
  });

  it("Request 객체로 보낸 요청도 복제본을 보관해 여러 번 다시 보낼 수 있다", async () => {
    const baseFetch = vi.fn(async (input: RequestInfo | URL) => {
      const text = input instanceof Request ? await input.text() : "";
      return new Response(text, { status: 200 });
    });
    stubWindow(baseFetch as typeof fetch);
    const api = installHttpOverride({ storage: createMemoryStorage() });
    if (api === null) throw new Error("install 실패");

    await window.fetch(
      new Request("https://api.test/orders", { body: "a=1", method: "POST" })
    );
    const seq = api.records.getSnapshot()[0]?.seq ?? 0;
    api.replay(seq);
    api.replay(seq);
    await vi.waitFor(() => {
      expect(api.records.getSnapshot()).toHaveLength(3);
    });
    expect(baseFetch).toHaveBeenCalledTimes(3);
    // Request 입력의 본문은 clone 후 비동기로 채워진다
    await vi.waitFor(() => {
      expect(
        api.records.getSnapshot().map((record) => record.requestBody)
      ).toEqual(["a=1", "a=1", "a=1"]);
    });
  });

  it("ssrData 행은 원본 요청이 없어 다시 보낼 수 없다", () => {
    stubWindow(vi.fn(async () => new Response("real")));
    const api = installHttpOverride({
      ssrData: { "/api/me": { name: "garu" } },
      storage: createMemoryStorage(),
    });
    const seq = api?.records.getSnapshot()[0]?.seq ?? 0;
    expect(api?.canReplay(seq)).toBe(false);
  });

  it("remaining 1인 룰은 다음 요청 한 번에만 적용되고 자동으로 지워진다", async () => {
    const baseFetch = vi.fn(async () => new Response("{}", { status: 200 }));
    stubWindow(baseFetch);
    const api = installHttpOverride({ storage: createMemoryStorage() });
    if (api === null) throw new Error("install 실패");

    api.rules.add({ pattern: "wishes", remaining: 1, status: 500 });
    const failed = await window.fetch("https://api.test/wishes", { method: "POST" });
    expect(failed.status).toBe(500);
    expect(api.rules.getSnapshot()).toHaveLength(0);

    const passed = await window.fetch("https://api.test/wishes", { method: "POST" });
    expect(passed.status).toBe(200);
    expect(baseFetch).toHaveBeenCalledOnce();
  });

  it("remaining은 적용될 때마다 줄고, 매칭되지 않은 요청은 횟수를 쓰지 않는다", async () => {
    stubWindow(vi.fn(async () => new Response("{}", { status: 200 })));
    const api = installHttpOverride({ storage: createMemoryStorage() });
    if (api === null) throw new Error("install 실패");

    api.rules.add({ delayMs: 1, pattern: "orders", remaining: 2 });
    await window.fetch("https://api.test/users");
    expect(api.rules.getSnapshot()[0]?.remaining).toBe(2);
    await window.fetch("https://api.test/orders", { method: "POST" });
    expect(api.rules.getSnapshot()[0]?.remaining).toBe(1);
    await window.fetch("https://api.test/orders", { method: "POST" });
    expect(api.rules.getSnapshot()).toHaveLength(0);
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
