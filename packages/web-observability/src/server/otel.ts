import type { Context, TextMapSetter } from "@opentelemetry/api";
import { trace } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

import { parseSampleRate } from "../shared/sample-rate.ts";
import { isSampled } from "./trace.ts";

export type OtelEnv = {
  /** OTLP/HTTP traces 엔드포인트. 없으면 서버 트레이스를 끈다 */
  endpoint: string | undefined;
  serviceName: string | undefined;
  /** 0~1. 게이트웨이가 이미 샘플한 요청은 그 결정을 따른다 */
  tracesSampleRate: number;
};

/**
 * 서버 OTel 설정 env 를 읽는다.
 * `OTEL_TRACES_SAMPLE_RATE` 는 OTel 표준 변수가 아니다 — Sentry 가 샘플러를 쥐고 있는 동안만 쓰고,
 * Sentry 제거 뒤에는 표준 `OTEL_TRACES_SAMPLER`·`OTEL_TRACES_SAMPLER_ARG` 로 옮긴다.
 */
export function readOtelEnv(env: Record<string, string | undefined>): OtelEnv {
  return {
    endpoint: env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || undefined,
    serviceName: env.OTEL_SERVICE_NAME || undefined,
    tracesSampleRate: parseSampleRate(
      env.OTEL_TRACES_SAMPLE_RATE,
      0,
      "OTEL_TRACES_SAMPLE_RATE"
    ),
  };
}

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
