import type { HttpOverrideApi, HttpOverrideRecord } from "../core";

export const canRerunInPanel = (
  api: HttpOverrideApi,
  record: HttpOverrideRecord
): boolean => record.method === "GET" && api.canRevalidate(record.method);

export const rerun = (api: HttpOverrideApi, record: HttpOverrideRecord) => {
  if (canRerunInPanel(api, record)) api.revalidate(record.url, record.method);
};

export const editButtonLabel = (
  api: HttpOverrideApi,
  record: HttpOverrideRecord
): string =>
  canRerunInPanel(api, record) ? "바꾸고 재요청" : "이 값으로 바꾸기";
