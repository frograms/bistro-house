import { EventEmitter } from "node:events";

import { afterEach, describe, expect, it, vi } from "vitest";

import { captureServerException, jsonAccessLog } from "../server/log.ts";
import { readOtelEnv } from "../server/otel.ts";
import { createPathMatcher, routePathFromMatches } from "../server/trace.ts";

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
  it("매칭 라우트 패턴을 잇는다", () => {
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
  it("접두사로 판별하고 쿼리는 무시한다", () => {
    const isUntraced = createPathMatcher(["/health_check", "/_rx/"]);
    expect(isUntraced("/health_check?x=1")).toBe(true);
    expect(isUntraced("/_rx/app.js")).toBe(true);
    expect(isUntraced("/ko/search?q=/health_check")).toBe(false);
  });
});

describe("readOtelEnv", () => {
  it("엔드포인트가 비어 있으면 undefined", () => {
    expect(readOtelEnv({ OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "" })).toEqual({
      endpoint: undefined,
      serviceName: undefined,
      tracesSampleRate: 0,
    });
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
  it("쿼리 없이 한 번만 남긴다", () => {
    const lines = captureStdout();
    const { req, res } = fakeExchange(true, 200);
    const next = vi.fn();
    jsonAccessLog(() => false)(req, res, next);
    expect(next).toHaveBeenCalled();
    res.emit("finish");
    res.emit("close");
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

  it("헤더 전에 끊기면 aborted·warn", () => {
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

  it("5xx 는 error, skip 이면 남기지 않는다", () => {
    const lines = captureStdout();
    const error = fakeExchange(true, 503);
    jsonAccessLog(() => false)(error.req, error.res, () => undefined);
    error.res.emit("finish");
    const skipped = fakeExchange(true, 200);
    jsonAccessLog(() => true)(skipped.req, skipped.res, () => undefined);
    skipped.res.emit("finish");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ level: "error" });
  });
});

describe("captureServerException", () => {
  it("exception 이벤트 JSON 한 줄", () => {
    const lines = captureStdout();
    captureServerException(
      new Error("db down", { cause: new Error("timeout") }),
      {
        "app.route": "/ko",
      }
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
