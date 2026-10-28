// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

type LogRecord = {
  attributes: { key: string; value: { stringValue?: string } }[];
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

/** 보낸 로그 중 해당 scope 의 레코드 */
function recordsOf(bodies: OtlpBody[], scope: string) {
  return bodies
    .flatMap((body) => body.resourceLogs[0]?.scopeLogs ?? [])
    .filter((s) => s.scope.name === scope)
    .flatMap((s) => s.logRecords);
}

function attr(record: LogRecord | undefined, key: string) {
  return record?.attributes.find((a) => a.key === key)?.value.stringValue;
}

async function startWithErrors(errors: number) {
  const rum = await import("../browser/index.ts");
  rum.startRum({
    errors: { ignoreErrors: [/ignored/] },
    path: "/_/rum",
    release: "v1",
    sampleRates: { errors, full: 0, vitals: 0 },
    service: "test-browser",
  });
  return rum;
}

describe("오류 리포터", () => {
  it("전역 오류·처리 안 된 거절·captureException 을 보낸다", async () => {
    document.head.innerHTML = `<meta name="traceparent" content="00-${traceId}-b7ad6b7169203331-01">`;
    const { captureException } = await startWithErrors(1);

    window.dispatchEvent(
      new ErrorEvent("error", { error: new TypeError("global boom") })
    );
    const rejection = Object.assign(new Event("unhandledrejection"), {
      reason: new Error("rejected"),
    });
    window.dispatchEvent(rejection);
    window.dispatchEvent(
      new ErrorEvent("error", { error: new Error("ignored one") })
    );
    captureException(new Error("manual"), { "app.reason": "test" });

    const bodies = flush();
    const records = recordsOf(bodies, "watcha.rum.errors");
    expect(fetchMock).toHaveBeenCalledWith(
      `${location.origin}/_/rum/v1/logs`,
      expect.objectContaining({ credentials: "omit", keepalive: true })
    );
    // ignoreErrors 에 걸린 오류는 빠진다
    expect(records.map((r) => attr(r, "exception.message"))).toEqual([
      "global boom",
      "rejected",
      "manual",
    ]);
    expect(records[0]).toMatchObject({
      eventName: "exception",
      severityNumber: 17,
      traceId,
    });
    expect(attr(records[0], "exception.type")).toBe("TypeError");
    expect(attr(records[2], "o11y.exception.source")).toBe("manual");
    expect(attr(records[2], "app.reason")).toBe("test");
    expect(bodies[0]?.resourceLogs[0]?.resource.attributes).toEqual(
      expect.arrayContaining([
        { key: "service.name", value: { stringValue: "test-browser" } },
        { key: "service.version", value: { stringValue: "v1" } },
      ])
    );
  });

  it("오류 수집이 꺼진 세션은 보내지 않는다", async () => {
    const { captureException } = await startWithErrors(0);
    captureException(new Error("manual"));
    flush();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("logger", () => {
  it("심각도와 속성을 실은 일반 로그로 보낸다", async () => {
    const { logger } = await startWithErrors(1);
    logger.warn("Player", { from: "shaka" });

    const [record] = recordsOf(flush(), "watcha.rum.logs");
    expect(record).toMatchObject({ severityNumber: 13 });
    expect(record).not.toHaveProperty("eventName");
    expect(attr(record, "from")).toBe("shaka");
  });
});

describe("통합 진입점(브라우저)", () => {
  it("RUM 설정이 없으면 init 해도 아무것도 보내지 않는다", async () => {
    const O11y = await import("../index.browser.ts");
    O11y.init();
    O11y.captureException(new Error("ignored"));
    flush();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("rumOptionsFromEnv", () => {
  it("RUM_ENABLED·경로·서비스명이 모두 있어야 켠다", async () => {
    const { rumOptionsFromEnv } = await import("../browser/index.ts");
    expect(
      rumOptionsFromEnv({ RUM_ENABLED: "true", RUM_PATH: "/_/rum" })
    ).toBeUndefined();
    expect(
      rumOptionsFromEnv({
        RUM_ENABLED: "true",
        RUM_FULL_SAMPLE_RATE: "0.5",
        RUM_PATH: "/_/rum",
        RUM_SERVICE: "a-browser",
      })
    ).toMatchObject({
      maskText: true,
      path: "/_/rum",
      sampleRates: { errors: 1, full: 0.5, replay: 0.1, vitals: 1 },
      service: "a-browser",
    });
  });
});
