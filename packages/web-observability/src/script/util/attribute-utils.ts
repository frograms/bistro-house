import type {
  Attributes,
  Context,
  SharedOptions,
} from "../type/observability-types.ts";

const MAX_VALUE_LENGTH = 1000;
const MAX_STACK_LENGTH = 8000;
const MAX_CAUSE_DEPTH = 5;
const MAX_CONTEXT_DEPTH = 5;
const MAX_CONTEXT_KEYS = 100;

/** `init` 의 service·release·environment 를 OTel 리소스 속성으로 */
export function resourceAttributes(
  options: Pick<SharedOptions, "environment" | "release" | "service">
): Record<string, string> {
  return {
    "service.name": options.service,
    ...(options.release && { "service.version": options.release }),
    ...(options.environment && {
      "deployment.environment.name": options.environment,
    }),
  };
}

function serialize(value: unknown) {
  try {
    // undefined·함수는 JSON.stringify 가 undefined 를 돌려준다
    return (JSON.stringify(value) as string | undefined) ?? String(value);
  } catch {
    return "[unserializable]";
  }
}

function flattenInto(
  out: Attributes,
  key: string,
  value: unknown,
  depth: number
) {
  if (value === undefined || Object.keys(out).length >= MAX_CONTEXT_KEYS) {
    return;
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    out[key] = value;
    return;
  }
  if (typeof value !== "object" || value === null) {
    out[key] = String(value);
    return;
  }
  if (value instanceof Error) {
    out[key] = `${value.name}: ${value.message}`;
    return;
  }
  const { toJSON } = value as { toJSON?: unknown };
  if (typeof toJSON === "function") {
    // Date 등은 직렬화 값(Date 는 ISO 문자열)으로
    flattenInto(out, key, (toJSON as () => unknown).call(value), depth + 1);
    return;
  }
  if (depth >= MAX_CONTEXT_DEPTH) {
    // 순환 참조·지나치게 깊은 값의 마지막 수단
    out[key] = serialize(value).slice(0, MAX_VALUE_LENGTH);
    return;
  }
  for (const [childKey, child] of Object.entries(value)) {
    flattenInto(out, `${key}.${childKey}`, child, depth + 1);
  }
}

/**
 * 컨텍스트를 OTel 속성으로 — 원시값은 그대로, 객체·배열은 점 표기 키로 펼친다
 * (`{ order: { id: 1 } }` → `order.id`. JSON 문자열로 넣지 않아 필드로 조회할 수 있다).
 * 깊이 5단계·키 100개까지만 싣는다.
 */
export function contextAttributes(context: Context = {}): Attributes {
  const out: Attributes = {};
  for (const [key, value] of Object.entries(context)) {
    flattenInto(out, key, value, 0);
  }
  return out;
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
  return {
    "exception.message": serialize(error).slice(0, MAX_VALUE_LENGTH),
    "exception.type": typeof error,
  };
}

function matches(patterns: (RegExp | string)[] | undefined, value: string) {
  return (patterns ?? []).some((pattern) =>
    typeof pattern === "string" ? value.includes(pattern) : pattern.test(value)
  );
}

/** `ignoreErrors` — 메시지 또는 `타입: 메시지` 가 맞으면 true */
export function isIgnoredError(
  attributes: Attributes,
  ignoreErrors: (RegExp | string)[] | undefined
) {
  const type = String(attributes["exception.type"] ?? "");
  const message = String(attributes["exception.message"] ?? "");
  return (
    matches(ignoreErrors, message) ||
    (type !== "" && matches(ignoreErrors, `${type}: ${message}`))
  );
}

export { matches as matchesPatterns };
