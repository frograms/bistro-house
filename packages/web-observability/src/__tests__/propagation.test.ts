import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import { afterEach, describe, expect, it, vi } from "vitest";

import { setServerConfig } from "../script/module/server/server-config.ts";
import { sessionContext } from "../script/module/server/server-context.ts";
import type { ServerOptions } from "../script/type/observability-types.ts";
import { sentryOptions } from "../sentry-index.ts";

const CONFIG_KEY = Symbol.for(
  "@watcha-authentic/web-observability/server-config"
);

function resetConfig(options?: ServerOptions) {
  delete (globalThis as Record<symbol, unknown>)[CONFIG_KEY];
  if (options) {
    setServerConfig(options);
  }
}

afterEach(() => resetConfig());

/** 받은 요청 헤더를 돌려주는 로컬 서버 */
async function headerEcho() {
  const received: Record<string, string | string[] | undefined>[] = [];
  const server = createServer((req, res) => {
    received.push(req.headers);
    res.end("ok");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    close: () => new Promise((resolve) => server.close(resolve)),
    received,
    url: `http://127.0.0.1:${port}/api/x`,
  };
}

/** sessionContext 안에서 fn 을 실행한다(들어온 요청 헤더를 흉내) */
function inRequest(headers: Record<string, string>, fn: () => Promise<void>) {
  const middleware = sessionContext();
  const req = { get: (name: string) => headers[name.toLowerCase()] };
  const res = { getHeader: () => undefined, setHeader: () => undefined };
  return new Promise<void>((resolve, reject) => {
    middleware(req, res, () => {
      fn().then(resolve, reject);
    });
  });
}

describe("sentryOptions — traceparent 전파", () => {
  it("서버 트레이스가 켜져 있으면 Sentry 가 나가는 요청에 traceparent 를 싣게 한다", () => {
    resetConfig({
      service: "app",
      tracesEndpoint: "http://collector:4318/v1/traces",
      tracesSampleRate: 0.1,
    });
    expect(sentryOptions(undefined)).toMatchObject({
      propagateTraceparent: true,
    });
  });
});

describe("x-request-id 전달", () => {
  it("대상 호스트로 나가는 fetch 에 들어온 x-request-id 를 그대로 싣는다", async () => {
    resetConfig({ requestIdTargets: ["127.0.0.1"], service: "app" });
    const echo = await headerEcho();
    await inRequest({ "x-request-id": "req-123" }, async () => {
      await fetch(echo.url);
    });
    await echo.close();
    expect(echo.received[0]?.["x-request-id"]).toBe("req-123");
  });

  it("대상이 아닌 호스트에는 싣지 않는다", async () => {
    resetConfig({ requestIdTargets: [/^private-/], service: "app" });
    const echo = await headerEcho();
    await inRequest({ "x-request-id": "req-123" }, async () => {
      await fetch(echo.url);
    });
    await echo.close();
    expect(echo.received[0]?.["x-request-id"]).toBeUndefined();
  });

  it("이미 x-request-id 가 있으면 덮어쓰지 않고, 요청 밖이면 싣지 않는다", async () => {
    resetConfig({ requestIdTargets: ["127.0.0.1"], service: "app" });
    const echo = await headerEcho();
    await inRequest({ "x-request-id": "req-123" }, async () => {
      await fetch(echo.url, { headers: { "x-request-id": "own" } });
    });
    await fetch(echo.url);
    await echo.close();
    expect(echo.received[0]?.["x-request-id"]).toBe("own");
    expect(echo.received[1]?.["x-request-id"]).toBeUndefined();
  });
});

describe("SSR traceparent — 샘플 여부와 무관하게 내린다", () => {
  const traceId = "0af7651916cd43dd8448eb211c80319c";
  const spanId = "b7ad6b7169203331";

  it("미샘플 요청에도 -00 으로 meta 값·Server-Timing 을 낸다(브라우저가 그 결정을 따르게)", async () => {
    const { trace, TraceFlags } = await import("@opentelemetry/api");
    const { appendTraceparentServerTiming, getServerTraceparent } =
      await import("../script/module/server/server-trace.ts");
    const spy = vi.spyOn(trace, "getActiveSpan");

    spy.mockReturnValue(
      trace.wrapSpanContext({ spanId, traceFlags: TraceFlags.NONE, traceId })
    );
    expect(getServerTraceparent()).toBe(`00-${traceId}-${spanId}-00`);
    const headers = new Headers();
    appendTraceparentServerTiming(headers);
    expect(headers.get("Server-Timing")).toBe(
      `traceparent;desc="00-${traceId}-${spanId}-00"`
    );

    spy.mockReturnValue(
      trace.wrapSpanContext({ spanId, traceFlags: TraceFlags.SAMPLED, traceId })
    );
    expect(getServerTraceparent()).toBe(`00-${traceId}-${spanId}-01`);

    spy.mockReturnValue(undefined);
    expect(getServerTraceparent()).toBeUndefined();
    spy.mockRestore();
  });
});

describe("브라우저 전파기 — x-client-trace-id", () => {
  it("샘플된 요청에는 traceparent 와 x-client-trace-id 를 함께, 미샘플이면 x-client-trace-id 는 싣지 않는다", async () => {
    const { context, propagation, trace, TraceFlags } =
      await import("@opentelemetry/api");
    const { installClientTracePropagator } =
      await import("../script/module/browser/browser-propagation.ts");
    const traceId = "0af7651916cd43dd8448eb211c80319c";
    const spanId = "b7ad6b7169203331";
    installClientTracePropagator();

    const sampled: Record<string, string> = {};
    propagation.inject(
      trace.setSpanContext(context.active(), {
        spanId,
        traceFlags: TraceFlags.SAMPLED,
        traceId,
      }),
      sampled
    );
    expect(sampled).toMatchObject({
      traceparent: `00-${traceId}-${spanId}-01`,
      "x-client-trace-id": traceId,
    });

    const unsampled: Record<string, string> = {};
    propagation.inject(
      trace.setSpanContext(context.active(), {
        spanId,
        traceFlags: TraceFlags.NONE,
        traceId,
      }),
      unsampled
    );
    expect(unsampled["x-client-trace-id"]).toBeUndefined();
    propagation.disable();
  });
});
