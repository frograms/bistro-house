/**
 * 앱 코드가 쓰는 통합 진입점(브라우저 구현). 서버 구현(`facade-node.ts`)과 같은 이름·시그니처를 내보내고,
 * 번들러가 `browser`·`node` 조건으로 하나를 고른다.
 */
import type {
  InitOptions,
  Logger,
  User,
} from "../../type/observability-types.ts";
import { browserLogger } from "../browser/browser-logs.ts";
import { getSessionId as readSessionId } from "../browser/browser-session.ts";
import { startBrowser } from "../browser/browser-start.ts";
import { setBrowserUser } from "../browser/browser-user.ts";

/**
 * 관측을 시작한다(Sentry `init` 자리). 브라우저에서는 hydrate 전에 `{ browser: {...} }` 로 한 번 호출한다.
 * `endpoint` 가 없으면 아무것도 보내지 않는다.
 */
export function init(options: InitOptions) {
  if (!options.browser) {
    console.warn(
      "[web-observability] 브라우저에서 server 옵션으로 init 을 호출해 시작하지 않습니다. 브라우저는 init({ browser: {...} }) 로 호출합니다."
    );
    return;
  }
  startBrowser(options.browser);
}

/** 레벨별 로그. 문자열이면 메시지, 그 밖의 값(Error 등)이면 예외로 보낸다 */
export const logger: Logger = browserLogger;

/**
 * 로그에 `user.id` 로 남길 사용자(Sentry `setUser` 자리). 로그인·로그아웃 때 부른다. `null` 이면 지운다.
 * tracing 세션이면 HyperDX 세션 사용자도 바꾼다.
 */
export function setUser(user: User | null) {
  setBrowserUser(user ?? undefined);
}

/** 세션 ID(`session.id`). 서버가 내린 `o11y_sid` 쿠키가 있으면 그 값, 없으면 탭 세션 ID */
export function getSessionId(): string | undefined {
  return readSessionId();
}
