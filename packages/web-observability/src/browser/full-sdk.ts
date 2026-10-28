import { ensureTraceparentMeta } from "./page-trace.ts";
import type { SessionFlags } from "./session.ts";

const ASSET_URL = /\.(png|jpe?g|webp|gif|svg|ico|woff2?|css)(\?|$)/;
// 분석 도구 전송은 fetch 스팬에서 뺀다
const ANALYTICS_URL =
  /^https:\/\/([a-z0-9-]+\.)*(google-analytics\.com|googletagmanager\.com|clarity\.ms)\//;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type FullSdkOptions = {
  /** 문서 로드 계측에서 뺄 정적 자산 URL(기본 패턴에 더한다) */
  assetUrls?: RegExp[];
  /** fetch·XHR 스팬에서 뺄 URL(분석 도구·RUM 수신 경로에 더한다) */
  ignoreUrls?: RegExp[];
  maskText: boolean;
  path: string;
  resource: Record<string, string>;
  traceparent?: string;
  userId?: string;
};

/** 일부 세션만 `@hyperdx/browser` 를 지연 로드한다(유휴 시, 최대 5초 뒤) */
export function scheduleFullSdk(options: FullSdkOptions, flags: SessionFlags) {
  const start = () => {
    startFullSdk(options, flags).catch(() => undefined);
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(start, { timeout: 5000 });
  } else {
    setTimeout(start, 2000);
  }
}

async function startFullSdk(options: FullSdkOptions, flags: SessionFlags) {
  const { default: HyperDX } = await import("@hyperdx/browser");
  const { path, resource } = options;
  ensureTraceparentMeta(options.traceparent);
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
      new RegExp(`${escapeRegExp(path)}/`),
      ANALYTICS_URL,
      ...(options.ignoreUrls ?? []),
    ],
    instrumentations: {
      document: documentLoad,
      // 오류는 전체 세션 대상 오류 리포터가 보낸다(중복 방지)
      errors: false,
      postload: false,
      // Web Vitals 는 경량 리포터가 보낸다(중복 방지)
      webvitals: false,
    },
    maskAllInputs: true,
    maskAllText: options.maskText,
    otelResourceAttributes: resource,
    service: resource["service.name"] ?? "",
    url: `${location.origin}${path}`,
  });
  HyperDX.setGlobalAttributes({
    "o11y.session_id": flags.sid,
    "rum.sdk": "full",
    ...(options.userId ? { userId: options.userId } : {}),
  });
}
