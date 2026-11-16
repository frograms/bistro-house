/** 서버가 발급하고 브라우저가 이어 쓰는 세션 ID 쿠키(만료 없음 — 브라우저를 닫으면 사라진다) */
export const SESSION_COOKIE = "o11y_sid";

const SESSION_ID = /^[0-9a-f]{32}$/;

/** 우리가 만든 형식(16바이트 hex)인지 — 쿠키 값을 그대로 로그에 싣지 않도록 거른다 */
export function isSessionId(value: string | undefined): value is string {
  return value !== undefined && SESSION_ID.test(value);
}

/** `Cookie` 헤더(또는 `document.cookie`)에서 세션 ID 를 읽는다. 형식이 맞지 않으면 undefined */
export function readSessionCookie(cookieHeader: string | null | undefined) {
  const prefix = `${SESSION_COOKIE}=`;
  const value = (cookieHeader ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  return isSessionId(value) ? value : undefined;
}
