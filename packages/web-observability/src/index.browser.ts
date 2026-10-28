/**
 * 앱 코드가 쓰는 통합 진입점(브라우저 구현). 서버 구현(`index.node.ts`)과 같은 이름·시그니처를 내보내고,
 * 번들러가 `browser`·`node` 조건으로 하나를 고른다.
 */
import { browserLogger } from "./browser/logs.ts";
import { getSessionId as readSessionId } from "./browser/session.ts";
import { startBrowser } from "./browser/start.ts";
import type { InitOptions, Logger } from "./options.ts";

/**
 * 관측을 시작한다(Sentry `init` 자리). 브라우저에서는 hydrate 전에 한 번 호출한다.
 * `endpoint` 가 없으면 아무것도 보내지 않는다. 서버 전용 옵션은 무시한다.
 */
export function init(options: InitOptions) {
  startBrowser(options);
}

/** 레벨별 로그. 문자열이면 메시지, 그 밖의 값(Error 등)이면 예외로 보낸다 */
export const logger: Logger = browserLogger;

/** 탭 세션 ID(`o11y.session_id`). 서버에서는 undefined */
export function getSessionId(): string | undefined {
  return readSessionId();
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
