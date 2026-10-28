/**
 * 앱이 쓰는 통합 진입점(서버 구현). 브라우저 구현(`index.browser.ts`)과 같은 이름·시그니처를 내보낸다.
 * SSR 렌더링 중 같은 코드가 서버에서 돌면 이 구현이 쓰인다.
 */
import type { Attributes, InitOptions, Logger } from "./facade/types.ts";
import {
  captureServerException,
  captureUncaughtErrors,
  writeJsonLog,
} from "./server/log.ts";

let initialized = false;

/**
 * 관측을 시작한다(Sentry `init` 자리). 서버에서는 `Sentry.init` 등 다른 처리기 등록 뒤에 한 번 호출한다.
 * 브라우저 전용 옵션(RUM)은 무시한다.
 */
export function init(options: InitOptions = {}) {
  if (initialized) {
    return;
  }
  initialized = true;
  if (
    !("captureUncaughtErrors" in options) ||
    options.captureUncaughtErrors !== false
  ) {
    captureUncaughtErrors();
  }
}

/** 오류를 보고한다(Sentry `captureException` 자리) — 활성 서버 스팬에 기록하고 JSON 로그 한 줄을 남긴다 */
export function captureException(error: unknown, attributes?: Attributes) {
  captureServerException(error, attributes);
}

const log =
  (level: "debug" | "error" | "info" | "warn") =>
  (message: string, attributes: Attributes = {}) => {
    writeJsonLog(level, "app", message, attributes);
  };

/** 구조화 로그(Sentry `logger` 자리) — trace_id·span_id 를 포함한 구조화 JSON 한 줄 */
export const logger: Logger = {
  debug: log("debug"),
  error: log("error"),
  info: log("info"),
  warn: log("warn"),
};

/** RUM 세션 ID — 서버에서는 없다 */
export function getSessionId(): string | undefined {
  return undefined;
}

export type {
  ErrorFilterOptions,
  ErrorRecord,
} from "./browser/error-filter.ts";
export type { SampleRates } from "./browser/session.ts";
export type {
  Attributes,
  InitOptions,
  Logger,
  ServerInitOptions,
} from "./facade/types.ts";
export type { RumEnv } from "./shared/rum-env.ts";
export { pickRumEnv } from "./shared/rum-env.ts";
export type { RumOptions } from "./shared/rum-options.ts";
export { rumOptionsFromEnv } from "./shared/rum-options.ts";
export { parseSampleRate } from "./shared/sample-rate.ts";
export type { TraceContext } from "./shared/traceparent.ts";
export {
  formatSampledTraceparent,
  parseTraceparent,
} from "./shared/traceparent.ts";
