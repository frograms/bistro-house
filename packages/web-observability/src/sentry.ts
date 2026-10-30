/**
 * Sentry 와 함께 쓰는 기간의 연결 코드(임시, 서버 전용).
 * Sentry(Node)는 OTel 트레이서를 직접 등록하므로, `O11y.init` 에 넘긴 서버 설정으로 그 트레이서의 스팬을 OTLP 로도 보낸다.
 * Sentry 를 걷어내면 이 진입점은 통째로 지우고 패키지가 OTel SDK 를 직접 구성한다.
 *
 * 순서: `O11y.init(serverOptions)` → `Sentry.init({ ...sentryOptions(dsn) })` → `installW3CPropagator()`
 */
import type { Context } from "@opentelemetry/api";
import { propagation } from "@opentelemetry/api";
import { CompositePropagator } from "@opentelemetry/core";
import type {
  ReadableSpan,
  Span,
  SpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { SentryPropagator } from "@sentry/opentelemetry";

import type { ServerOptions } from "./options.ts";
import { getServerConfig } from "./server/config.ts";
import {
  createOtlpSpanProcessor,
  SampledTraceContextPropagator,
} from "./server/otel.ts";
import { resourceAttributes } from "./shared/attributes.ts";

type SpanResource = ReadableSpan["resource"];
const serviceResources = new WeakMap<SpanResource, SpanResource>();
// Sentry 가 고정하는 리소스 키 — 앱 설정으로 바꿀 때 함께 뺀다
const SENTRY_RESOURCE_KEYS = new Set(["service.namespace", "service.version"]);

function overrideProperty<T extends object>(
  target: T,
  key: PropertyKey,
  value: unknown
): T {
  return new Proxy(target, {
    get: (t, k, receiver) => (k === key ? value : Reflect.get(t, k, receiver)),
  });
}

// Sentry 고정 리소스(service.name=node 등)를 `init` 의 service·release·environment 로 교체
function withResource(
  span: ReadableSpan,
  attributes: Record<string, string>
): ReadableSpan {
  let resource = serviceResources.get(span.resource);
  if (!resource) {
    const kept = Object.entries(span.resource.attributes).filter(
      ([key]) => !SENTRY_RESOURCE_KEYS.has(key)
    );
    resource = overrideProperty(span.resource, "attributes", {
      ...Object.fromEntries(kept),
      ...attributes,
    });
    serviceResources.set(span.resource, resource);
  }
  return overrideProperty(span, "resource", resource);
}

class ResourceSpanProcessor implements SpanProcessor {
  constructor(
    private readonly delegate: SpanProcessor,
    private readonly attributes: Record<string, string>
  ) {}

  forceFlush() {
    return this.delegate.forceFlush();
  }

  onEnd(span: ReadableSpan) {
    this.delegate.onEnd(withResource(span, this.attributes));
  }

  onStart(span: Span, parentContext: Context) {
    this.delegate.onStart(span, parentContext);
  }

  shutdown() {
    return this.delegate.shutdown();
  }
}

function requireConfig() {
  const config = getServerConfig();
  if (!config) {
    throw new Error(
      "[web-observability] O11y.init(serverOptions) 를 Sentry 연결보다 먼저 호출해야 합니다."
    );
  }
  return config;
}

function tracesEnabled(
  config: ServerOptions
): config is ServerOptions & { tracesEndpoint: string } {
  return (
    config.enabled !== false &&
    Boolean(config.tracesEndpoint) &&
    (config.tracesSampleRate ?? 0) > 0
  );
}

/**
 * `Sentry.init` 에 펼쳐 넣는 옵션.
 * - 서버 스팬은 `tracesEndpoint` 로만 보내고 Sentry 서버 트랜잭션은 버린다(오류 이벤트 수집은 그대로)
 * - DSN 이 없는 환경에서도 서버 트레이스가 돌도록 Sentry 는 켜되 전송만 버린다
 */
export function sentryOptions(dsn: string | undefined) {
  const config = requireConfig();
  if (!tracesEnabled(config)) {
    return { dsn };
  }
  return {
    ...(dsn
      ? { dsn }
      : {
          dsn: "https://otel@sentry.invalid/0",
          transport: () => ({
            flush: () => Promise.resolve(true),
            send: () => Promise.resolve({}),
          }),
        }),
    beforeSendTransaction: () => null,
    openTelemetrySpanProcessors: [
      new ResourceSpanProcessor(
        createOtlpSpanProcessor(config.tracesEndpoint),
        resourceAttributes(config)
      ),
    ],
    tracesSampleRate: config.tracesSampleRate,
  };
}

/**
 * `Sentry.init` 직후 호출 — W3C 를 뒤에 두어 traceparent 가 sentry-trace 보다 우선.
 * 앱과 Sentry 는 같은 `@opentelemetry/api` 인스턴스를 써야 한다. 버전이 다르면 OTel API 가 전역 등록을
 * 거부해 전파기가 아예 없어진다(들어오는 traceparent·sentry-trace 모두 끊긴다).
 */
export function installW3CPropagator() {
  if (!tracesEnabled(requireConfig())) {
    return;
  }
  propagation.disable();
  const registered = propagation.setGlobalPropagator(
    new CompositePropagator({
      propagators: [
        new SentryPropagator(),
        new SampledTraceContextPropagator(),
      ],
    })
  );
  if (!registered) {
    console.error(
      "[web-observability] 전파기 등록에 실패했습니다. 앱과 Sentry 가 서로 다른 @opentelemetry/api 버전을 쓰고 있을 수 있습니다(`pnpm why @opentelemetry/api` 로 한 벌인지 확인)."
    );
  }
}
