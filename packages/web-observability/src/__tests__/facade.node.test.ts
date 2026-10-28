import { afterEach, describe, expect, it, vi } from "vitest";

import * as O11y from "../index.node.ts";

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

describe("통합 진입점(서버 구현)", () => {
  it("captureException 은 exception 이벤트 JSON 로그를 남긴다", () => {
    const lines = captureStdout();
    O11y.captureException(new Error("db down"), { "app.reason": "test" });
    expect(lines[0]).toMatchObject({
      "app.reason": "test",
      "event.name": "exception",
      "exception.message": "db down",
      level: "error",
      logger: "app.exception",
    });
  });

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

  it("init 은 한 번만 처리기를 등록하고 브라우저 옵션은 무시한다", () => {
    const before = process.listenerCount("uncaughtExceptionMonitor");
    O11y.init({ path: "/_/rum", service: "a-browser" });
    O11y.init();
    expect(process.listenerCount("uncaughtExceptionMonitor")).toBe(before + 1);
    expect(O11y.getSessionId()).toBeUndefined();
  });
});
