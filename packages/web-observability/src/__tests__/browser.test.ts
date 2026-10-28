// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

type OtlpBody = {
  resourceLogs: {
    resource: { attributes: { key: string; value: unknown }[] };
    scopeLogs: {
      logRecords: {
        attributes: { key: string; value: { stringValue?: string } }[];
        eventName: string;
        severityNumber: number;
        traceId?: string;
      }[];
      scope: { name: string };
    }[];
  }[];
};

const traceId = "0af7651916cd43dd8448eb211c80319c";

function sentBodies(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.map(
    ([, init]) => JSON.parse(String((init as RequestInit).body)) as OtlpBody
  );
}

function attr(
  record: OtlpBody["resourceLogs"][number]["scopeLogs"][number]["logRecords"][number],
  key: string
) {
  return record.attributes.find((a) => a.key === key)?.value.stringValue;
}

describe("startRum 오류 리포터", () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    document.head.innerHTML = `<meta name="traceparent" content="00-${traceId}-b7ad6b7169203331-01">`;
  });

  it("전역 오류·처리 안 된 거절·captureException 을 OTLP 로그로 보낸다", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal("fetch", fetchMock);
    const { captureException, startRum } = await import("../browser/index.ts");

    startRum({
      errors: { ignoreErrors: [/ignored/] },
      path: "/_/rum",
      release: "v1",
      sampleRates: { errors: 1, full: 0, vitals: 0 },
      service: "test-browser",
    });

    window.dispatchEvent(
      new ErrorEvent("error", {
        error: new TypeError("global boom"),
        message: "global boom",
      })
    );
    const rejection = new Event("unhandledrejection") as Event & {
      reason: unknown;
    };
    rejection.reason = new Error("rejected");
    window.dispatchEvent(rejection);
    window.dispatchEvent(
      new ErrorEvent("error", { error: new Error("ignored one") })
    );
    captureException(new Error("manual"), { "app.reason": "test" });

    window.dispatchEvent(new Event("pagehide"));

    expect(fetchMock).toHaveBeenCalledWith(
      `${location.origin}/_/rum/v1/logs`,
      expect.objectContaining({ credentials: "omit", keepalive: true })
    );
    const [body] = sentBodies(fetchMock);
    const scope = body?.resourceLogs[0]?.scopeLogs[0];
    expect(scope?.scope.name).toBe("watcha.rum.errors");
    const records = scope?.logRecords ?? [];
    expect(records.map((r) => attr(r, "exception.message"))).toEqual([
      "global boom",
      "rejected",
      "manual",
    ]);
    expect(records.map((r) => attr(r, "o11y.exception.source"))).toEqual([
      "global",
      "global",
      "manual",
    ]);
    expect(records[0]).toMatchObject({
      eventName: "exception",
      severityNumber: 17,
      traceId,
    });
    expect(attr(records[0]!, "exception.type")).toBe("TypeError");
    expect(attr(records[2]!, "app.reason")).toBe("test");
    expect(body?.resourceLogs[0]?.resource.attributes).toEqual(
      expect.arrayContaining([
        { key: "service.name", value: { stringValue: "test-browser" } },
        { key: "service.version", value: { stringValue: "v1" } },
      ])
    );
  });

  it("오류 플래그가 꺼진 세션은 보내지 않는다", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal("fetch", fetchMock);
    const { captureException, startRum } = await import("../browser/index.ts");
    startRum({
      path: "/_/rum",
      sampleRates: { errors: 0, full: 0, vitals: 0 },
      service: "test-browser",
    });
    captureException(new Error("manual"));
    window.dispatchEvent(new Event("pagehide"));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("logger", () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    document.head.innerHTML = "";
  });

  it("심각도·속성을 실은 OTLP 로그(eventName 없음)로 보낸다", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal("fetch", fetchMock);
    const { logger, startRum } = await import("../browser/index.ts");
    startRum({
      path: "/_/rum",
      sampleRates: { errors: 1, full: 0, vitals: 0 },
      service: "test-browser",
    });
    logger.warn("Player", { from: "shaka", payload: '{"code":1001}' });
    window.dispatchEvent(new Event("pagehide"));

    const scopes = sentBodies(fetchMock).flatMap(
      (body) => body.resourceLogs[0]?.scopeLogs ?? []
    );
    const logs = scopes.find((scope) => scope.scope.name === "watcha.rum.logs");
    const [record] = logs?.logRecords ?? [];
    expect(record).toMatchObject({ severityNumber: 13 });
    expect(record).not.toHaveProperty("eventName");
    expect(attr(record!, "from")).toBe("shaka");
    expect(attr(record!, "event.name")).toBeUndefined();
  });
});

describe("통합 진입점(브라우저 구현)", () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    document.head.innerHTML = "";
  });

  it("init·captureException·logger 가 같은 수신 경로로 보낸다", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal("fetch", fetchMock);
    const O11y = await import("../index.browser.ts");
    O11y.init({
      path: "/_/rum",
      sampleRates: { errors: 1, full: 0, vitals: 0 },
      service: "test-browser",
    });
    O11y.captureException(new Error("facade"));
    O11y.logger.info("hello");
    window.dispatchEvent(new Event("pagehide"));

    const scopes = sentBodies(fetchMock).flatMap(
      (body) => body.resourceLogs[0]?.scopeLogs ?? []
    );
    const byScope = Object.fromEntries(
      scopes.map((scope) => [scope.scope.name, scope.logRecords])
    );
    expect(attr(byScope["watcha.rum.errors"]![0]!, "exception.message")).toBe(
      "facade"
    );
    expect(byScope["watcha.rum.logs"]).toHaveLength(1);
    expect(O11y.getSessionId()).toMatch(/^[0-9a-f]{32}$/);
  });

  it("수신 경로가 없으면(RUM 이 꺼진 환경) 시작하지 않는다", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal("fetch", fetchMock);
    const O11y = await import("../index.browser.ts");
    O11y.init();
    O11y.captureException(new Error("ignored"));
    window.dispatchEvent(new Event("pagehide"));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("rumOptionsFromEnv", () => {
  it("RUM_ENABLED·경로·서비스명이 있어야 켠다", async () => {
    const { rumOptionsFromEnv } = await import("../browser/index.ts");
    expect(rumOptionsFromEnv({ RUM_ENABLED: "true", RUM_PATH: "/_/rum" })).toBe(
      undefined
    );
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
