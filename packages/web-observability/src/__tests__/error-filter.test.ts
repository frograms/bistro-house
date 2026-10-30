import { describe, expect, it } from "vitest";

import { ErrorFilter } from "../browser/error-filter.ts";
import { exceptionAttributes } from "../shared/attributes.ts";

function errorAt(url: string, message = "boom", name = "TypeError") {
  const error = new Error(message);
  error.name = name;
  error.stack = `${name}: ${message}\n    at fn (${url}:10:5)\n    at other (${url}:20:1)`;
  return error;
}

function record(error: unknown) {
  return { attributes: exceptionAttributes(error), error };
}

describe("ErrorFilter", () => {
  it("ignoreErrors 는 메시지·`타입: 메시지` 에 맞춘다(문자열은 부분 일치)", () => {
    const filter = new ErrorFilter({
      ignoreErrors: [/AbortError/, "ResizeObserver loop"],
    });
    expect(
      filter.apply(record(errorAt("https://a/x.js", "x", "AbortError")))
    ).toBeNull();
    expect(
      filter.apply(record(new Error("ResizeObserver loop limit exceeded")))
    ).toBeNull();
    expect(filter.apply(record(new Error("real")))).not.toBeNull();
  });

  it("denyUrls·allowUrls 는 맨 위 프레임 URL 로 판단한다", () => {
    const filter = new ErrorFilter({
      allowUrls: [/^https:\/\/cdn\.example\.test\//],
      denyUrls: [/googletagmanager/],
    });
    expect(
      filter.apply(record(errorAt("https://www.googletagmanager.com/gtm.js")))
    ).toBeNull();
    expect(filter.apply(record(errorAt("https://other.test/x.js")))).toBeNull();
    expect(
      filter.apply(record(errorAt("https://cdn.example.test/app.js")))
    ).not.toBeNull();
    // 스택에 URL 이 없으면 allowUrls 로 거르지 않는다
    expect(filter.apply(record("Script error."))).not.toBeNull();
  });

  it("연달아 같은 오류는 한 번만", () => {
    const filter = new ErrorFilter();
    const error = errorAt("https://a/x.js");
    expect(filter.apply(record(error))).not.toBeNull();
    expect(filter.apply(record(error))).toBeNull();
    expect(filter.apply(record(new Error("other")))).not.toBeNull();
    expect(filter.apply(record(error))).not.toBeNull();
  });

  it("페이지당 상한", () => {
    const filter = new ErrorFilter({}, 2);
    expect(filter.apply(record(new Error("1")))).not.toBeNull();
    expect(filter.apply(record(new Error("2")))).not.toBeNull();
    expect(filter.apply(record(new Error("3")))).toBeNull();
  });

  it("beforeSend 로 가공하거나 버린다", () => {
    const filter = new ErrorFilter({
      beforeSend: (r) =>
        r.attributes["exception.message"] === "drop"
          ? null
          : { ...r, attributes: { ...r.attributes, tagged: true } },
    });
    expect(filter.apply(record(new Error("drop")))).toBeNull();
    expect(filter.apply(record(new Error("keep")))?.attributes.tagged).toBe(
      true
    );
  });
});
