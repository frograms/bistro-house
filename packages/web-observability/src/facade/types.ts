import type { RumOptions } from "../shared/rum-options.ts";

export type AttributeValue = boolean | number | string | undefined;
export type Attributes = Record<string, AttributeValue>;

/** 서버 `init` 옵션 */
export type ServerInitOptions = {
  /** 프로세스의 처리 안 된 예외·거절 보고. 기본 true. 종료 동작은 바꾸지 않는다 */
  captureUncaughtErrors?: boolean;
};

/**
 * `init` 옵션. 브라우저는 `RumOptions`(수신 경로·서비스명 필수), 서버는 `ServerInitOptions`.
 * 실행 환경에 맞지 않는 옵션은 무시한다.
 */
export type InitOptions = RumOptions | ServerInitOptions;

export type Logger = Record<
  "debug" | "error" | "info" | "warn",
  (message: string, attributes?: Attributes) => void
>;
