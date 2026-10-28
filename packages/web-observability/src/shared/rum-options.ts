import type { ErrorFilterOptions } from "../browser/error-filter.ts";
import type { SampleRates } from "../browser/session.ts";
import type { RumEnv } from "./rum-env.ts";
import { parseSampleRate } from "./sample-rate.ts";

export type RumOptions = {
  /** 문서 로드 계측에서 뺄 정적 자산 URL(예: CDN) */
  assetUrls?: RegExp[];
  /** deployment.environment.name */
  environment?: string;
  /** 오류 리포터 필터(Sentry `init` 옵션과 같은 의미) */
  errors?: ErrorFilterOptions;
  /** HyperDX fetch·XHR 스팬에서 뺄 URL */
  ignoreUrls?: RegExp[];
  /** 텍스트 마스킹(리플레이). 기본 true */
  maskText?: boolean;
  /** 같은 출처 OTLP 수신 경로(예: `/_/rum`) */
  path: string;
  /** service.version */
  release?: string;
  sampleRates?: SampleRates;
  /** service.name(예: `my-app-browser`) */
  service: string;
  /** HyperDX 세션에 남길 사용자 코드 */
  userId?: string;
};

/** `RumEnv` 를 `RumOptions` 로. RUM_ENABLED 가 "true" 이고 경로·서비스명이 있을 때만 값을 돌려준다 */
export function rumOptionsFromEnv(env: RumEnv): RumOptions | undefined {
  const { RUM_ENABLED, RUM_PATH: path, RUM_SERVICE: service } = env;
  if (RUM_ENABLED !== "true" || !path || !service) {
    return undefined;
  }
  return {
    maskText: env.RUM_MASK_TEXT !== "false",
    path,
    sampleRates: {
      errors: parseSampleRate(
        env.RUM_ERRORS_SAMPLE_RATE,
        1,
        "RUM_ERRORS_SAMPLE_RATE"
      ),
      full: parseSampleRate(
        env.RUM_FULL_SAMPLE_RATE,
        0.1,
        "RUM_FULL_SAMPLE_RATE"
      ),
      replay: parseSampleRate(
        env.RUM_REPLAY_SAMPLE_RATE,
        0.1,
        "RUM_REPLAY_SAMPLE_RATE"
      ),
      vitals: parseSampleRate(
        env.RUM_VITALS_SAMPLE_RATE,
        1,
        "RUM_VITALS_SAMPLE_RATE"
      ),
    },
    service,
  };
}
