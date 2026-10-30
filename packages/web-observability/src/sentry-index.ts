/**
 * Sentry 와 함께 쓰는 기간의 연결 진입점(/sentry, 임시·서버 전용). Sentry 를 걷어내면 통째로 지운다.
 */
export {
  installW3CPropagator,
  sentryOptions,
} from "./script/module/sentry/sentry-bridge.ts";
