import { AsyncLocalStorage } from "node:async_hooks";
import { randomBytes } from "node:crypto";

import { trace } from "@opentelemetry/api";

import type { Attributes, User } from "../../type/observability-types.ts";
import { readSessionCookie, SESSION_COOKIE } from "../../util/session-utils.ts";
import { getServerConfig } from "./server-config.ts";
import { forwardRequestId } from "./server-request-id.ts";

/** 요청 하나 동안 로그에 붙일 값. `setUser` 가 바꾸므로 객체를 그대로 공유한다 */
export type RequestStore = {
  /** 들어온 요청의 `x-request-id`(Envoy 가 붙인 값). 나가는 내부 fetch 에 그대로 싣는다 */
  requestId?: string;
  sessionId: string;
  user: User | undefined;
};

// 통합 진입점(.)과 /server 가 서로 다른 번들 청크로 로드돼도 같은 저장소를 보도록 전역에 둔다
const STORAGE_KEY = Symbol.for(
  "@watcha-authentic/web-observability/request-context"
);

type StorageHolder = { [STORAGE_KEY]?: AsyncLocalStorage<RequestStore> };

function storage() {
  const holder = globalThis as StorageHolder;
  holder[STORAGE_KEY] ??= new AsyncLocalStorage<RequestStore>();
  return holder[STORAGE_KEY];
}

/** 지금 처리 중인 요청의 저장소. `sessionContext` 밖이면 undefined */
export function getRequestStore() {
  return storage().getStore();
}

/** 저장소 값을 로그 속성(`session.id`·`user.id`)으로 */
export function requestAttributes(store: RequestStore | undefined): Attributes {
  if (!store) {
    return {};
  }
  return {
    "session.id": store.sessionId,
    ...(store.user && { "user.id": store.user.id }),
  };
}

/** express 와 맞는 최소 타입(express 를 의존성으로 두지 않는다) */
type SessionRequest = { get(name: string): string | undefined };
type SessionResponse = {
  getHeader(name: string): unknown;
  setHeader(name: string, value: string[]): unknown;
};

function appendSetCookie(res: SessionResponse, cookie: string) {
  const existing = res.getHeader("Set-Cookie");
  const cookies = (Array.isArray(existing) ? existing : [existing]).filter(
    (value) => typeof value === "string"
  );
  res.setHeader("Set-Cookie", [...cookies, cookie]);
}

/**
 * 요청마다 세션 ID·사용자를 담는 컨텍스트를 연다(Sentry 의 요청 단위 scope 자리). `jsonAccessLog` 보다 먼저 연결한다.
 * - 세션 ID 는 `o11y_sid` 쿠키에서 읽고, 없으면 새로 만들어 응답에 쿠키로 내린다(브라우저가 같은 ID 를 이어 쓴다)
 * - 이 안에서 남긴 서버 로그에는 `session.id`·`user.id`(`setUser`)가 붙는다
 * - 요청의 서버 스팬(`instrumentIncomingHttp`)에도 `session.id` 를 붙여 서버 트레이스를 세션으로 찾게 한다
 * - 들어온 `x-request-id` 를 이 요청 안에서 나가는 내부 fetch 에 그대로 싣는다(`requestIdTargets`)
 */
export function sessionContext<
  Req extends SessionRequest,
  Res extends SessionResponse,
>(skip: (req: Req) => boolean = () => false) {
  forwardRequestId(getRequestStore);
  return (req: Req, res: Res, next: () => void) => {
    if (getServerConfig()?.enabled === false || skip(req)) {
      next();
      return;
    }
    let sessionId = readSessionCookie(req.get("cookie"));
    if (!sessionId) {
      sessionId = randomBytes(16).toString("hex");
      // 브라우저 스크립트가 읽어야 하므로 HttpOnly 를 붙이지 않는다(인증에 쓰지 않는 식별자)
      appendSetCookie(
        res,
        `${SESSION_COOKIE}=${sessionId}; Path=/; SameSite=Lax`
      );
    }
    trace.getActiveSpan()?.setAttribute("session.id", sessionId);
    const requestId = req.get("x-request-id");
    storage().run(
      { ...(requestId && { requestId }), sessionId, user: undefined },
      next
    );
  };
}
