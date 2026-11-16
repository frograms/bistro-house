/**
 * 앱 코드가 쓰는 통합 진입점(서버 구현). 브라우저 구현(`facade-browser.ts`)과 같은 이름·시그니처를 내보낸다.
 * SSR 렌더링·loader 처럼 같은 코드가 서버에서 돌면 이 구현이 쓰인다.
 */
import type {
  InitOptions,
  Logger,
  User,
} from "../../type/observability-types.ts";
import { getServerConfig, setServerConfig } from "../server/server-config.ts";
import { getRequestStore } from "../server/server-context.ts";
import { captureUncaughtErrors, writeServerLog } from "../server/server-log.ts";

/**
 * 관측을 시작한다(Sentry `init` 자리). 서버 시작 시 `{ server: {...} }` 로 한 번 호출한다.
 * 설정을 보관하고(`/sentry` 연결이 이 설정을 쓴다) 처리 안 된 예외·거절 보고를 등록한다.
 */
export function init(options: InitOptions) {
  const serverOptions = options.server;
  if (!serverOptions) {
    console.warn(
      "[web-observability] 서버에서 browser 옵션으로 init 을 호출해 시작하지 않습니다. 서버는 init({ server: {...} }) 로 호출합니다."
    );
    return;
  }
  if (getServerConfig()) {
    return;
  }
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

/**
 * 지금 처리 중인 요청의 사용자(Sentry `setUser` 자리). 이후 이 요청에서 남기는 로그에 `user.id` 가 붙는다.
 * `null` 이면 지운다. `sessionContext` 밖(요청 밖)에서 부르면 아무것도 하지 않는다.
 */
export function setUser(user: User | null) {
  const store = getRequestStore();
  if (!store) {
    if (getServerConfig()?.debug) {
      console.warn(
        "[web-observability] 요청 컨텍스트 밖에서 setUser 를 호출했습니다. sessionContext 미들웨어를 연결했는지 확인합니다."
      );
    }
    return;
  }
  store.user = user ?? undefined;
}

/** 세션 ID(`session.id`). 서버에서는 지금 처리 중인 요청의 값이고, `sessionContext` 밖이면 undefined */
export function getSessionId(): string | undefined {
  return getRequestStore()?.sessionId;
}
