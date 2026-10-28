import type { RumOptions } from "../shared/rum-options.ts";
import { startErrorReporter } from "./errors.ts";
import { scheduleFullSdk } from "./full-sdk.ts";
import { startLogger } from "./logger.ts";
import { pageTraceContext, readPageTraceparent } from "./page-trace.ts";
import { sessionFlags } from "./session.ts";
import { startVitalsReporter } from "./vitals.ts";

/**
 * 브라우저 관측을 시작한다. 오류를 놓치지 않도록 hydrate 전에(진입 모듈 최상단에서) 호출한다.
 * - 오류 리포터: 전체 세션(기본) — 전역 오류 + `captureException`
 * - Web Vitals: 경량 리포터(기본 전체 세션)
 * - HyperDX SDK: 일부 세션만 유휴 시 지연 로드(브라우저 트레이스·리플레이)
 */
export function startRum(options: RumOptions) {
  const flags = sessionFlags(options.sampleRates ?? {});
  const resource: Record<string, string> = {
    "service.name": options.service,
    ...(options.release && { "service.version": options.release }),
    ...(options.environment && {
      "deployment.environment.name": options.environment,
    }),
  };
  const base = `${location.origin}${options.path}`;
  const traceparent = readPageTraceparent();
  const pageTrace = pageTraceContext(traceparent);

  if (flags.errors) {
    startErrorReporter(
      `${base}/v1/logs`,
      resource,
      flags,
      pageTrace,
      options.errors ?? {}
    );
    startLogger(`${base}/v1/logs`, resource, flags, pageTrace);
  }
  if (flags.vitals) {
    startVitalsReporter(`${base}/v1/logs`, resource, flags, pageTrace);
  }
  if (flags.full) {
    scheduleFullSdk(
      {
        assetUrls: options.assetUrls,
        ignoreUrls: options.ignoreUrls,
        maskText: options.maskText ?? true,
        path: options.path,
        resource,
        traceparent,
        userId: options.userId,
      },
      flags
    );
  }
}

export type { RumEnv } from "../shared/rum-env.ts";
export type { RumOptions } from "../shared/rum-options.ts";
export { rumOptionsFromEnv } from "../shared/rum-options.ts";
export type { ErrorFilterOptions, ErrorRecord } from "./errors.ts";
export { captureException } from "./errors.ts";
export { logger } from "./logger.ts";
export type { SampleRates } from "./session.ts";
export { getRumSessionId } from "./session.ts";
