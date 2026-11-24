import type {
  Attributes,
  BrowserOptions,
  Context,
  Logger,
} from "../../type/observability-types.ts";
import {
  contextAttributes,
  EXCEPTION_SOURCE,
  exceptionAttributes,
} from "../../util/attribute-utils.ts";
import type { TraceContext } from "../../util/traceparent-utils.ts";
import { ErrorFilter } from "./browser-error-filter.ts";
import { OtlpLogSender } from "./browser-otlp-logs.ts";
import type { SessionFlags } from "./browser-session.ts";
import { getBrowserUser } from "./browser-user.ts";

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
 * - `captureUncaughtErrors` 가 false 가 아니면 전역 오류(`error`·`unhandledrejection`)를 잡아 error 레벨 예외로 보낸다
 * - SSR trace 연결(traceId·spanId)은 첫 문서의 경로에 머무는 동안만 — SPA 이동 뒤의 기록은 그 SSR 요청과 무관하다
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
  const documentPath = location.pathname;
  let linkedTrace = pageTrace;

  // 전역 오류는 이유가 문자열("Script error." 등)이어도 예외로 보낸다
  emit = (level, messageOrError, context, asException) => {
    if (linkedTrace && location.pathname !== documentPath) {
      linkedTrace = undefined;
    }
    const isMessage = !asException && typeof messageOrError === "string";
    const user = getBrowserUser();
    let attributes: Attributes = {
      ...contextAttributes(context),
      "rum.sdk": flags.tracing ? "full" : "lite",
      "session.id": flags.sid,
      "url.path": location.pathname,
      ...(user && { "user.id": user.id }),
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
      trace: linkedTrace,
    };
    if (options.debug) {
      console.debug("[web-observability]", log);
    }
    sender.push(log);
    sender.flushAfter(isMessage ? LOG_FLUSH_DELAY_MS : ERROR_FLUSH_DELAY_MS);
  };

  if (options.captureUncaughtErrors !== false) {
    addEventListener("error", (event) => {
      // 교차 출처 스크립트 오류는 error 가 없고 message("Script error.")만 있다
      const error: unknown = event.error ?? (event.message || undefined);
      if (error != null) {
        emit?.(
          "error",
          error,
          { [EXCEPTION_SOURCE]: "browser.global_error" },
          true
        );
      }
    });
    addEventListener("unhandledrejection", (event) => {
      const { reason } = event as { reason: unknown };
      if (reason != null) {
        emit?.(
          "error",
          reason,
          { [EXCEPTION_SOURCE]: "browser.unhandled_rejection" },
          true
        );
      }
    });
  }
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
