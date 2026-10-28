import type {
  Logger,
  LoggerProvider,
  LogRecord,
} from "@opentelemetry/api-logs";
import { ErrorsInstrumentation } from "@opentelemetry/browser-instrumentation/experimental/errors";

import type { TraceContext } from "../shared/traceparent.ts";
import type { ErrorFilterOptions, ErrorRecord } from "./error-filter.ts";
import { ErrorFilter, exceptionAttributes } from "./error-filter.ts";
import type { Attributes, AttributeValue } from "./otlp-logs.ts";
import { OtlpLogSender } from "./otlp-logs.ts";
import type { SessionFlags } from "./session.ts";

const SEVERITY_ERROR = 17;
const FLUSH_DELAY_MS = 2000;

type Reporter = {
  report: (error: unknown, attributes: Attributes) => void;
};

let reporter: Reporter | undefined;

/**
 * 전체 세션 대상 오류 리포터.
 * - 전역 오류(`error`·`unhandledrejection`)는 OTel 공식 `ErrorsInstrumentation` 이 잡고,
 *   전송은 SDK 없이 이 패키지의 OTLP 로그 전송기로 한다(공식 계측의 로그 형식 그대로: `eventName: "exception"`)
 * - 명시적 보고(`captureException`)도 같은 필터·형식을 탄다
 */
export function startErrorReporter(
  endpoint: string,
  resource: Attributes,
  flags: SessionFlags,
  pageTrace: TraceContext | undefined,
  options: ErrorFilterOptions
) {
  if (reporter) {
    return;
  }
  const sender = new OtlpLogSender(endpoint, resource, "watcha.rum.errors");
  const filter = new ErrorFilter(options);

  const report = (error: unknown, attributes: Attributes) => {
    const record = filter.apply({
      attributes: {
        ...exceptionAttributes(error),
        ...attributes,
        "o11y.session_id": flags.sid,
        "rum.sdk": flags.full ? "full" : "lite",
        "url.path": location.pathname,
      },
      error,
    });
    if (!record) {
      return;
    }
    const now = Date.now();
    sender.push({
      attributes: record.attributes,
      body: String(record.attributes["exception.message"] ?? "exception"),
      eventName: "exception",
      observedTime: now,
      severityNumber: SEVERITY_ERROR,
      severityText: "ERROR",
      time: now,
      trace: pageTrace,
    });
    sender.flushAfter(FLUSH_DELAY_MS);
  };
  reporter = { report };

  // 공식 계측이 만든 로그 레코드를 받아 같은 경로로 보낸다. 원본 오류는 applyCustomAttributes 에서 넘겨받는다
  let pendingError: unknown;
  const logger: Logger = {
    emit: (logRecord: LogRecord) => {
      const error = pendingError ?? logRecord.attributes?.["exception.message"];
      pendingError = undefined;
      report(error, { "o11y.exception.source": "global" });
    },
    enabled: () => true,
  };
  const loggerProvider: LoggerProvider = { getLogger: () => logger };
  const instrumentation = new ErrorsInstrumentation({
    applyCustomAttributes: (error) => {
      pendingError = error;
      return {};
    },
    enabled: false,
  });
  instrumentation.setLoggerProvider(loggerProvider);
  instrumentation.enable();
}

/**
 * 잡은 오류를 직접 보고한다(Sentry `captureException` 자리).
 * 리포터가 꺼진 세션이거나 시작 전이면 아무것도 하지 않는다.
 */
export function captureException(
  error: unknown,
  attributes: Record<string, AttributeValue | undefined> = {}
) {
  reporter?.report(error, { "o11y.exception.source": "manual", ...attributes });
}

export type { ErrorFilterOptions, ErrorRecord };
