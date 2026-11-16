import type { InitOptions } from "./observability-types.ts";

// `init` 옵션에서 브라우저·서버 옵션이 섞이면 타입 오류가 나야 한다 — 오류가 나지 않으면 @ts-expect-error 때문에 typecheck 가 실패한다
export function initOptionsChecks(): InitOptions[] {
  return [
    { browser: { endpoint: "/otel", service: "app-browser" } },
    { server: { service: "app", tracesEndpoint: "http://collector" } },
    // @ts-expect-error 브라우저 묶음에 서버 옵션
    { browser: { service: "app-browser", tracesEndpoint: "http://collector" } },
    // @ts-expect-error 서버 묶음에 브라우저 옵션
    { server: { endpoint: "/otel", service: "app" } },
    // @ts-expect-error 두 묶음을 함께 넘김
    { browser: { service: "app-browser" }, server: { service: "app" } },
    // @ts-expect-error 묶지 않은 옵션(이전 형식)
    { service: "app" },
  ];
}
