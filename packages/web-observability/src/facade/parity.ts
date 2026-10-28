import type * as BrowserEntry from "../index.browser.ts";
import type * as NodeEntry from "../index.node.ts";

// 타입은 브라우저 구현의 선언 하나로 배포하므로 두 구현의 공개 API(값)가 같아야 한다 — 다르면 typecheck 가 실패한다
type Assert<T extends true> = T;
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

export type FacadeParity = Assert<Same<typeof BrowserEntry, typeof NodeEntry>>;
