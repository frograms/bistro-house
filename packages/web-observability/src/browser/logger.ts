import type { TraceContext } from "../shared/traceparent.ts";
import type { Attributes, AttributeValue } from "./otlp-logs.ts";
import { OtlpLogSender } from "./otlp-logs.ts";
import type { SessionFlags } from "./session.ts";

const SEVERITY = {
  debug: { number: 5, text: "DEBUG" },
  error: { number: 17, text: "ERROR" },
  info: { number: 9, text: "INFO" },
  warn: { number: 13, text: "WARN" },
} as const;

type Level = keyof typeof SEVERITY;
type LogAttributes = Record<string, AttributeValue | undefined>;

const FLUSH_DELAY_MS = 5000;
const MAX_PER_PAGE = 100;

let emit:
  | ((level: Level, message: string, attributes: LogAttributes) => void)
  | undefined;

/** 로그 전송을 시작한다(오류 리포터와 같은 세션 표본을 따른다) */
export function startLogger(
  endpoint: string,
  resource: Attributes,
  flags: SessionFlags,
  pageTrace: TraceContext | undefined
) {
  if (emit) {
    return;
  }
  const sender = new OtlpLogSender(endpoint, resource, "watcha.rum.logs");
  let sent = 0;
  emit = (level, message, attributes) => {
    if (sent >= MAX_PER_PAGE) {
      return;
    }
    sent += 1;
    const now = Date.now();
    sender.push({
      attributes: {
        ...attributes,
        "o11y.session_id": flags.sid,
        "rum.sdk": flags.full ? "full" : "lite",
        "url.path": location.pathname,
      },
      body: message,
      observedTime: now,
      severityNumber: SEVERITY[level].number,
      severityText: SEVERITY[level].text,
      time: now,
      trace: pageTrace,
    });
    sender.flushAfter(FLUSH_DELAY_MS);
  };
}

/**
 * 구조화 로그(Sentry `logger` 자리). 오류는 `captureException` 으로 보낸다.
 * 리포터가 꺼진 세션이거나 `startRum` 전이면 아무것도 하지 않는다. 페이지당 100건까지만 보낸다.
 */
export const logger = {
  debug: (message: string, attributes: LogAttributes = {}) =>
    emit?.("debug", message, attributes),
  error: (message: string, attributes: LogAttributes = {}) =>
    emit?.("error", message, attributes),
  info: (message: string, attributes: LogAttributes = {}) =>
    emit?.("info", message, attributes),
  warn: (message: string, attributes: LogAttributes = {}) =>
    emit?.("warn", message, attributes),
};
