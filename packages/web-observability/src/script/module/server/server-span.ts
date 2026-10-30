// 통합 진입점(.)의 서버 구현이 쓰는 스팬 도구 — @opentelemetry/api 만 쓴다(@opentelemetry/core 는 /server·/sentry 전용 peer)
import type { SpanContext } from "@opentelemetry/api";
import { SpanStatusCode, trace, TraceFlags } from "@opentelemetry/api";

export function isSampled(spanContext: SpanContext | undefined) {
  return (
    ((spanContext?.traceFlags ?? TraceFlags.NONE) & TraceFlags.SAMPLED) !== 0
  );
}

/** 활성 서버 스팬에 예외를 남기고 상태를 ERROR 로 둔다 */
export function recordExceptionOnActiveSpan(error: unknown) {
  const span = trace.getActiveSpan();
  if (!span) {
    return undefined;
  }
  const exception = error instanceof Error ? error : new Error(String(error));
  span.recordException(exception);
  span.setStatus({ code: SpanStatusCode.ERROR, message: exception.message });
  return span.spanContext();
}
