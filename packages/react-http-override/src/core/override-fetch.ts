import type { RecordBuffer } from "./record-buffer";
import { ruleMatchesUrl } from "./rule-match";
import type { HttpOverrideRule } from "./types";

/** 저사양 기기 메모리 보호용 */
export const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

/** 스펙상 body를 가질 수 없는 status — body를 주면 Response 생성이 throw */
const NULL_BODY_STATUSES = new Set([204, 205, 304]);

const TEXTUAL_CONTENT_TYPE = /json|text|xml|javascript|urlencoded/i;

export type CreateOverrideFetchOptions = {
  baseFetch: typeof fetch;
  buffer: RecordBuffer;
  getRules(): HttpOverrideRule[];
  isServerRequest?: (url: string) => boolean;
  maxBodyBytes?: number;
  shouldRecord?: (url: string, method: string) => boolean;
};

export const isLoaderDataRequest = (url: string): boolean => {
  const pathname = url.split(/[?#]/)[0] ?? "";
  return pathname.endsWith(".data");
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const resolveUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
};

const resolveMethod = (
  input: RequestInfo | URL,
  init?: RequestInit
): string => {
  const method =
    init?.method ??
    (typeof input === "object" && "method" in input ? input.method : "GET");
  return method.toUpperCase();
};

const describeBinary = (label: string, bytes: number): string =>
  `[${label} ${bytes} bytes]`;

const serializeFormData = (form: FormData): string => {
  const entries: Record<string, unknown> = {};
  form.forEach((value, key) => {
    const summary =
      typeof value === "string"
        ? value
        : describeBinary(`file ${value.name || "unnamed"}`, value.size);
    const existing = entries[key];
    if (existing === undefined) {
      entries[key] = summary;
    } else if (Array.isArray(existing)) {
      existing.push(summary);
    } else {
      entries[key] = [existing, summary];
    }
  });
  return JSON.stringify(entries);
};

type RequestBodyCapture = {
  deferred: Promise<string | null> | null;
  initial: string | null;
};

const captureRequestBody = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  maxBodyBytes: number
): RequestBodyCapture => {
  const body = init?.body;
  if (body !== undefined && body !== null) {
    if (typeof body === "string") {
      return { deferred: null, initial: truncateBody(body, maxBodyBytes) };
    }
    if (body instanceof URLSearchParams) {
      return { deferred: null, initial: body.toString() };
    }
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      return {
        deferred: null,
        initial: truncateBody(serializeFormData(body), maxBodyBytes),
      };
    }
    if (typeof Blob !== "undefined" && body instanceof Blob) {
      return { deferred: null, initial: describeBinary("blob", body.size) };
    }
    if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
      return {
        deferred: null,
        initial: describeBinary("binary", body.byteLength),
      };
    }
    return { deferred: null, initial: "[stream]" };
  }
  if (typeof Request !== "undefined" && input instanceof Request) {
    const contentType = input.headers.get("content-type") ?? "";
    if (contentType !== "" && !TEXTUAL_CONTENT_TYPE.test(contentType)) {
      return { deferred: null, initial: describeBinary("binary", 0) };
    }
    try {
      const deferred = input
        .clone()
        .text()
        .then((text) => (text === "" ? null : truncateBody(text, maxBodyBytes)))
        .catch(() => null);
      return { deferred, initial: null };
    } catch {
      return { deferred: null, initial: null };
    }
  }
  return { deferred: null, initial: null };
};

const matchRules = (
  rules: HttpOverrideRule[],
  url: string
): HttpOverrideRule[] =>
  rules.filter((rule) => ruleMatchesUrl(rule.pattern, url));

const TRUNCATED_SUFFIX = "…(truncated)";

export const isTruncatedBody = (body: string): boolean =>
  body.endsWith(TRUNCATED_SUFFIX);

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const truncateBody = (text: string, maxBodyBytes: number): string => {
  if (text.length * 3 <= maxBodyBytes) return text;
  const bytes = encoder.encode(text);
  if (bytes.length <= maxBodyBytes) return text;
  const sliced = decoder
    .decode(bytes.subarray(0, maxBodyBytes))
    .replace(/�+$/, "");
  return `${sliced}${TRUNCATED_SUFFIX}`;
};

const createMockResponse = (
  rule: HttpOverrideRule
): { body: string | null; response: Response } | null => {
  const nullBody =
    rule.status !== undefined && NULL_BODY_STATUSES.has(rule.status);
  const filledBody =
    rule.body === undefined || rule.body === "" ? "{}" : rule.body;
  const body = nullBody ? null : filledBody;
  try {
    return {
      body,
      response: new Response(body, {
        headers: { "Content-Type": "application/json" },
        status: rule.status,
      }),
    };
  } catch {
    // status 범위 밖(<200, >599) 등 — 목 실패 시 실제 요청으로 통과
    return null;
  }
};

const applyAtPath = (
  root: unknown,
  patch: { path: string; remove?: boolean; value?: unknown }
): void => {
  const segments = patch.path.split(".");
  let current = root;
  for (const segment of segments.slice(0, -1)) {
    if (current === null || typeof current !== "object") return;
    current = (current as Record<string, unknown>)[segment];
  }
  const last = segments[segments.length - 1];
  if (current === null || typeof current !== "object" || last === undefined) {
    return;
  }

  if (!(last in (current as Record<string, unknown>))) return;
  if (patch.remove === true) {
    if (Array.isArray(current)) {
      const index = Number(last);
      if (Number.isInteger(index)) {
        current.splice(index, 1);
      }
      return;
    }
    delete (current as Record<string, unknown>)[last];
    return;
  }
  (current as Record<string, unknown>)[last] = patch.value;
};

const applyPatches = (
  text: string,
  patches: { path: string; remove?: boolean; value?: unknown }[]
): string => {
  try {
    const parsed: unknown = JSON.parse(text);
    for (const patch of patches) {
      applyAtPath(parsed, patch);
    }
    return JSON.stringify(parsed);
  } catch {
    // JSON 아니면 원문 유지
    return text;
  }
};

export const createOverrideFetch = (
  options: CreateOverrideFetchOptions
): typeof fetch => {
  const {
    baseFetch,
    buffer,
    getRules,
    isServerRequest = isLoaderDataRequest,
    maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
    shouldRecord,
  } = options;

  const captureBody = (response: Response, seq: number) => {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType !== "" && !TEXTUAL_CONTENT_TYPE.test(contentType)) return;
    try {
      void response
        .clone()
        .text()
        .then((text) => {
          buffer.patch(seq, { responseBody: truncateBody(text, maxBodyBytes) });
        })
        .catch(() => {
          // body 캡처 실패는 기록만 비워둔다
        });
    } catch {
      // clone 불가 — 기록만 비워둔다
    }
  };

  return async (input, init) => {
    const url = resolveUrl(input);
    const method = resolveMethod(input, init);
    if (shouldRecord !== undefined && !shouldRecord(url, method)) {
      return baseFetch(input, init);
    }
    const startedAt = Date.now();
    const requestBody = captureRequestBody(input, init, maxBodyBytes);
    const matched = matchRules(getRules(), url);
    const delayRule = matched.find(
      (rule) => rule.delayMs !== undefined && rule.delayMs > 0
    );
    const statusRule = matched.find((rule) => rule.status !== undefined);
    const patchRule = matched.find(
      (rule) => rule.status === undefined && rule.patch !== undefined
    );
    const patches =
      statusRule === undefined
        ? matched.flatMap((rule) =>
            rule.status === undefined ? (rule.patch ?? []) : []
          )
        : [];
    const primaryRule = statusRule ?? patchRule ?? matched[0];

    const { seq } = buffer.push({
      durationMs: null,
      method,
      mocked: false,
      ok: false,
      requestBody: requestBody.initial,
      responseBody: null,
      ruleId: primaryRule?.id,
      source: isServerRequest(url) ? "server" : "client",
      startedAt,
      state: "pending",
      status: null,
      url,
    });
    const settle = (patch: Parameters<RecordBuffer["patch"]>[1]) => {
      buffer.patch(seq, { durationMs: Date.now() - startedAt, ...patch });
    };
    if (requestBody.deferred !== null) {
      void requestBody.deferred.then((text) => {
        if (text !== null) buffer.patch(seq, { requestBody: text });
      });
    }

    if (delayRule?.delayMs !== undefined) {
      await sleep(delayRule.delayMs);
    }

    if (statusRule !== undefined) {
      const mock = createMockResponse(statusRule);
      if (mock !== null) {
        settle({
          mocked: true,
          ok: mock.response.ok,
          responseBody: truncateBody(mock.body ?? "", maxBodyBytes),
          state: "done",
          status: mock.response.status,
        });
        return mock.response;
      }
    }

    try {
      const response = await baseFetch(input, init);
      if (response.type === "opaque") {
        settle({ ok: false, opaque: true, state: "done", status: 0 });
        return response;
      }
      if (patches.length > 0) {
        const text = await response.text();
        const patchedText = applyPatches(text, patches);
        settle({
          ok: response.ok,
          patched: true,
          responseBody: truncateBody(patchedText, maxBodyBytes),
          state: "done",
          status: response.status,
        });

        const headers = new Headers(response.headers);
        headers.delete("content-length");
        headers.delete("content-encoding");
        return new Response(
          NULL_BODY_STATUSES.has(response.status) ? null : patchedText,
          {
            headers,
            status: response.status,
            statusText: response.statusText,
          }
        );
      }
      settle({ ok: response.ok, state: "done", status: response.status });
      captureBody(response, seq);
      return response;
    } catch (error) {
      settle({
        error: error instanceof Error ? error.message : String(error),
        state: "error",
        status: 0,
      });
      throw error;
    }
  };
};
