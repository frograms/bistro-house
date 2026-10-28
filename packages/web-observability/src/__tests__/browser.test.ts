// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BrowserOptions } from "../options.ts";

type LogRecord = {
  attributes: { key: string; value: { stringValue?: string } }[];
  body: { stringValue: string };
  eventName?: string;
  severityNumber: number;
  traceId?: string;
};

type OtlpBody = {
  resourceLogs: {
    resource: { attributes: { key: string; value: unknown }[] };
    scopeLogs: { logRecords: LogRecord[]; scope: { name: string } }[];
  }[];
};

const traceId = "0af7651916cd43dd8448eb211c80319c";
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  sessionStorage.clear();
  document.head.innerHTML = "";
  fetchMock = vi.fn(() => Promise.resolve(new Response()));
  vi.stubGlobal("fetch", fetchMock);
});

/** 페이지를 떠나며 보낸 OTLP 본문 */
function flush() {
  window.dispatchEvent(new Event("pagehide"));
  return fetchMock.mock.calls.map(
    ([, init]) => JSON.parse(String((init as RequestInit).body)) as OtlpBody
  );
}

/** 보낸 로그 레코드(scope `watcha.rum.logs`) */
function sentLogs(bodies: OtlpBody[]) {
  return bodies
    .flatMap((body) => body.resourceLogs[0]?.scopeLogs ?? [])
    .filter((s) => s.scope.name === "watcha.rum.logs")
    .flatMap((s) => s.logRecords);
}

function attr(record: LogRecord | undefined, key: string) {
  return record?.attributes.find((a) => a.key === key)?.value.stringValue;
}

async function start(options: Partial<BrowserOptions> = {}) {
  const O11y = await import("../index.browser.ts");
  O11y.init({
    endpoint: "/_/rum",
    release: "v1",
    service: "test-browser",
    tracesSampleRate: 0,
    webVitalsSampleRate: 0,
    ...options,
  });
  return O11y;
}

describe("예외", () => {
  it("전역 오류·처리 안 된 거절·logger.error(오류 객체)를 예외 로그로 보낸다", async () => {
    document.head.innerHTML = `<meta name="traceparent" content="00-${traceId}-b7ad6b7169203331-01">`;
    const { logger } = await start({ ignoreErrors: [/ignored/] });

    window.dispatchEvent(
      new ErrorEvent("error", { error: new TypeError("global boom") })
    );
    window.dispatchEvent(
      Object.assign(new Event("unhandledrejection"), {
        reason: new Error("rejected"),
      })
    );
    window.dispatchEvent(
      new ErrorEvent("error", { error: new Error("ignored one") })
    );
    // 교차 출처 스크립트 오류 — 이유가 문자열이어도 예외
    window.dispatchEvent(
      new ErrorEvent("error", { error: null, message: "Script error." })
    );
    logger.error(new Error("manual"), { request: { id: 7 }, step: "save" });

    const bodies = flush();
    const records = sentLogs(bodies);
    expect(fetchMock).toHaveBeenCalledWith(
      `${location.origin}/_/rum/v1/logs`,
      expect.objectContaining({ credentials: "omit", keepalive: true })
    );
    // ignoreErrors 에 걸린 오류는 빠진다
    expect(records.map((r) => attr(r, "exception.message"))).toEqual([
      "global boom",
      "rejected",
      "Script error.",
      "manual",
    ]);
    expect(records[0]).toMatchObject({
      eventName: "exception",
      severityNumber: 17,
      traceId,
    });
    expect(attr(records[0], "exception.type")).toBe("TypeError");
    expect(attr(records[0], "o11y.exception.source")).toBe("global");
    // 컨텍스트 — 원시값은 그대로, 객체는 JSON 문자열
    expect(records[2]).toMatchObject({ eventName: "exception" });
    expect(attr(records[3], "step")).toBe("save");
    expect(attr(records[3], "request")).toBe('{"id":7}');
    expect(bodies[0]?.resourceLogs[0]?.resource.attributes).toEqual(
      expect.arrayContaining([
        { key: "service.name", value: { stringValue: "test-browser" } },
        { key: "service.version", value: { stringValue: "v1" } },
      ])
    );
  });

  it("오류 표본에서 빠진 세션은 예외만 보내지 않는다(메시지 로그는 보낸다)", async () => {
    const { logger } = await start({ sampleRate: 0 });
    logger.error(new Error("dropped"));
    logger.info("kept");
    const records = sentLogs(flush());
    expect(records.map((r) => r.body.stringValue)).toEqual(["kept"]);
  });
});

describe("메시지 로그", () => {
  it("문자열은 심각도와 컨텍스트를 실은 일반 로그(eventName 없음)", async () => {
    const { logger } = await start({ user: { id: "u1" } });
    logger.warn("Player", { from: "shaka" });

    const [record] = sentLogs(flush());
    expect(record).toMatchObject({
      body: { stringValue: "Player" },
      severityNumber: 13,
    });
    expect(record).not.toHaveProperty("eventName");
    expect(attr(record, "from")).toBe("shaka");
    expect(attr(record, "user.id")).toBe("u1");
  });
});

describe("init", () => {
  it("endpoint 가 없으면 아무것도 보내지 않고, debug 면 경고한다", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const O11y = await import("../index.browser.ts");
    O11y.init({ debug: true, service: "test-browser" });
    O11y.logger.error(new Error("ignored"));
    flush();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("enabled: false 면 보내지 않는다", async () => {
    const { logger } = await start({ enabled: false });
    logger.info("ignored");
    flush();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("탭 세션 ID 를 돌려준다", async () => {
    const O11y = await start();
    expect(O11y.getSessionId()).toMatch(/^[0-9a-f]{32}$/);
  });
});
