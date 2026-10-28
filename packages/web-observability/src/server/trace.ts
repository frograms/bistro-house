import type { SpanContext } from "@opentelemetry/api";
import { context, SpanStatusCode, trace, TraceFlags } from "@opentelemetry/api";
import { getRPCMetadata, RPCType } from "@opentelemetry/core";

import { formatSampledTraceparent } from "../shared/traceparent.ts";

export function isSampled(spanContext: SpanContext | undefined) {
  return (
    ((spanContext?.traceFlags ?? TraceFlags.NONE) & TraceFlags.SAMPLED) !== 0
  );
}

/** 루트 로더에서 `<meta name="traceparent">` 값. 샘플되지 않은 요청은 없음 */
export function getServerTraceparent() {
  const spanContext = trace.getActiveSpan()?.spanContext();
  if (!spanContext || !isSampled(spanContext)) {
    return undefined;
  }
  return formatSampledTraceparent(spanContext);
}

/**
 * 문서 응답 Server-Timing 에도 실어, 루트 로더를 건너뛰거나 실패한 응답(404·500 등)도
 * 브라우저가 SSR 트레이스에 잇게 한다
 */
export function appendTraceparentServerTiming(headers: Headers) {
  const traceparent = getServerTraceparent();
  if (traceparent) {
    headers.append("Server-Timing", `traceparent;desc="${traceparent}"`);
  }
}

/** 매칭된 라우트를 서버 스팬의 http.route·이름(`GET /route`)으로 남긴다 */
export function setServerRoute(method: string, route: string) {
  const metadata = getRPCMetadata(context.active());
  if (metadata?.type !== RPCType.HTTP) {
    return;
  }
  metadata.route = route;
  metadata.span.updateName(`${method} ${route}`);
}

type RouteMatch = { route: { path?: string } };

/**
 * React Router `staticHandlerContext.matches` 를 라우트 패턴(`/:lang/search`)으로.
 * 루트만 매칭되면(무매칭 404 의 short-circuit) 라우트를 모르므로 undefined
 */
export function routePathFromMatches(matches: readonly RouteMatch[]) {
  if (matches.length < 2) {
    return undefined;
  }
  const paths = matches.flatMap((match) =>
    match.route.path ? [match.route.path] : []
  );
  return `/${paths.join("/")}`.replace(/\/{2,}/g, "/");
}

/** 경로 접두사 목록으로 계측·액세스 로그 제외 판별 함수를 만든다(쿼리 문자열은 무시) */
export function createPathMatcher(prefixes: readonly string[]) {
  return (url: string) => {
    const path = url.split("?")[0] ?? url;
    return prefixes.some((prefix) => path.startsWith(prefix));
  };
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
