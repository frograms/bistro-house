import type { Attributes } from "./otlp-logs.ts";

type Pattern = RegExp | string;

/** Sentry `init` 의 같은 이름 옵션과 같은 의미 */
export type ErrorFilterOptions = {
  /** 맨 위 스택 프레임 URL 이 하나라도 맞아야 보낸다(스택에 URL 이 없으면 통과) */
  allowUrls?: Pattern[];
  /** 마지막 가공·필터. null 이면 버린다 */
  beforeSend?: (record: ErrorRecord) => ErrorRecord | null;
  /** 맨 위 스택 프레임 URL 이 맞으면 버린다 */
  denyUrls?: Pattern[];
  /** `타입: 메시지` 또는 메시지가 맞으면 버린다(문자열은 부분 일치) */
  ignoreErrors?: Pattern[];
  /** 페이지(문서) 하나에서 보낼 최대 건수. 기본 50 */
  maxPerPage?: number;
};

export type ErrorRecord = {
  attributes: Attributes;
  /** 원본 값(Error 가 아닐 수 있다) */
  error: unknown;
};

const MAX_STACK_LENGTH = 8000;
const MAX_CAUSE_DEPTH = 5;
const FRAME_URL = /(https?:\/\/[^\s()]+?):\d+(?::\d+)?/;

function matches(patterns: Pattern[] | undefined, value: string) {
  return (patterns ?? []).some((pattern) =>
    typeof pattern === "string" ? value.includes(pattern) : pattern.test(value)
  );
}

/** 스택에서 가장 먼저 나오는 프레임의 스크립트 URL */
export function topFrameUrl(stack: string | undefined) {
  return stack ? FRAME_URL.exec(stack)?.[1] : undefined;
}

function causeOf(error: unknown) {
  return error instanceof Error ? error.cause : undefined;
}

/** `error.cause` 연쇄를 `Caused by:` 로 이어 붙인 스택(Java·Node 관례) */
function stackWithCauses(error: Error) {
  let stack = error.stack ?? `${error.name}: ${error.message}`;
  let cause = causeOf(error);
  for (let depth = 0; cause !== undefined && depth < MAX_CAUSE_DEPTH; depth++) {
    stack += `\nCaused by: ${
      cause instanceof Error
        ? (cause.stack ?? `${cause.name}: ${cause.message}`)
        : String(cause)
    }`;
    cause = causeOf(cause);
  }
  return stack.length > MAX_STACK_LENGTH
    ? `${stack.slice(0, MAX_STACK_LENGTH)}\n…(truncated)`
    : stack;
}

/** 임의의 값을 OTel semconv `exception.*` 속성으로 */
export function exceptionAttributes(error: unknown): Attributes {
  if (error instanceof Error) {
    return {
      "exception.message": error.message,
      "exception.stacktrace": stackWithCauses(error),
      "exception.type": error.name,
    };
  }
  if (typeof error === "string") {
    return { "exception.message": error };
  }
  let message: string;
  try {
    message = JSON.stringify(error) ?? String(error);
  } catch {
    message = String(error);
  }
  return { "exception.message": message, "exception.type": typeof error };
}

/** 같은 오류가 연달아 오면 한 번만, 페이지당 상한까지만 보낸다 */
export class ErrorFilter {
  private lastKey: string | undefined;
  private sent = 0;

  constructor(private readonly options: ErrorFilterOptions = {}) {}

  apply(record: ErrorRecord): ErrorRecord | null {
    const { attributes } = record;
    const type = String(attributes["exception.type"] ?? "");
    const message = String(attributes["exception.message"] ?? "");
    const stack = attributes["exception.stacktrace"];
    const url = topFrameUrl(typeof stack === "string" ? stack : undefined);
    const { allowUrls, denyUrls, ignoreErrors } = this.options;

    if (
      matches(ignoreErrors, message) ||
      (type && matches(ignoreErrors, `${type}: ${message}`))
    ) {
      return null;
    }
    if (url && matches(denyUrls, url)) {
      return null;
    }
    if (url && allowUrls?.length && !matches(allowUrls, url)) {
      return null;
    }

    const key = `${type}|${message}|${typeof stack === "string" ? stack.split("\n", 3).join("|") : ""}`;
    if (key === this.lastKey) {
      return null;
    }
    if (this.sent >= (this.options.maxPerPage ?? 50)) {
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
