export type AttributeValue = boolean | number | string | undefined;
export type Attributes = Record<string, AttributeValue>;

/** 로그에 붙이는 컨텍스트. 원시값은 그대로, 객체는 JSON 문자열로 펼쳐 싣는다 */
export type Context = Record<string, unknown>;

/** `beforeSend` 가 받는 예외 레코드 */
export type ErrorRecord = {
  attributes: Attributes;
  /** 원본 값(Error 가 아닐 수 있다) */
  error: unknown;
};

/** 브라우저·서버 공통 옵션(Sentry `init` 옵션 중 OTel 신호에 맞는 것만) */
export type SharedOptions = {
  /** 예외 레코드의 마지막 가공·필터. null 이면 버린다 */
  beforeSend?: (record: ErrorRecord) => ErrorRecord | null;
  /** 콘솔 진단(종착지 누락 경고, 브라우저는 보내는 레코드도 출력) */
  debug?: boolean;
  /** false 면 아무것도 보내지 않는다. 기본 true */
  enabled?: boolean;
  /** deployment.environment.name */
  environment?: string;
  /** `타입: 메시지` 또는 메시지가 맞으면 예외를 버린다(문자열은 부분 일치) */
  ignoreErrors?: (RegExp | string)[];
  /** service.version */
  release?: string;
  /** 오류 표본(0~1). 브라우저는 탭 세션 단위, 서버는 건 단위. 기본 1 */
  sampleRate?: number;
  /** service.name */
  service: string;
};

/** 브라우저 `init` 옵션 */
export type BrowserOptions = SharedOptions & {
  /** 맨 위 스택 프레임 URL 이 하나라도 맞아야 예외를 보낸다(스택에 URL 이 없으면 통과) */
  allowUrls?: (RegExp | string)[];
  /** 브라우저 tracing 문서 로드 계측에서 뺄 정적 자산 URL */
  assetUrls?: RegExp[];
  /** 맨 위 스택 프레임 URL 이 맞으면 예외를 버린다 */
  denyUrls?: (RegExp | string)[];
  /** 같은 출처 OTLP 수신 경로(예: `/otel`). 없으면 아무것도 보내지 않는다 */
  endpoint?: string;
  /** 브라우저 tracing fetch·XHR 스팬에서 뺄 URL(분석 도구·수신 경로는 기본 제외) */
  ignoreUrls?: RegExp[];
  /** 세션 리플레이 텍스트 마스킹. 기본 true(입력값은 항상 마스킹) */
  maskAllText?: boolean;
  /** 세션 리플레이 비율 — tracing 세션 중 비율(전체 기준 traces × replays). 기본 0.1 */
  replaysSessionSampleRate?: number;
  /** traceparent 를 실을 요청 URL(브라우저 → API trace 연결) */
  tracePropagationTargets?: (RegExp | string)[];
  /** 브라우저 tracing(문서 로드·fetch 스팬, HyperDX SDK 지연 로드) 탭 세션 비율. 기본 0.1 */
  tracesSampleRate?: number;
  /** 세션에 남길 사용자 */
  user?: { id: string };
  /** Web Vitals(LCP·INP·CLS·FCP·TTFB) 탭 세션 비율. 기본 1 */
  webVitalsSampleRate?: number;
};

/** 서버 `init` 옵션 */
export type ServerOptions = SharedOptions & {
  /** 프로세스의 처리 안 된 예외·거절 보고. 기본 true. 종료 동작은 바꾸지 않는다 */
  captureUncaughtErrors?: boolean;
  /** 서버 트레이스 OTLP/HTTP 엔드포인트(예: `http://collector:4318/v1/traces`). 없으면 서버 트레이스를 끈다 */
  tracesEndpoint?: string;
  /** 서버 트레이스 비율(0~1). 기본 0(끔). 상위에서 샘플된 요청은 그 결정을 따른다 */
  tracesSampleRate?: number;
};

/** `init` 옵션. 실행 환경에 맞지 않는 필드는 무시한다 */
export type InitOptions = BrowserOptions | ServerOptions;

/**
 * 레벨별 로그. 첫 인자가 문자열이면 메시지 로그, 아니면(Error 등) 예외 로그
 * (`exception.type`·`exception.message`·`exception.stacktrace`)가 된다.
 */
export type Logger = Record<
  "debug" | "error" | "info" | "warn",
  (messageOrError: unknown, context?: Context) => void
>;
