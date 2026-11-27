import type { TextMapPropagator } from "@opentelemetry/api";
import { propagation } from "@opentelemetry/api";
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from "@opentelemetry/core";

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
