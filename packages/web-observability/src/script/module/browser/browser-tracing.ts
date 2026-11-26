import type { BrowserOptions, User } from "../../type/observability-types.ts";
import { ensureTraceparentMeta } from "./browser-page-trace.ts";
import type { SessionFlags } from "./browser-session.ts";
import { getBrowserUser, onBrowserUserChange } from "./browser-user.ts";

const ASSET_URL = /\.(png|jpe?g|webp|gif|svg|ico|woff2?|css)(\?|$)/;
// 분석 도구 전송은 fetch 스팬에서 뺀다
const ANALYTICS_URL =
  /^https:\/\/([a-z0-9-]+\.)*(google-analytics\.com|googletagmanager\.com|clarity\.ms)\//;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type TracingContext = {
  endpoint: string;
  flags: SessionFlags;
  resource: Record<string, string>;
  traceparent: string | undefined;
};

/**
 * 브라우저 tracing — tracing 세션만 `@hyperdx/browser` 를 유휴 시(최대 5초 뒤) 지연 로드한다.
 * 문서 로드·fetch 스팬과 세션 리플레이를 맡는다. 오류·Web Vitals 는 이 패키지의 경량 경로가 보내므로 SDK 쪽은 끈다.
 */
export function scheduleTracing(
  options: BrowserOptions,
  context: TracingContext
) {
  const start = () => {
    startTracing(options, context).catch(() => undefined);
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(start, { timeout: 5000 });
  } else {
    setTimeout(start, 2000);
  }
}

async function startTracing(
  options: BrowserOptions,
  { endpoint, flags, resource, traceparent }: TracingContext
) {
  const { default: HyperDX } = await import("@hyperdx/browser");
  ensureTraceparentMeta(traceparent);
  // SDK 타입에는 없지만 문서 로드 계측이 런타임에 읽는 옵션(ignoreUrls)
  const documentLoad = {
    enabled: true,
    ignoreUrls: [ASSET_URL, ...(options.assetUrls ?? [])],
  };
  HyperDX.init({
    advancedNetworkCapture: false,
    apiKey: "",
    disableReplay: !flags.replay,
    ignoreUrls: [
      new RegExp(`${escapeRegExp(endpoint)}/`),
      ANALYTICS_URL,
      ...(options.ignoreUrls ?? []),
    ],
    instrumentations: {
      document: documentLoad,
      errors: false,
      postload: false,
      webvitals: false,
    },
    maskAllInputs: true,
    maskAllText: options.maskAllText ?? true,
    otelResourceAttributes: resource,
    service: options.service,
    ...(options.tracePropagationTargets && {
      tracePropagationTargets: options.tracePropagationTargets,
    }),
    url: `${location.origin}${endpoint}`,
  });
  // HyperDX 가 등록한 W3C 전파기를 x-client-trace-id 를 더한 전파기로 바꾼다(fetch·XHR 계측은 전역 전파기를 쓴다).
  // HyperDX 와 같은 지연 청크로 받아 첫 로드 번들에 OTel 전파기 코드를 넣지 않는다
  const { installClientTracePropagator } =
    await import("./browser-propagation.ts");
  installClientTracePropagator();
  const applyAttributes = (user: User | undefined) => {
    // setGlobalAttributes 는 기존 값에 합치기만 하므로(인자가 없으면 전부 지움) 지운 뒤 다시 싣는다 — userId 를 뺄 수 있도록
    HyperDX.setGlobalAttributes(undefined as unknown as Record<string, string>);
    HyperDX.setGlobalAttributes({
      "rum.sdk": "full",
      "session.id": flags.sid,
      ...(user && { userId: user.id }),
    });
  };
  applyAttributes(getBrowserUser());
  onBrowserUserChange(applyAttributes);
}
