import type {
  Context,
  TextMapPropagator,
  TextMapSetter,
} from "@opentelemetry/api";
import {
  isSpanContextValid,
  propagation,
  trace,
  TraceFlags,
} from "@opentelemetry/api";
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from "@opentelemetry/core";

/**
 * 샘플된 trace ID 를 `headers` 의 각 이름으로 싣는다.
 * 미샘플이거나 이름이 비어 있으면 그 헤더는 싣지 않는다.
 */
export const traceIdHeaderPropagator = (
  headers: ReadonlyArray<string>
): TextMapPropagator => {
  const names = headers.filter((header) => header.length > 0);
  return {
    extract: (parentContext: Context): Context => parentContext,
    fields: (): Array<string> => [...names],
    inject: (
      parentContext: Context,
      carrier: unknown,
      setter: TextMapSetter
    ): void => {
      const spanContext = trace.getSpanContext(parentContext);
      if (
        names.length === 0 ||
        !spanContext ||
        !isSpanContextValid(spanContext) ||
        (spanContext.traceFlags & TraceFlags.SAMPLED) === 0
      ) {
        return;
      }
      for (const name of names) {
        setter.set(carrier, name, spanContext.traceId);
      }
    },
  };
};

/**
 * 추가 전파기를 W3C traceparent·baggage 뒤에 붙여 전역 전파기로 등록한다.
 * 빈 목록이면 전역 전파기를 바꾸지 않는다.
 */
export const applyExtraPropagators = (
  extras: ReadonlyArray<TextMapPropagator>
): void => {
  if (extras.length === 0) {
    return;
  }
  propagation.disable();
  propagation.setGlobalPropagator(
    new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
        ...extras,
      ],
    })
  );
};

/**
 * 추가 전파기를 불러 전역 전파기로 등록한다.
 */
export const installExtraPropagators = async (
  load: () => Promise<ReadonlyArray<TextMapPropagator>>
): Promise<void> => {
  applyExtraPropagators(await load());
};
