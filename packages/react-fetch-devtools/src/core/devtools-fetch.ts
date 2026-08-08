import type { RecordBuffer } from "./record-buffer";
import type { FetchDevtoolsRule } from "./types";

/** 저사양 기기 메모리 보호용 */
export const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

/** 스펙상 body를 가질 수 없는 status — body를 주면 Response 생성이 throw */
const NULL_BODY_STATUSES = new Set([204, 205, 304]);

export type CreateDevtoolsFetchOptions = {
  baseFetch: typeof fetch;
  buffer: RecordBuffer;
  getRules(): FetchDevtoolsRule[];
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

const matchRule = (
  rules: FetchDevtoolsRule[],
  url: string
): FetchDevtoolsRule | undefined =>
  rules.find((rule) => {
    try {
      return new RegExp(rule.pattern).test(url);
    } catch {
      return false;
    }
  });

const createMockResponse = (rule: FetchDevtoolsRule): Response | null => {
  const body =
    rule.status !== undefined && NULL_BODY_STATUSES.has(rule.status)
      ? null
      : (rule.body ?? "");
  try {
    return new Response(body, {
      headers: { "Content-Type": "application/json" },
      status: rule.status,
    });
  } catch {
    // status 범위 밖(<200, >599) 등 — 목 실패 시 실제 요청으로 통과
    return null;
  }
};

export const createDevtoolsFetch = (
  options: CreateDevtoolsFetchOptions
): typeof fetch => {
  const {
    baseFetch,
    buffer,
    getRules,
    maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
  } = options;

  const captureBody = (response: Response, seq: number) => {
    try {
      void response
        .clone()
        .text()
        .then((text) => {
          buffer.patch(seq, {
            responseBody:
              text.length > maxBodyBytes
                ? `${text.slice(0, maxBodyBytes)}…(truncated)`
                : text,
          });
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
    const rule = matchRule(getRules(), url);

    if (rule?.delayMs !== undefined && rule.delayMs > 0) {
      await sleep(rule.delayMs);
    }

    if (rule?.status !== undefined) {
      const mock = createMockResponse(rule);
      if (mock !== null) {
        buffer.push({
          durationMs: Date.now() - startedAt,
          method,
          mocked: true,
          ok: mock.ok,
          responseBody: rule.body ?? "",
          ruleId: rule.id,
          startedAt,
          status: mock.status,
          url,
        });
        return mock;
      }
    }

    try {
      const response = await baseFetch(input, init);
      const record = buffer.push({
        durationMs: Date.now() - startedAt,
        method,
        mocked: false,
        ok: response.ok,
        responseBody: null,
        ruleId: rule?.id,
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
        ruleId: rule?.id,
        startedAt,
        status: 0,
        url,
      });
      throw error;
    }
  };
};
