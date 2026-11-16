import type { Context, TextMapSetter } from "@opentelemetry/api";
import { trace } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

import { isSampled } from "./server-span.ts";

/** OTLP/HTTP 로 서버 스팬을 묶어 보내는 처리기 */
export function createOtlpSpanProcessor(endpoint: string) {
  return new BatchSpanProcessor(new OTLPTraceExporter({ url: endpoint }));
}

/** 샘플된 요청에만 traceparent 를 싣는다 — 미샘플 요청은 하위 서비스가 스스로 판단 */
export class SampledTraceContextPropagator extends W3CTraceContextPropagator {
  override inject(context: Context, carrier: unknown, setter: TextMapSetter) {
    if (isSampled(trace.getSpanContext(context))) {
      super.inject(context, carrier, setter);
    }
  }
}
