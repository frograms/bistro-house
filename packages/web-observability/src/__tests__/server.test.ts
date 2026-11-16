import { EventEmitter } from "node:events";

import type { Span } from "@opentelemetry/api";
import { propagation, trace } from "@opentelemetry/api";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as O11y from "../node-index.ts";
import { setServerConfig } from "../script/module/server/server-config.ts";
import { sessionContext } from "../script/module/server/server-context.ts";
import { jsonAccessLog } from "../script/module/server/server-log.ts";
import {
  createPathMatcher,
  routePathFromMatches,
} from "../script/module/server/server-trace.ts";
import type { ServerOptions } from "../script/type/observability-types.ts";
import { installW3CPropagator, sentryOptions } from "../sentry-index.ts";

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
  it("문자열은 메시지 로그", () => {
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

  it("오류 객체는 exception 로그 한 줄로 남긴다", () => {
    const lines = captureStdout();
    O11y.logger.error(new Error("db down"), { route: "/ko" });

    expect(lines[0]).toMatchObject({
      "event.name": "exception",
      "exception.message": "db down",
      "exception.type": "Error",
      level: "error",
      logger: "app.exception",
      route: "/ko",
    });
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
  it("한 번만 설정·처리기를 등록하고, 요청 밖에서는 세션 ID 가 없다", () => {
    const before = process.listenerCount("uncaughtExceptionMonitor");
    O11y.init({ server: { service: "app" } });
    O11y.init({ server: { service: "other" } });

    expect(process.listenerCount("uncaughtExceptionMonitor")).toBe(before + 1);
    expect(O11y.getSessionId()).toBeUndefined();
  });

  it("browser 옵션만 넘기면 경고하고 설정하지 않는다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    O11y.init({ browser: { service: "app-browser" } });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("server"));
    expect(() => sentryOptions(undefined)).toThrow(/O11y.init/);
  });
});

type FakeSessionResponse = EventEmitter & {
  getHeader(name: string): unknown;
  headersSent: boolean;
  setHeader(name: string, value: string[]): void;
  statusCode: number;
};

/** sessionContext → jsonAccessLog 순서로 연결한 요청 하나를 흉내 낸다 */
function fakeSessionExchange(cookie?: string) {
  const headers = new Map<string, unknown>();
  const res: FakeSessionResponse = Object.assign(new EventEmitter(), {
    getHeader: (name: string) => headers.get(name.toLowerCase()),
    headersSent: true,
    setHeader: (name: string, value: string[]) => {
      headers.set(name.toLowerCase(), value);
    },
    statusCode: 200,
  });
  const req = {
    get: (name: string) => (name === "cookie" ? cookie : undefined),
    method: "GET",
    originalUrl: "/ko",
  };
  const handle = (handler: () => void) => {
    sessionContext()(req, res, () => {
      jsonAccessLog(() => false)(req, res, handler);
    });
  };
  return { handle, headers, res };
}

describe("sessionContext", () => {
  const sid = "0123456789abcdef0123456789abcdef";

  it("쿠키가 없으면 세션 ID 를 만들어 쿠키로 내리고, 요청 안의 로그에 세션 ID·사용자를 붙인다", async () => {
    const lines = captureStdout();
    const { handle, headers, res } = fakeSessionExchange();
    let sessionId: string | undefined;
    handle(() => {
      sessionId = O11y.getSessionId();
      O11y.logger.info("before user");
      // 비동기 경계를 넘어도 같은 요청 컨텍스트를 본다
      void Promise.resolve().then(() => {
        O11y.setUser({ id: "u1" });
        O11y.logger.error(new Error("render failed"));
      });
    });
    await Promise.resolve();
    res.emit("finish");

    expect(sessionId).toMatch(/^[0-9a-f]{32}$/);
    expect(headers.get("set-cookie")).toEqual([
      `o11y_sid=${sessionId}; Path=/; SameSite=Lax`,
    ]);
    expect(lines).toEqual([
      expect.objectContaining({
        message: "before user",
        "session.id": sessionId,
      }),
      expect.objectContaining({
        "exception.message": "render failed",
        "session.id": sessionId,
        "user.id": "u1",
      }),
      // 응답 중 setUser 로 정한 사용자가 액세스 로그에도 남는다
      expect.objectContaining({
        logger: "http.access",
        "session.id": sessionId,
        "user.id": "u1",
      }),
    ]);
    expect(lines[0]).not.toHaveProperty(["user.id"]);
  });

  it("형식이 맞는 쿠키가 있으면 그 값을 쓰고 쿠키를 다시 내리지 않는다", () => {
    const { handle, headers } = fakeSessionExchange(`a=1; o11y_sid=${sid}`);
    let sessionId: string | undefined;
    handle(() => {
      sessionId = O11y.getSessionId();
    });

    expect(sessionId).toBe(sid);
    expect(headers.has("set-cookie")).toBe(false);
  });

  it("형식이 다른 쿠키는 버리고 새로 만든다", () => {
    const { handle, headers } = fakeSessionExchange("o11y_sid=<script>");
    let sessionId: string | undefined;
    handle(() => {
      sessionId = O11y.getSessionId();
    });

    expect(sessionId).toMatch(/^[0-9a-f]{32}$/);
    expect(headers.get("set-cookie")).toEqual([
      expect.stringContaining(`o11y_sid=${sessionId}`),
    ]);
  });

  it("기존 Set-Cookie 를 지우지 않는다", () => {
    const { handle, headers, res } = fakeSessionExchange();
    res.setHeader("Set-Cookie", ["other=1"]);
    handle(() => undefined);

    expect(headers.get("set-cookie")).toEqual([
      "other=1",
      expect.stringMatching(/^o11y_sid=/),
    ]);
  });

  it("요청의 서버 스팬에 session.id 를 붙인다", () => {
    const setAttribute = vi.fn();
    vi.spyOn(trace, "getActiveSpan").mockReturnValue({
      setAttribute,
      spanContext: () => ({
        spanId: "b7ad6b7169203331",
        traceFlags: 1,
        traceId: "0af7651916cd43dd8448eb211c80319c",
      }),
    } as unknown as Span);
    const { handle } = fakeSessionExchange(`o11y_sid=${sid}`);
    handle(() => undefined);

    expect(setAttribute).toHaveBeenCalledWith("session.id", sid);
  });

  it("요청 밖의 setUser 는 아무것도 하지 않고, enabled: false 면 컨텍스트를 열지 않는다", () => {
    const lines = captureStdout();
    O11y.setUser({ id: "outside" });
    O11y.logger.info("outside");
    expect(lines[0]).not.toHaveProperty(["user.id"]);

    resetConfig({ enabled: false, service: "app" });
    const { handle, headers } = fakeSessionExchange();
    let sessionId: string | undefined = "unset";
    handle(() => {
      sessionId = O11y.getSessionId();
    });
    expect(sessionId).toBeUndefined();
    expect(headers.has("set-cookie")).toBe(false);
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
    const before = propagation.fields();
    installW3CPropagator();
    expect(propagation.fields()).toEqual(before);
  });
});
