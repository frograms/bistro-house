import { EventEmitter } from "node:events";

import { afterEach, describe, expect, it, vi } from "vitest";

import * as O11y from "../index.node.ts";
import { captureServerException, jsonAccessLog } from "../server/log.ts";
import { createPathMatcher, routePathFromMatches } from "../server/trace.ts";

/** stdout 으로 쓴 JSON 로그 줄 */
function captureStdout() {
  const lines: Record<string, unknown>[] = [];
  vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    lines.push(JSON.parse(String(chunk)) as Record<string, unknown>);
    return true;
  });
  return lines;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("routePathFromMatches", () => {
  it("매칭된 라우트 패턴을 이어 붙인다", () => {
    expect(
      routePathFromMatches([
        { route: { path: "" } },
        { route: { path: ":lang?" } },
        { route: {} },
        { route: { path: "browse/:browseTab" } },
      ])
    ).toBe("/:lang?/browse/:browseTab");
  });

  it("루트만 매칭되면 undefined", () => {
    expect(routePathFromMatches([{ route: { path: "" } }])).toBeUndefined();
  });
});

describe("createPathMatcher", () => {
  it("경로 접두사로 판별하고 쿼리는 보지 않는다", () => {
    const isUntraced = createPathMatcher(["/health_check", "/_rx/"]);
    expect(isUntraced("/health_check?x=1")).toBe(true);
    expect(isUntraced("/_rx/app.js")).toBe(true);
    expect(isUntraced("/ko/search?q=/health_check")).toBe(false);
  });
});

function fakeExchange(headersSent: boolean, statusCode: number) {
  const res = Object.assign(new EventEmitter(), { headersSent, statusCode });
  const req = {
    get: (name: string) => (name === "user-agent" ? "test-agent" : undefined),
    method: "GET",
    originalUrl: "/ko/search?query=secret",
  };
  return { req, res };
}

describe("jsonAccessLog", () => {
  it("요청마다 한 줄, 쿼리 문자열은 남기지 않는다", () => {
    const lines = captureStdout();
    const { req, res } = fakeExchange(true, 200);
    const next = vi.fn();
    jsonAccessLog(() => false)(req, res, next);
    res.emit("finish");
    res.emit("close");

    expect(next).toHaveBeenCalled();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      "event.name": "http.server.request",
      "http.response.status_code": 200,
      level: "info",
      logger: "http.access",
      message: "GET /ko/search 200",
      "url.path": "/ko/search",
      "user_agent.original": "test-agent",
    });
    expect(JSON.stringify(lines[0])).not.toContain("secret");
  });

  it("응답 전에 끊기면 aborted 경고", () => {
    const lines = captureStdout();
    const { req, res } = fakeExchange(false, 200);
    jsonAccessLog(() => false)(req, res, () => undefined);
    res.emit("close");

    expect(lines[0]).toMatchObject({
      level: "warn",
      message: "GET /ko/search aborted",
    });
    expect(lines[0]).not.toHaveProperty(["http.response.status_code"]);
  });

  it("5xx 는 error, skip 대상은 남기지 않는다", () => {
    const lines = captureStdout();
    const failed = fakeExchange(true, 503);
    jsonAccessLog(() => false)(failed.req, failed.res, () => undefined);
    failed.res.emit("finish");
    const skipped = fakeExchange(true, 200);
    jsonAccessLog(() => true)(skipped.req, skipped.res, () => undefined);
    skipped.res.emit("finish");

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ level: "error" });
  });
});

describe("captureServerException", () => {
  it("exception 로그 한 줄에 cause 까지 남긴다", () => {
    const lines = captureStdout();
    captureServerException(
      new Error("db down", { cause: new Error("timeout") }),
      { "app.route": "/ko" }
    );

    expect(lines[0]).toMatchObject({
      "app.route": "/ko",
      "event.name": "exception",
      "exception.message": "db down",
      "exception.type": "Error",
      level: "error",
      logger: "app.exception",
    });
    expect(String(lines[0]?.["exception.stacktrace"])).toContain(
      "Caused by: Error: timeout"
    );
  });
});

describe("통합 진입점(서버)", () => {
  it("logger 는 심각도별 JSON 로그를 남긴다", () => {
    const lines = captureStdout();
    O11y.logger.warn("allReady 없음", { from: "render" });
    O11y.logger.debug("detail");

    expect(lines).toEqual([
      expect.objectContaining({
        from: "render",
        level: "warn",
        logger: "app",
        message: "allReady 없음",
      }),
      expect.objectContaining({ level: "debug", message: "detail" }),
    ]);
  });

  it("init 은 여러 번 불러도 처리기를 한 번만 등록하고, 브라우저 옵션은 무시한다", () => {
    const before = process.listenerCount("uncaughtExceptionMonitor");
    O11y.init({ path: "/_/rum", service: "a-browser" });
    O11y.init();

    expect(process.listenerCount("uncaughtExceptionMonitor")).toBe(before + 1);
    expect(O11y.getSessionId()).toBeUndefined();
  });
});
