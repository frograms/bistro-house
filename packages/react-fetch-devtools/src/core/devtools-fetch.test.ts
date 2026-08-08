import { afterEach, describe, expect, it, vi } from "vitest";

import { createDevtoolsFetch } from "./devtools-fetch";
import { createRecordBuffer } from "./record-buffer";
import type { FetchDevtoolsRule } from "./types";

const setup = (
  rules: FetchDevtoolsRule[],
  options: { baseFetch?: typeof fetch; maxBodyBytes?: number } = {}
) => {
  const buffer = createRecordBuffer();
  const baseFetch = vi.fn(
    options.baseFetch ??
      (async () =>
        new Response(JSON.stringify({ ok: true }), { status: 200 }))
  );
  const devtoolsFetch = createDevtoolsFetch({
    baseFetch,
    buffer,
    getRules: () => rules,
    maxBodyBytes: options.maxBodyBytes,
  });
  return { baseFetch, buffer, devtoolsFetch };
};

describe("createDevtoolsFetch", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("룰이 없으면 원본 fetch로 통과하고 기록을 남긴다", async () => {
    const { baseFetch, buffer, devtoolsFetch } = setup([]);
    const response = await devtoolsFetch("https://api.test/users", {
      method: "post",
    });
    expect(baseFetch).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(buffer.getSnapshot()[0]).toMatchObject({
      method: "POST",
      mocked: false,
      status: 200,
      url: "https://api.test/users",
    });
    await vi.waitFor(() => {
      expect(buffer.getSnapshot()[0]?.responseBody).toBe('{"ok":true}');
    });
  });

  it("status 룰이 매칭되면 실제 요청 없이 목 응답을 반환한다", async () => {
    const rule: FetchDevtoolsRule = {
      body: '{"message":"boom"}',
      id: "r1",
      pattern: "/users",
      status: 500,
    };
    const { baseFetch, buffer, devtoolsFetch } = setup([rule]);
    const response = await devtoolsFetch("https://api.test/users");
    expect(baseFetch).not.toHaveBeenCalled();
    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe('{"message":"boom"}');
    expect(buffer.getSnapshot()[0]).toMatchObject({
      mocked: true,
      responseBody: '{"message":"boom"}',
      ruleId: "r1",
      status: 500,
    });
  });

  it("delayMs만 있으면 지연 후 실제 요청을 통과시킨다", async () => {
    vi.useFakeTimers();
    const { baseFetch, devtoolsFetch } = setup([
      { delayMs: 1000, id: "r1", pattern: "users" },
    ]);
    const promise = devtoolsFetch("https://api.test/users");
    expect(baseFetch).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    const response = await promise;
    expect(baseFetch).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
  });

  it("잘못된 정규식 룰은 무시한다", async () => {
    const { baseFetch, devtoolsFetch } = setup([
      { id: "r1", pattern: "[", status: 500 },
    ]);
    const response = await devtoolsFetch("https://api.test/users");
    expect(baseFetch).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
  });

  it("body를 가질 수 없는 status 목도 만들 수 있다", async () => {
    const { devtoolsFetch } = setup([
      { body: "ignored", id: "r1", pattern: "users", status: 204 },
    ]);
    const response = await devtoolsFetch("https://api.test/users");
    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe("");
  });

  it("Response가 허용하지 않는 status 룰은 실제 요청으로 통과한다", async () => {
    const { baseFetch, devtoolsFetch } = setup([
      { id: "r1", pattern: "users", status: 199 },
    ]);
    const response = await devtoolsFetch("https://api.test/users");
    expect(baseFetch).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
  });

  it("네트워크 오류는 status 0으로 기록하고 다시 던진다", async () => {
    const { buffer, devtoolsFetch } = setup([], {
      baseFetch: async () => {
        throw new TypeError("Failed to fetch");
      },
    });
    await expect(devtoolsFetch("https://api.test/users")).rejects.toThrow(
      "Failed to fetch"
    );
    expect(buffer.getSnapshot()[0]).toMatchObject({
      error: "Failed to fetch",
      ok: false,
      status: 0,
    });
  });

  it("응답 body가 maxBodyBytes를 넘으면 잘라 저장한다", async () => {
    const { buffer, devtoolsFetch } = setup([], {
      baseFetch: async () => new Response("0123456789", { status: 200 }),
      maxBodyBytes: 4,
    });
    await devtoolsFetch("https://api.test/users");
    await vi.waitFor(() => {
      expect(buffer.getSnapshot()[0]?.responseBody).toBe("0123…(truncated)");
    });
  });

  it("Request 객체 입력에서도 url과 method를 읽는다", async () => {
    const { buffer, devtoolsFetch } = setup([]);
    await devtoolsFetch(
      new Request("https://api.test/items", { method: "PUT" })
    );
    expect(buffer.getSnapshot()[0]).toMatchObject({
      method: "PUT",
      url: "https://api.test/items",
    });
  });
});
