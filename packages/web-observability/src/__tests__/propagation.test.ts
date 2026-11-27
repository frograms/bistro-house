import { afterEach, describe, expect, it, vi } from "vitest";

import { setServerConfig } from "../script/module/server/server-config.ts";
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

describe("브라우저 추가 전파기", () => {
  const traceId = "0af7651916cd43dd8448eb211c80319c";
  const spanId = "b7ad6b7169203331";

  afterEach(async () => {
    const { propagation } = await import("@opentelemetry/api");
    propagation.disable();
  });

  it("추가 전파기를 W3C traceparent 뒤에 붙인다", async () => {
    const { context, propagation, trace, TraceFlags } =
      await import("@opentelemetry/api");
    const { installExtraPropagators } =
      await import("../script/module/browser/browser-propagation.ts");
    await installExtraPropagators(async () => [
      {
        extract: (parent) => parent,
        fields: () => ["x-extra"],
        inject: (_context, carrier, setter) => {
          setter.set(carrier, "x-extra", "1");
        },
      },
    ]);

    const carrier: Record<string, string> = {};
    propagation.inject(
      trace.setSpanContext(context.active(), {
        spanId,
        traceFlags: TraceFlags.SAMPLED,
        traceId,
      }),
      carrier
    );
    expect(carrier.traceparent).toBe(`00-${traceId}-${spanId}-01`);
    expect(carrier["x-extra"]).toBe("1");
  });

  it("빈 목록이면 이미 등록된 전역 전파기를 바꾸지 않는다", async () => {
    const { context, propagation, trace, TraceFlags } =
      await import("@opentelemetry/api");
    const { W3CTraceContextPropagator } = await import("@opentelemetry/core");
    const { installExtraPropagators } =
      await import("../script/module/browser/browser-propagation.ts");
    propagation.disable();
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());
    await installExtraPropagators(async () => []);

    const carrier: Record<string, string> = {};
    propagation.inject(
      trace.setSpanContext(context.active(), {
        spanId,
        traceFlags: TraceFlags.SAMPLED,
        traceId,
      }),
      carrier
    );
    expect(carrier.traceparent).toBe(`00-${traceId}-${spanId}-01`);
    expect(carrier["x-extra"]).toBeUndefined();
  });
});
