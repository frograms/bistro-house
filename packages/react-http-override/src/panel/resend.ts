import type { HttpOverrideApi, HttpOverrideRecord } from "../core";

export const isResendable = (
  api: HttpOverrideApi,
  record: HttpOverrideRecord
): boolean =>
  record.method === "GET"
    ? api.canRevalidate(record.method)
    : api.canReplay(record.seq);

export const resend = (api: HttpOverrideApi, record: HttpOverrideRecord) => {
  if (record.method === "GET") api.revalidate(record.url, record.method);
  else api.replay(record.seq);
};

export const resendLabel = (record: HttpOverrideRecord): string =>
  record.method === "GET" ? "재요청" : `${record.method} 다시 보내기`;

/** Data Explorer 편집 버튼 문구 — 다시 보낼 수 없으면 룰만 건다 */
export const editAndResendLabel = (
  api: HttpOverrideApi,
  record: HttpOverrideRecord
): string => {
  if (!isResendable(api, record)) return "이 값으로 바꾸기";
  return record.method === "GET" ? "바꾸고 재요청" : "바꾸고 다시 보내기";
};
