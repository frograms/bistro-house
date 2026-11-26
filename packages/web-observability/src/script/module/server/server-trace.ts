import { context, isSpanContextValid, trace } from "@opentelemetry/api";
import { getRPCMetadata, RPCType } from "@opentelemetry/core";

import { formatTraceparent } from "../../util/traceparent-utils.ts";
import { isSampled } from "./server-span.ts";

/**
 * 루트 로더에서 `<meta name="traceparent">` 값. 활성 서버 스팬이 없으면 undefined.
 * 샘플되지 않은 요청도 `-00` 으로 낸다 — 브라우저 문서 로드 계측(ParentBased)이 그 결정을 따라
 * 서버 트레이스가 없는 문서 로드 트레이스를 따로 만들지 않는다.
 */
export function getServerTraceparent() {
  const spanContext = trace.getActiveSpan()?.spanContext();
  if (!spanContext || !isSpanContextValid(spanContext)) {
    return undefined;
  }
  return formatTraceparent({ ...spanContext, sampled: isSampled(spanContext) });
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
