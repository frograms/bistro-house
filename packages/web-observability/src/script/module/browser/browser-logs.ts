import type * as OtelLogs from "@opentelemetry/api-logs";
import { ErrorsInstrumentation } from "@opentelemetry/browser-instrumentation/experimental/errors";

import type {
  Attributes,
  BrowserOptions,
  Context,
  Logger,
} from "../../type/observability-types.ts";
import {
  contextAttributes,
  exceptionAttributes,
} from "../../util/attribute-utils.ts";
import type { TraceContext } from "../../util/traceparent-utils.ts";
import { ErrorFilter } from "./browser-error-filter.ts";
import { OtlpLogSender } from "./browser-otlp-logs.ts";
import type { SessionFlags } from "./browser-session.ts";

type Level = keyof Logger;

const SEVERITY: Record<Level, { number: number; text: string }> = {
  debug: { number: 5, text: "DEBUG" },
  error: { number: 17, text: "ERROR" },
  info: { number: 9, text: "INFO" },
  warn: { number: 13, text: "WARN" },
};
const ERROR_FLUSH_DELAY_MS = 2000;
const LOG_FLUSH_DELAY_MS = 5000;
const MAX_MESSAGES_PER_PAGE = 100;

let emit:
  | ((
      level: Level,
      messageOrError: unknown,
      context: Context,
      asException?: boolean
    ) => void)
  | undefined;

/**
 * 로그·예외 전송을 시작한다.
 * - 문자열은 메시지 로그(페이지당 100건)
 * - 그 밖의 값은 예외 로그(`exception.*`, eventName `exception`) — 오류 표본·필터·중복 제거를 거친다
 * - 전역 오류(`error`·`unhandledrejection`)는 OTel 공식 `ErrorsInstrumentation` 이 잡아 error 레벨 예외로 보낸다
 */
export function startLogs(
  endpoint: string,
  resource: Attributes,
  flags: SessionFlags,
  pageTrace: TraceContext | undefined,
  options: BrowserOptions
) {
  const sender = new OtlpLogSender(endpoint, resource, "watcha.rum.logs");
  const filter = new ErrorFilter(options);
  let messages = 0;

  // 전역 오류는 이유가 문자열("Script error." 등)이어도 예외로 보낸다
  emit = (level, messageOrError, context, asException) => {
    const isMessage = !asException && typeof messageOrError === "string";
    let attributes: Attributes = {
      ...contextAttributes(context),
      "o11y.session_id": flags.sid,
      "rum.sdk": flags.tracing ? "full" : "lite",
      "url.path": location.pathname,
      ...(options.user && { "user.id": options.user.id }),
    };
    if (isMessage) {
      if (messages >= MAX_MESSAGES_PER_PAGE) {
        return;
      }
      messages += 1;
    } else {
      if (!flags.errors) {
        return;
      }
      const record = filter.apply({
        attributes: { ...exceptionAttributes(messageOrError), ...attributes },
        error: messageOrError,
      });
      if (!record) {
        return;
      }
      ({ attributes } = record);
    }
    const now = Date.now();
    const log = {
      attributes,
      body: isMessage
        ? messageOrError
        : String(attributes["exception.message"] ?? "exception"),
      eventName: isMessage ? undefined : "exception",
      observedTime: now,
      severityNumber: SEVERITY[level].number,
      severityText: SEVERITY[level].text,
      time: now,
      trace: pageTrace,
    };
    if (options.debug) {
      console.debug("[web-observability]", log);
    }
    sender.push(log);
    sender.flushAfter(isMessage ? LOG_FLUSH_DELAY_MS : ERROR_FLUSH_DELAY_MS);
  };

  // 공식 계측이 만든 로그 레코드를 받아 같은 경로로 보낸다. 원본 오류는 applyCustomAttributes 에서 넘겨받는다
  let pendingError: unknown;
  const otelLogger: OtelLogs.Logger = {
    emit: (logRecord) => {
      const error = pendingError ?? logRecord.attributes?.["exception.message"];
      pendingError = undefined;
      emit?.("error", error, { "o11y.exception.source": "global" }, true);
    },
    enabled: () => true,
  };
  const loggerProvider: OtelLogs.LoggerProvider = {
    getLogger: () => otelLogger,
  };
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

const log =
  (level: Level) =>
  (messageOrError: unknown, context: Context = {}) => {
    emit?.(level, messageOrError, context);
  };

/** `init` 전이거나 보내지 않는 환경이면 아무것도 하지 않는다 */
export const browserLogger: Logger = {
  debug: log("debug"),
  error: log("error"),
  info: log("info"),
  warn: log("warn"),
};
