export type TraceContext = { spanId: string; traceId: string };

const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/;

/** W3C traceparent 값을 trace_id·span_id 로 나눈다. 형식이 맞지 않으면 undefined */
export function parseTraceparent(
  value: string | null | undefined
): TraceContext | undefined {
  const match = TRACEPARENT.exec(value ?? "");
  if (!match?.[1] || !match[2]) {
    return undefined;
  }
  return { spanId: match[2], traceId: match[1] };
}

/** 샘플된 trace 의 W3C traceparent 값 */
export function formatSampledTraceparent({ spanId, traceId }: TraceContext) {
  return `00-${traceId}-${spanId}-01`;
}
