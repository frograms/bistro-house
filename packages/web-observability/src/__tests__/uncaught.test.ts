import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const logModule = fileURLToPath(new URL("../server/log.ts", import.meta.url));

// 실제 프로세스에서 종료 여부와 로그를 함께 확인한다(Node 22 타입 제거로 .ts 를 바로 실행)
function run(body: string) {
  const script = `
    const { captureUncaughtErrors } = await import(${JSON.stringify(logModule)});
    ${body}
  `;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", script],
    { encoding: "utf8" }
  );
  const lines = result.stdout
    .split("\n")
    .filter((line) => line.startsWith("{"))
    .map((line) => JSON.parse(line) as Record<string, unknown>);
  return { lines, status: result.status };
}

describe("captureUncaughtErrors", () => {
  it("처리 안 된 예외를 남기고 Node 기본대로 종료한다", () => {
    const { lines, status } = run(`
      captureUncaughtErrors();
      setTimeout(() => { throw new Error("boom"); });
    `);
    expect(status).toBe(1);
    expect(lines[0]).toMatchObject({
      "exception.message": "boom",
      "o11y.exception.source": "uncaughtException",
    });
  });

  it("거절 리스너가 없으면 Node 기본대로 예외가 되어 남기고 종료한다", () => {
    const { lines, status } = run(`
      captureUncaughtErrors();
      Promise.reject(new Error("rejected"));
    `);
    expect(status).toBe(1);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      "exception.message": "rejected",
      "o11y.exception.source": "unhandledRejection",
    });
  });

  it("다른 거절 리스너(Sentry 등)를 나중에 등록해도 종료하지 않고 한 번만 남긴다", () => {
    const { lines, status } = run(`
      captureUncaughtErrors();
      process.on("unhandledRejection", () => {});
      Promise.reject(new Error("rejected"));
      setTimeout(() => console.log("alive"), 50);
    `);
    expect(status).toBe(0);
    expect(lines).toHaveLength(1);
  });

  it("거절 이유가 Error 가 아니어도 Node 와 같은 오류로 종료한다", () => {
    const { lines, status } = run(`
      captureUncaughtErrors();
      Promise.reject("plain");
    `);
    expect(status).toBe(1);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ "exception.message": "plain" });
  });

  it("거절 리스너가 이미 있으면(Sentry 등) 같이 듣고 종료하지 않는다", () => {
    const { lines, status } = run(`
      process.on("unhandledRejection", () => {});
      captureUncaughtErrors();
      Promise.reject(new Error("rejected"));
      setTimeout(() => console.log("alive"), 50);
    `);
    expect(status).toBe(0);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      "exception.message": "rejected",
      "o11y.exception.source": "unhandledRejection",
    });
  });
});
