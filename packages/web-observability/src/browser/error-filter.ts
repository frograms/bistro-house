import type { BrowserOptions, ErrorRecord } from "../options.ts";
import { isIgnoredError, matchesPatterns } from "../shared/attributes.ts";

const FRAME_URL = /(https?:\/\/[^\s()]+?):\d+(?::\d+)?/;
const MAX_PER_PAGE = 50;

export type ErrorFilterOptions = Pick<
  BrowserOptions,
  "allowUrls" | "beforeSend" | "denyUrls" | "ignoreErrors"
>;

/** 스택에서 가장 먼저 나오는 프레임의 스크립트 URL */
function topFrameUrl(stack: string | undefined) {
  return stack ? FRAME_URL.exec(stack)?.[1] : undefined;
}

/** 브라우저 예외 필터 — Sentry 와 같은 의미의 필터 + 연속 중복 제거 + 페이지당 상한 */
export class ErrorFilter {
  private lastKey: string | undefined;
  private sent = 0;

  constructor(
    private readonly options: ErrorFilterOptions = {},
    private readonly maxPerPage = MAX_PER_PAGE
  ) {}

  apply(record: ErrorRecord): ErrorRecord | null {
    const { attributes } = record;
    const stack = attributes["exception.stacktrace"];
    const url = topFrameUrl(typeof stack === "string" ? stack : undefined);
    const { allowUrls, denyUrls, ignoreErrors } = this.options;

    if (isIgnoredError(attributes, ignoreErrors)) {
      return null;
    }
    if (url && matchesPatterns(denyUrls, url)) {
      return null;
    }
    if (url && allowUrls?.length && !matchesPatterns(allowUrls, url)) {
      return null;
    }

    const key = [
      attributes["exception.type"],
      attributes["exception.message"],
      typeof stack === "string" ? stack.split("\n", 3).join("|") : "",
    ].join("|");
    if (key === this.lastKey || this.sent >= this.maxPerPage) {
      return null;
    }

    const result = this.options.beforeSend
      ? this.options.beforeSend(record)
      : record;
    if (result) {
      this.lastKey = key;
      this.sent += 1;
    }
    return result;
  }
}
