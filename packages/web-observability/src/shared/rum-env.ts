/** 서버가 브라우저로 넘기는 RUM 설정 env. 값은 모두 문자열(배포 설정의 환경 변수) */
export type RumEnv = {
  RUM_ENABLED?: string;
  RUM_ERRORS_SAMPLE_RATE?: string;
  RUM_FULL_SAMPLE_RATE?: string;
  RUM_MASK_TEXT?: string;
  RUM_PATH?: string;
  RUM_REPLAY_SAMPLE_RATE?: string;
  RUM_SERVICE?: string;
  RUM_VITALS_SAMPLE_RATE?: string;
};

/**
 * 서버 env 에서 브라우저로 넘길 RUM 값만 고른다(SSR 에서 `window` 전역으로 주입).
 * 브라우저 서비스명은 `OTEL_SERVICE_NAME` 에 `-browser` 를 붙인다.
 */
export function pickRumEnv(env: Record<string, string | undefined>): RumEnv {
  return {
    RUM_ENABLED: env.RUM_ENABLED,
    RUM_ERRORS_SAMPLE_RATE: env.RUM_ERRORS_SAMPLE_RATE,
    RUM_FULL_SAMPLE_RATE: env.RUM_FULL_SAMPLE_RATE,
    RUM_MASK_TEXT: env.RUM_MASK_TEXT,
    RUM_PATH: env.RUM_PATH,
    RUM_REPLAY_SAMPLE_RATE: env.RUM_REPLAY_SAMPLE_RATE,
    RUM_SERVICE: env.OTEL_SERVICE_NAME && `${env.OTEL_SERVICE_NAME}-browser`,
    RUM_VITALS_SAMPLE_RATE: env.RUM_VITALS_SAMPLE_RATE,
  };
}
