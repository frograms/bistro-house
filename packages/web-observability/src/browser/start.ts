import type { BrowserOptions } from "../options.ts";
import { resourceAttributes } from "../shared/attributes.ts";
import { parseTraceparent } from "../shared/traceparent.ts";
import { startLogs } from "./logs.ts";
import { readPageTraceparent } from "./page-trace.ts";
import { sessionFlags } from "./session.ts";
import { scheduleTracing } from "./tracing.ts";
import { startVitalsReporter } from "./vitals.ts";

let started = false;

/**
 * 브라우저 관측을 시작한다. 오류를 놓치지 않도록 hydrate 전에(진입 모듈 최상단에서) 호출한다.
 * - 로그·예외: `endpoint` 가 있으면 항상(예외는 `sampleRate` 탭 세션 표본)
 * - Web Vitals·tracing·리플레이: 각 표본 비율로
 */
export function startBrowser(options: BrowserOptions) {
  if (started || options.enabled === false) {
    return;
  }
  const { endpoint } = options;
  if (!endpoint) {
    if (options.debug) {
      console.warn(
        "[web-observability] endpoint 가 없어 아무것도 보내지 않습니다."
      );
    }
    return;
  }
  started = true;
  const flags = sessionFlags(options);
  const resource = resourceAttributes(options);
  const logsEndpoint = `${location.origin}${endpoint}/v1/logs`;
  const traceparent = readPageTraceparent();
  const pageTrace = parseTraceparent(traceparent);

  startLogs(logsEndpoint, resource, flags, pageTrace, options);
  if (flags.vitals) {
    startVitalsReporter(logsEndpoint, resource, flags, pageTrace);
  }
  if (flags.tracing) {
    scheduleTracing(options, { endpoint, flags, resource, traceparent });
  }
}
