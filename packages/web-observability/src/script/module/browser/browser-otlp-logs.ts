import type {
  Attributes,
  AttributeValue,
} from "../../type/observability-types.ts";
import type { TraceContext } from "../../util/traceparent-utils.ts";

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

// keepalive 요청은 진행 중인 본문 합계가 64KiB 로 제한된다. 리소스·스코프 등 바깥 구조 몫을 남긴 요청 하나의 상한
const MAX_REQUEST_BYTES = 60 * 1024;

const encoder = new TextEncoder();

function toNano(ms: number) {
  return `${Math.round(ms)}000000`;
}

function toOtlpLogRecord(record: OtlpLogRecord) {
  return {
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
  };
}

/**
 * OTLP/HTTP JSON 로그 전송기 — SDK 없이 같은 출처 수신 경로로 쿠키 없이 보낸다.
 * 페이지를 떠날 때(hidden·pagehide)는 항상 비우고, `flushAfter` 로 더 이른 전송을 예약할 수 있다.
 * keepalive 는 페이지를 떠날 때만 쓴다(평소 전송까지 64KiB 한도를 나눠 쓰지 않게).
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
        this.flush(true);
      }
    });
    addEventListener("pagehide", () => this.flush(true));
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

  /** 큐를 비운다. 요청 하나가 `MAX_REQUEST_BYTES` 를 넘지 않게 바이트 기준으로 나눈다 */
  flush(keepalive = false) {
    clearTimeout(this.timer);
    this.timer = undefined;
    let batch: ReturnType<typeof toOtlpLogRecord>[] = [];
    let batchBytes = 0;
    for (const record of this.queue.splice(0)) {
      const logRecord = toOtlpLogRecord(record);
      const bytes = encoder.encode(JSON.stringify(logRecord)).length + 1;
      if (batch.length > 0 && batchBytes + bytes > MAX_REQUEST_BYTES) {
        this.send(batch, keepalive);
        batch = [];
        batchBytes = 0;
      }
      batch.push(logRecord);
      batchBytes += bytes;
    }
    if (batch.length > 0) {
      this.send(batch, keepalive);
    }
  }

  private send(
    logRecords: ReturnType<typeof toOtlpLogRecord>[],
    keepalive: boolean
  ) {
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
      keepalive,
      method: "POST",
    }).catch(() => undefined);
  }
}
