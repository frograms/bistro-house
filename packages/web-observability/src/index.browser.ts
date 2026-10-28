/**
 * 앱이 쓰는 통합 진입점(브라우저 구현). 서버 구현(`index.node.ts`)과 같은 이름·시그니처를 내보내고,
 * 번들러가 `browser`·`node` 조건으로 하나를 고른다.
 */
import { captureException as reportException } from "./browser/errors.ts";
import { startRum } from "./browser/index.ts";
import { logger as browserLogger } from "./browser/logger.ts";
import { getRumSessionId } from "./browser/session.ts";
import type { Attributes, InitOptions, Logger } from "./facade/types.ts";

/**
 * 관측을 시작한다(Sentry `init` 자리). 브라우저에서는 hydrate 전에 한 번 호출한다.
 * 수신 경로·서비스명이 없으면(RUM 이 꺼진 환경) 아무것도 하지 않는다.
 */
export function init(options: InitOptions = {}) {
  if ("path" in options && options.path && options.service) {
    startRum(options);
  }
}

/** 오류를 보고한다(Sentry `captureException` 자리) */
export function captureException(error: unknown, attributes?: Attributes) {
  reportException(error, attributes);
}

/** 구조화 로그(Sentry `logger` 자리) */
export const logger: Logger = browserLogger;

/** RUM 세션 ID(`o11y.session_id`). 서버에서는 undefined */
export function getSessionId(): string | undefined {
  return getRumSessionId();
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
