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
  maxBodyBytes?: number;
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

const matchRules = (
  rules: HttpOverrideRule[],
  url: string
): HttpOverrideRule[] =>
  rules.filter((rule) => ruleMatchesUrl(rule.pattern, url));

const truncateBody = (text: string, maxBodyBytes: number): string =>
  text.length > maxBodyBytes
    ? `${text.slice(0, maxBodyBytes)}…(truncated)`
    : text;

const createMockResponse = (
  rule: HttpOverrideRule
): { body: string | null; response: Response } | null => {
  const body =
    rule.status !== undefined && NULL_BODY_STATUSES.has(rule.status)
      ? null
      : (rule.body ?? "");
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
    maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
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
    const startedAt = Date.now();
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

    if (delayRule?.delayMs !== undefined) {
      await sleep(delayRule.delayMs);
    }

    if (statusRule !== undefined) {
      const mock = createMockResponse(statusRule);
      if (mock !== null) {
        buffer.push({
          durationMs: Date.now() - startedAt,
          method,
          mocked: true,
          ok: mock.response.ok,
          responseBody: truncateBody(mock.body ?? "", maxBodyBytes),
          ruleId: statusRule.id,
          startedAt,
          status: mock.response.status,
          url,
        });
        return mock.response;
      }
    }

    try {
      const response = await baseFetch(input, init);
      if (patches.length > 0) {
        const text = await response.text();
        const patchedText = applyPatches(text, patches);
        buffer.push({
          durationMs: Date.now() - startedAt,
          method,
          mocked: false,
          ok: response.ok,
          patched: true,
          responseBody: truncateBody(patchedText, maxBodyBytes),
          ruleId: patchRule?.id,
          startedAt,
          status: response.status,
          url,
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
      const record = buffer.push({
        durationMs: Date.now() - startedAt,
        method,
        mocked: false,
        ok: response.ok,
        responseBody: null,
        ruleId: primaryRule?.id,
        startedAt,
        status: response.status,
        url,
      });
      captureBody(response, record.seq);
      return response;
    } catch (error) {
      buffer.push({
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
        method,
        mocked: false,
        ok: false,
        responseBody: null,
        ruleId: primaryRule?.id,
        startedAt,
        status: 0,
        url,
      });
      throw error;
    }
  };
};
