import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

/**
 * 들어오는 요청의 서버 스팬을 OTel 표준 HTTP 계측으로 만든다(나가는 요청은 계측하지 않는다).
 * 트레이서 등록(`Sentry.init` 또는 OTel SDK) 직후, 요청 핸들러를 만들기 전에 호출한다.
 */
export function instrumentIncomingHttp(
  isUntracedPath: (url: string) => boolean
) {
  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation({
        disableOutgoingRequestInstrumentation: true,
        ignoreIncomingRequestHook: (req) => isUntracedPath(req.url ?? ""),
      }),
    ],
  });
}
