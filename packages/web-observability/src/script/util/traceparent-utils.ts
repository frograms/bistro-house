export type TraceContext = { spanId: string; traceId: string };

const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

/** W3C traceparent 값을 trace_id·span_id·샘플 여부로 나눈다. 형식이 맞지 않으면 undefined */
export function parseTraceparent(
  value: string | null | undefined
): (TraceContext & { sampled: boolean }) | undefined {
  const match = TRACEPARENT.exec(value ?? "");
  if (!match?.[1] || !match[2] || !match[3]) {
    return undefined;
  }
  return {
    sampled: (parseInt(match[3], 16) & 1) === 1,
    spanId: match[2],
    traceId: match[1],
  };
}

/** W3C traceparent 값. 샘플이면 `-01`, 아니면 `-00` */
export function formatTraceparent({
  sampled,
  spanId,
  traceId,
}: TraceContext & { sampled: boolean }) {
  return `00-${traceId}-${spanId}-${sampled ? "01" : "00"}`;
}
