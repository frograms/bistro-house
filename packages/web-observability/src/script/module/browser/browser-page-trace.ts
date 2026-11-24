const META_SELECTOR = 'meta[name="traceparent"]';

/**
 * 이 문서를 렌더링한 SSR 요청의 traceparent.
 * meta 가 없으면(루트 로더를 건너뛴 404·실패 응답 등) 문서 응답 Server-Timing 에서 읽는다.
 */
export function readPageTraceparent() {
  const meta = document.querySelector(META_SELECTOR)?.getAttribute("content");
  if (meta) {
    return meta;
  }
  const [navigation] = performance.getEntriesByType("navigation") as
    | PerformanceNavigationTiming[]
    | [];
  return navigation?.serverTiming?.find((entry) => entry.name === "traceparent")
    ?.description;
}

/**
 * HyperDX 문서 로드 계측은 meta 만 읽으므로 Server-Timing 에서 읽은 값을 meta 로 남긴다.
 * hydrate 전에 `<head>` 를 바꾸면 hydration 불일치가 나므로 SDK 시작 직전에만 호출한다.
 */
export function ensureTraceparentMeta(value: string | undefined) {
  if (!value || document.querySelector(META_SELECTOR)) {
    return;
  }
  const element = document.createElement("meta");
  element.name = "traceparent";
  element.content = value;
  document.head.append(element);
}
