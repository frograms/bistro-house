import { describe, expect, it, vi } from "vitest";

import { pickRumEnv } from "../shared/rum-env.ts";
import { parseSampleRate } from "../shared/sample-rate.ts";
import {
  formatSampledTraceparent,
  parseTraceparent,
} from "../shared/traceparent.ts";

describe("parseSampleRate", () => {
  it("0~1 범위 값은 그대로 쓴다", () => {
    expect(parseSampleRate("0", 0.1)).toBe(0);
    expect(parseSampleRate("0.25", 0.1)).toBe(0.25);
    expect(parseSampleRate("1", 0.1)).toBe(1);
  });

  it("없거나 빈 값이면 경고 없이 기본값", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(parseSampleRate(undefined, 0.1)).toBe(0.1);
    expect(parseSampleRate("", 0.1)).toBe(0.1);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("잘못된 값이면 경고하고 기본값", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(parseSampleRate("10%", 0.1, "RUM_FULL_SAMPLE_RATE")).toBe(0.1);
    expect(parseSampleRate("1.5", 0.1)).toBe(0.1);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]?.[0]).toContain("RUM_FULL_SAMPLE_RATE");
    warn.mockRestore();
  });
});

describe("traceparent", () => {
  const traceId = "0af7651916cd43dd8448eb211c80319c";
  const spanId = "b7ad6b7169203331";

  it("W3C 값을 나누고 다시 만든다", () => {
    const value = `00-${traceId}-${spanId}-01`;
    expect(parseTraceparent(value)).toEqual({ spanId, traceId });
    expect(formatSampledTraceparent({ spanId, traceId })).toBe(value);
  });

  it("형식이 다르면 undefined", () => {
    expect(parseTraceparent(undefined)).toBeUndefined();
    expect(parseTraceparent("00-abc-def-01")).toBeUndefined();
  });
});

describe("pickRumEnv", () => {
  it("RUM 값만 고르고 브라우저 서비스명을 만든다", () => {
    expect(
      pickRumEnv({
        OTEL_SERVICE_NAME: "my-app",
        RUM_ENABLED: "true",
        RUM_PATH: "/_/rum",
        SECRET: "x",
      })
    ).toEqual(
      expect.objectContaining({
        RUM_ENABLED: "true",
        RUM_PATH: "/_/rum",
        RUM_SERVICE: "my-app-browser",
      })
    );
    expect(pickRumEnv({})).not.toHaveProperty("SECRET");
    expect(pickRumEnv({}).RUM_SERVICE).toBeUndefined();
  });
});
