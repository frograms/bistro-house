/**
 * 앱 코드가 쓰는 통합 진입점(서버 구현). 브라우저 구현(`index.browser.ts`)과 같은 이름·시그니처를 내보낸다.
 * SSR 렌더링·loader 처럼 같은 코드가 서버에서 돌면 이 구현이 쓰인다.
 */
import type { InitOptions, Logger, ServerOptions } from "./options.ts";
import { getServerConfig, setServerConfig } from "./server/config.ts";
import { captureUncaughtErrors, writeServerLog } from "./server/log.ts";

/**
 * 관측을 시작한다(Sentry `init` 자리). 서버 시작 시 한 번 호출한다.
 * 설정을 보관하고(`/sentry` 연결이 이 설정을 쓴다) 처리 안 된 예외·거절 보고를 등록한다. 브라우저 전용 옵션은 무시한다.
 */
export function init(options: InitOptions) {
  if (getServerConfig()) {
    return;
  }
  const serverOptions = options as ServerOptions;
  setServerConfig(serverOptions);
  if (
    serverOptions.enabled !== false &&
    serverOptions.captureUncaughtErrors !== false
  ) {
    captureUncaughtErrors();
  }
}

const log =
  (level: keyof Logger) =>
  (messageOrError: unknown, context?: Record<string, unknown>) => {
    writeServerLog(level, messageOrError, context);
  };

/** 레벨별 로그. 문자열이면 메시지, 그 밖의 값(Error 등)이면 예외로 남긴다(JSON 한 줄, error 레벨은 활성 스팬에도 기록) */
export const logger: Logger = {
  debug: log("debug"),
  error: log("error"),
  info: log("info"),
  warn: log("warn"),
};

/** 탭 세션 ID — 서버에서는 없다 */
export function getSessionId(): string | undefined {
  return undefined;
}

export type {
  AttributeValue,
  BrowserOptions,
  Context,
  ErrorRecord,
  InitOptions,
  Logger,
  ServerOptions,
  SharedOptions,
} from "./options.ts";
