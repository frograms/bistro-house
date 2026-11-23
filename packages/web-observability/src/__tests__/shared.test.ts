import { describe, expect, it } from "vitest";

import {
  contextAttributes,
  exceptionAttributes,
} from "../script/util/attribute-utils.ts";
import {
  formatSampledTraceparent,
  parseTraceparent,
} from "../script/util/traceparent-utils.ts";

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

describe("contextAttributes", () => {
  it("원시값은 그대로, 객체·배열은 점 표기 키로 펼치고, undefined 는 뺀다", () => {
    expect(
      contextAttributes({
        at: new Date("2026-01-02T03:04:05.000Z"),
        count: 3,
        error: new TypeError("bad"),
        flag: true,
        nested: { a: [1, 2], b: { c: "d" }, skip: undefined },
        skip: undefined,
        step: "save",
      })
    ).toEqual({
      at: "2026-01-02T03:04:05.000Z",
      count: 3,
      error: "TypeError: bad",
      flag: true,
      "nested.a.0": 1,
      "nested.a.1": 2,
      "nested.b.c": "d",
      step: "save",
    });
  });

  it("순환 참조도 막히지 않고, 키는 100개까지만 싣는다", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(contextAttributes({ circular })).toEqual({
      "circular.self.self.self.self.self": "[unserializable]",
    });
    const many = Object.fromEntries(
      Array.from({ length: 150 }, (_, i) => [`k${i}`, i])
    );
    expect(Object.keys(contextAttributes({ many }))).toHaveLength(100);
  });
});

describe("exceptionAttributes", () => {
  it("Error 는 semconv exception.*, cause 연쇄는 Caused by 로", () => {
    const error = new Error("outer", { cause: new Error("root") });
    const attributes = exceptionAttributes(error);
    expect(attributes).toMatchObject({
      "exception.message": "outer",
      "exception.type": "Error",
    });
    expect(String(attributes["exception.stacktrace"])).toContain(
      "Caused by: Error: root"
    );
  });

  it("문자열·객체도 메시지로 남긴다", () => {
    expect(exceptionAttributes("Script error.")).toEqual({
      "exception.message": "Script error.",
    });
    expect(exceptionAttributes({ code: 1 })).toEqual({
      "exception.message": '{"code":1}',
      "exception.type": "object",
    });
  });
});
