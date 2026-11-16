import type { User } from "../../type/observability-types.ts";

let current: User | undefined;
// 이미 시작한 tracing SDK 의 세션 사용자를 바꾸는 함수(tracing 세션에서만 등록된다)
let onChange: ((user: User | undefined) => void) | undefined;

/** 로그에 `user.id` 로 남길 현재 사용자 */
export function getBrowserUser() {
  return current;
}

export function setBrowserUser(user: User | undefined) {
  current = user;
  onChange?.(user);
}

export function onBrowserUserChange(
  listener: (user: User | undefined) => void
) {
  onChange = listener;
}
