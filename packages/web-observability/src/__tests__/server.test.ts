import { EventEmitter } from "node:events";

import { afterEach, describe, expect, it, vi } from "vitest";

import * as O11y from "../index.node.ts";
import type { ServerOptions } from "../options.ts";
import { installW3CPropagator, sentryOptions } from "../sentry.ts";
import { setServerConfig } from "../server/config.ts";
import { jsonAccessLog } from "../server/log.ts";
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

const CONFIG_KEY = Symbol.for(
  "@watcha-authentic/web-observability/server-config"
);

function resetConfig(options?: ServerOptions) {
  delete (globalThis as Record<symbol, unknown>)[CONFIG_KEY];
  if (options) {
    setServerConfig(options);
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  resetConfig();
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

describe("logger(서버)", () => {
  it("문자열은 메시지 로그, 컨텍스트 객체는 JSON 문자열", () => {
    const lines = captureStdout();
    O11y.logger.warn("allReady 없음", { from: "render", meta: { bot: true } });
    O11y.logger.debug("detail");

    expect(lines).toEqual([
      expect.objectContaining({
        from: "render",
        level: "warn",
        logger: "app",
        message: "allReady 없음",
        meta: '{"bot":true}',
      }),
      expect.objectContaining({ level: "debug", message: "detail" }),
    ]);
  });

  it("오류 객체는 exception 로그 한 줄에 cause 까지 남긴다", () => {
    const lines = captureStdout();
    O11y.logger.error(new Error("db down", { cause: new Error("timeout") }), {
      route: "/ko",
    });

    expect(lines[0]).toMatchObject({
      "event.name": "exception",
      "exception.message": "db down",
      "exception.type": "Error",
      level: "error",
      logger: "app.exception",
      route: "/ko",
    });
    expect(String(lines[0]?.["exception.stacktrace"])).toContain(
      "Caused by: Error: timeout"
    );
  });

  it("ignoreErrors·beforeSend·sampleRate·enabled 설정을 따른다", () => {
    const lines = captureStdout();
    resetConfig({
      beforeSend: (record) =>
        record.attributes["exception.message"] === "drop"
          ? null
          : { ...record, attributes: { ...record.attributes, tagged: true } },
      ignoreErrors: [/ignored/],
      service: "app",
    });
    O11y.logger.error(new Error("ignored one"));
    O11y.logger.error(new Error("drop"));
    O11y.logger.error(new Error("kept"));
    expect(lines).toEqual([
      expect.objectContaining({ "exception.message": "kept", tagged: true }),
    ]);

    resetConfig({ sampleRate: 0, service: "app" });
    O11y.logger.error(new Error("sampled out"));
    O11y.logger.info("message is kept");
    resetConfig({ enabled: false, service: "app" });
    O11y.logger.info("disabled");
    expect(lines.slice(1)).toEqual([
      expect.objectContaining({ message: "message is kept" }),
    ]);
  });
});

describe("init(서버)", () => {
  it("한 번만 설정·처리기를 등록하고, 세션 ID 는 없다", () => {
    const before = process.listenerCount("uncaughtExceptionMonitor");
    O11y.init({ service: "app" });
    O11y.init({ service: "other" });

    expect(process.listenerCount("uncaughtExceptionMonitor")).toBe(before + 1);
    expect(O11y.getSessionId()).toBeUndefined();
  });
});

describe("sentryOptions", () => {
  it("init 전에 부르면 순서를 알려 주는 오류", () => {
    expect(() => sentryOptions("https://key@sentry.example/1")).toThrow(
      /O11y.init/
    );
  });

  it("tracesEndpoint·tracesSampleRate 가 있으면 OTLP 처리기를 싣고 Sentry 트랜잭션은 버린다", () => {
    resetConfig({
      release: "v1",
      service: "app",
      tracesEndpoint: "http://collector:4318/v1/traces",
      tracesSampleRate: 0.1,
    });
    const options = sentryOptions(undefined);

    expect(options).toMatchObject({
      dsn: "https://otel@sentry.invalid/0",
      tracesSampleRate: 0.1,
    });
    expect(options).toHaveProperty(
      ["openTelemetrySpanProcessors", "length"],
      1
    );
    expect(
      "beforeSendTransaction" in options && options.beforeSendTransaction()
    ).toBeNull();
  });

  it("서버 트레이스를 끈 설정이면 DSN 만 넘기고 전파기도 바꾸지 않는다", () => {
    resetConfig({ service: "app", tracesSampleRate: 0.1 });
    expect(sentryOptions("https://key@sentry.example/1")).toEqual({
      dsn: "https://key@sentry.example/1",
    });
    expect(() => installW3CPropagator()).not.toThrow();
  });
});
