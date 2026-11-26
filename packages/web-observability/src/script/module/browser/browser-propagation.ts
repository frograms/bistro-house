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

const CLIENT_TRACE_ID_HEADER = "x-client-trace-id";

/**
 * 샘플된 요청에 `x-client-trace-id: <traceId>` 를 싣는다.
 * Istio 게이트웨이(Envoy)는 부모 traceparent 가 샘플이어도 자기 랜덤 비율로 다시 뽑는데,
 * 이 헤더가 있으면 클라이언트 요청으로 기록을 세우고 부모 결정을 따른다(Envoy `client_sampling`).
 * Istio 프록시가 부모를 따르는 sampler(`parent_based`)를 지원하면 지운다.
 */
class ClientTraceIdPropagator implements TextMapPropagator {
  extract(context: Context) {
    return context;
  }

  fields() {
    return [CLIENT_TRACE_ID_HEADER];
  }

  inject(context: Context, carrier: unknown, setter: TextMapSetter) {
    const spanContext = trace.getSpanContext(context);
    if (
      !spanContext ||
      !isSpanContextValid(spanContext) ||
      (spanContext.traceFlags & TraceFlags.SAMPLED) === 0
    ) {
      return;
    }
    setter.set(carrier, CLIENT_TRACE_ID_HEADER, spanContext.traceId);
  }
}

/** 전역 전파기를 W3C traceparent·baggage + `x-client-trace-id` 로 바꾼다. HyperDX 초기화 뒤에 부른다 */
export function installClientTracePropagator() {
  propagation.disable();
  propagation.setGlobalPropagator(
    new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
        new ClientTraceIdPropagator(),
      ],
    })
  );
}
