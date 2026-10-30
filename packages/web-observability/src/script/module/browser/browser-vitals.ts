import type { Metric } from "web-vitals";

import type { Attributes } from "../../type/observability-types.ts";
import type { TraceContext } from "../../util/traceparent-utils.ts";
import { OtlpLogSender } from "./browser-otlp-logs.ts";
import type { SessionFlags } from "./browser-session.ts";

/**
 * 경량 Web Vitals 리포터 — OTel semconv `browser.web_vital` 이벤트.
 * 시각은 페이지 시작(bfcache 복원 뒤엔 복원 시점)이라 같은 페이지의 지표가 문서 로드 스팬과 한 시점에 모이고,
 * 보고까지 걸린 시간은 `o11y.web_vital.reported_after_ms` 로 남긴다.
 */
export function startVitalsReporter(
  endpoint: string,
  resource: Attributes,
  flags: SessionFlags,
  pageTrace: TraceContext | undefined
) {
  const sender = new OtlpLogSender(endpoint, resource, "watcha.rum.web-vitals");
  const path = location.pathname;
  const timeOrigin = performance.timeOrigin || Date.now() - performance.now();
  let pageStart = Math.round(timeOrigin);
  // web-vitals 보다 먼저 등록돼 먼저 실행된다
  addEventListener("pageshow", (event) => {
    if (event.persisted) {
      pageStart = Math.round(timeOrigin + event.timeStamp);
    }
  });
  const push = (metric: Metric) => {
    const time = Date.now();
    const name = metric.name.toLowerCase();
    sender.push({
      attributes: {
        "browser.web_vital.delta": metric.delta,
        "browser.web_vital.id": metric.id,
        "browser.web_vital.name": name,
        "browser.web_vital.navigation_type": metric.navigationType,
        "browser.web_vital.rating": metric.rating,
        "browser.web_vital.value": metric.value,
        "o11y.session_id": flags.sid,
        "o11y.web_vital.reported_after_ms": time - pageStart,
        "rum.sdk": flags.tracing ? "full" : "lite",
        "url.path": path,
      },
      body: name,
      eventName: "browser.web_vital",
      observedTime: time,
      severityNumber: 9,
      severityText: "INFO",
      time: pageStart,
      trace: pageTrace,
    });
  };
  import("web-vitals")
    .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(push);
      onFCP(push);
      onINP(push);
      onLCP(push);
      onTTFB(push);
    })
    .catch(() => undefined);
}
