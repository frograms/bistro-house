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
    const { buffer, devtoolsFetch } = setup([
      { body: "ignored", id: "r1", pattern: "users", status: 204 },
    ]);
    const response = await devtoolsFetch("https://api.test/users");
    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe("");
    expect(buffer.getSnapshot()[0]?.responseBody).toBe("");
  });

  it("목 body도 maxBodyBytes로 잘라 기록한다", async () => {
    const { buffer, devtoolsFetch } = setup(
      [{ body: "0123456789", id: "r1", pattern: "users", status: 500 }],
      { maxBodyBytes: 4 }
    );
    const response = await devtoolsFetch("https://api.test/users");
    await expect(response.text()).resolves.toBe("0123456789");
    expect(buffer.getSnapshot()[0]?.responseBody).toBe("0123…(truncated)");
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

  it("patch 룰은 실제 응답의 path만 덮어써 반환한다", async () => {
    const { buffer, devtoolsFetch } = setup(
      [
        {
          id: "r1",
          patch: [
            { path: "a.b", value: [] },
            { path: "없는.경로", value: 1 },
          ],
          pattern: "users",
        },
      ],
      {
        baseFetch: async () =>
          new Response('{"a":{"b":[1,2]},"keep":true}', { status: 200 }),
      }
    );
    const response = await devtoolsFetch("https://api.test/users");
    await expect(response.json()).resolves.toEqual({
      a: { b: [] },
      keep: true,
    });
    expect(buffer.getSnapshot()[0]).toMatchObject({
      mocked: false,
      patched: true,
      ruleId: "r1",
      status: 200,
    });
  });

  it("patch remove는 객체 키를 삭제하고 배열은 splice한다", async () => {
    const { devtoolsFetch } = setup(
      [
        {
          id: "r1",
          patch: [
            { path: "gone", remove: true },
            { path: "list.0", remove: true },
          ],
          pattern: "users",
        },
      ],
      {
        baseFetch: async () =>
          new Response('{"gone":1,"keep":2,"list":[10,20]}', { status: 200 }),
      }
    );
    const response = await devtoolsFetch("https://api.test/users");
    await expect(response.json()).resolves.toEqual({ keep: 2, list: [20] });
  });

  it("배열에 인덱스가 아닌 path로 remove하면 무시한다", async () => {
    const { devtoolsFetch } = setup(
      [
        {
          id: "r1",
          patch: [{ path: "list.length", remove: true }],
          pattern: "users",
        },
      ],
      {
        baseFetch: async () =>
          new Response('{"list":[10,20]}', { status: 200 }),
      }
    );
    const response = await devtoolsFetch("https://api.test/users");
    await expect(response.json()).resolves.toEqual({ list: [10, 20] });
  });

  it("패치 응답은 원본 content-length 헤더를 지우고 나머지는 유지한다", async () => {
    const { devtoolsFetch } = setup(
      [{ id: "r1", patch: [{ path: "title", value: "바뀜" }], pattern: "users" }],
      {
        baseFetch: async () =>
          new Response('{"title":"원본"}', {
            headers: {
              "content-length": "16",
              "content-type": "application/json",
              "x-request-id": "abc",
            },
            status: 200,
          }),
      }
    );
    const response = await devtoolsFetch("https://api.test/users");
    expect(response.headers.get("content-length")).toBeNull();
    expect(response.headers.get("x-request-id")).toBe("abc");
  });

  it("지연 룰과 패치 룰이 동시에 매칭되면 둘 다 적용된다", async () => {
    vi.useFakeTimers();
    const { devtoolsFetch } = setup(
      [
        { delayMs: 1000, id: "r-delay", pattern: "contents" },
        { id: "r-patch", patch: [{ path: "title", value: "바뀜" }], pattern: "api/contents" },
      ],
      {
        baseFetch: async () =>
          new Response('{"title":"원본"}', { status: 200 }),
      }
    );
    const promise = devtoolsFetch("https://api.test/api/contents");
    await vi.advanceTimersByTimeAsync(1000);
    const response = await promise;
    await expect(response.json()).resolves.toEqual({ title: "바뀜" });
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
