import type { Attributes, AttributeValue } from "../options.ts";
import type { TraceContext } from "../shared/traceparent.ts";

export type OtlpLogRecord = {
  attributes: Attributes;
  body: string;
  /** 이벤트 레코드만(일반 로그는 비운다 — 비우면 eventName·event.name 을 싣지 않는다) */
  eventName?: string;
  /** epoch ms */
  observedTime: number;
  severityNumber: number;
  severityText: string;
  /** epoch ms */
  time: number;
  trace?: TraceContext;
};

function toOtlpValue(value: NonNullable<AttributeValue>) {
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { intValue: value }
      : { doubleValue: value };
  }
  if (typeof value === "boolean") {
    return { boolValue: value };
  }
  return { stringValue: value };
}

function toOtlpAttributes(attributes: Attributes) {
  return Object.entries(attributes).flatMap(([key, value]) =>
    value === undefined ? [] : [{ key, value: toOtlpValue(value) }]
  );
}

const MAX_RECORDS_PER_REQUEST = 10;

function toNano(ms: number) {
  return `${Math.round(ms)}000000`;
}

/**
 * OTLP/HTTP JSON 로그 전송기 — SDK 없이 같은 출처 수신 경로로 쿠키 없이 보낸다.
 * 페이지를 떠날 때(hidden·pagehide)는 항상 비우고, `flushAfter` 로 더 이른 전송을 예약할 수 있다.
 */
export class OtlpLogSender {
  private readonly queue: OtlpLogRecord[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly endpoint: string,
    private readonly resource: Attributes,
    private readonly scopeName: string
  ) {
    addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flush();
      }
    });
    addEventListener("pagehide", () => this.flush());
  }

  push(record: OtlpLogRecord) {
    this.queue.push(record);
  }

  /** `delay` ms 안에 보낸다(이미 예약돼 있으면 그대로 둔다) */
  flushAfter(delay: number) {
    if (this.timer === undefined) {
      this.timer = setTimeout(() => this.flush(), delay);
    }
  }

  flush() {
    clearTimeout(this.timer);
    this.timer = undefined;
    // keepalive 요청은 진행 중인 본문 합계가 64KB 로 제한되므로 요청 하나를 작게 나눈다
    // (한도를 넘은 요청만 실패하고 나머지는 전송된다)
    while (this.queue.length > 0) {
      this.send(this.queue.splice(0, MAX_RECORDS_PER_REQUEST));
    }
  }

  private send(records: OtlpLogRecord[]) {
    const logRecords = records.map((record) => ({
      ...(record.trace && {
        spanId: record.trace.spanId,
        traceId: record.trace.traceId,
      }),
      attributes: toOtlpAttributes({
        "event.name": record.eventName,
        ...record.attributes,
      }),
      body: { stringValue: record.body },
      eventName: record.eventName,
      observedTimeUnixNano: toNano(record.observedTime),
      severityNumber: record.severityNumber,
      severityText: record.severityText,
      timeUnixNano: toNano(record.time),
    }));
    const body = JSON.stringify({
      resourceLogs: [
        {
          resource: { attributes: toOtlpAttributes(this.resource) },
          scopeLogs: [{ logRecords, scope: { name: this.scopeName } }],
        },
      ],
    });
    fetch(this.endpoint, {
      body,
      credentials: "omit",
      headers: { "content-type": "application/json" },
      keepalive: true,
      method: "POST",
    }).catch(() => undefined);
  }
}
