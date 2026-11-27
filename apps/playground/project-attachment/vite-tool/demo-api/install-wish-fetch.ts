const DEMO_API_DELAY_MS = 200;
const WISH_FETCH_FLAG = "__playgroundDemoWishFetch";

type WishFetchWindow = Window & {
  [WISH_FETCH_FLAG]?: boolean;
};

/**
 * 정규식 패턴에 넣을 문자열의 특수문자를 이스케이프한다.
 */
const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * 찜 POST, DELETE를 JSON 응답으로 끝내도록 fetch를 바꾼다.
 * 이미 바뀌어 있으면 다시 감지 않는다.
 * 그 외 요청은 원래 fetch로 넘긴다.
 */
const installDemoWishFetch = (): void => {
  const demoWindow = window as WishFetchWindow;
  if (demoWindow[WISH_FETCH_FLAG] === true) return;
  demoWindow[WISH_FETCH_FLAG] = true;

  const basePrefix = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const wishPath = new RegExp(
    `^(?:${escapeRegExp(basePrefix)})?/api/contents/([^/]+)/wishes$`
  );
  const wished = new Set<string>();
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    let rawUrl: string;
    if (typeof input === "string") {
      rawUrl = input;
    } else if (input instanceof URL) {
      rawUrl = input.href;
    } else {
      rawUrl = input.url;
    }
    let pathname = rawUrl.split("?")[0] ?? rawUrl;
    try {
      pathname = new URL(rawUrl, window.location.origin).pathname;
    } catch {
      // 절대 주소로 해석되지 않으면 경로 문자열을 그대로 쓴다
    }
    const method = (
      init?.method ??
      (typeof input === "object" && "method" in input ? input.method : "GET")
    ).toUpperCase();
    const wishMatch = wishPath.exec(pathname);
    const code = wishMatch === null ? undefined : wishMatch[1];
    if (code !== undefined && (method === "POST" || method === "DELETE")) {
      if (method === "POST") {
        wished.add(code);
      } else {
        wished.delete(code);
      }
      const body = JSON.stringify({ result: { wished: wished.has(code) } });
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            new Response(body, {
              headers: { "Content-Type": "application/json" },
              status: 200,
            })
          );
        }, DEMO_API_DELAY_MS);
      });
    }
    return nativeFetch(input, init);
  };
};

installDemoWishFetch();
