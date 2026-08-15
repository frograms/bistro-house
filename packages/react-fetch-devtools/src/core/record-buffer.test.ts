import { describe, expect, it, vi } from "vitest";

import { createRecordBuffer } from "./record-buffer";
import type { FetchDevtoolsRecord } from "./types";

const input = (
  overrides: Partial<Omit<FetchDevtoolsRecord, "seq">> = {}
): Omit<FetchDevtoolsRecord, "seq"> => ({
  durationMs: 10,
  method: "GET",
  mocked: false,
  ok: true,
  responseBody: null,
  startedAt: 0,
  status: 200,
  url: "https://api.test/users",
  ...overrides,
});

describe("createRecordBuffer", () => {
  it("push는 증가하는 seq를 부여한다", () => {
    const buffer = createRecordBuffer();
    expect(buffer.push(input()).seq).toBe(1);
    expect(buffer.push(input()).seq).toBe(2);
  });

  it("maxRecords를 넘으면 오래된 기록부터 밀려난다", () => {
    const buffer = createRecordBuffer({ maxRecords: 2 });
    buffer.push(input({ url: "a" }));
    buffer.push(input({ url: "b" }));
    buffer.push(input({ url: "c" }));
    expect(buffer.getSnapshot().map((record) => record.url)).toEqual([
      "b",
      "c",
    ]);
  });

  it("maxRecords가 0이면 아무 기록도 남기지 않는다", () => {
    const buffer = createRecordBuffer({ maxRecords: 0 });
    buffer.push(input({ url: "a" }));
    buffer.push(input({ url: "b" }));
    expect(buffer.getSnapshot()).toEqual([]);
  });

  it("patch는 해당 seq 기록만 갱신하고, 밀려난 seq는 무시한다", () => {
    const buffer = createRecordBuffer({ maxRecords: 1 });
    const first = buffer.push(input({ url: "a" }));
    buffer.push(input({ url: "b" }));
    buffer.patch(first.seq, { responseBody: "late" });
    const second = buffer.getSnapshot()[0];
    expect(second?.responseBody).toBeNull();
    buffer.patch(second?.seq ?? 0, { responseBody: "body" });
    expect(buffer.getSnapshot()[0]?.responseBody).toBe("body");
  });

  it("변경 전까지 같은 스냅샷 참조를 반환한다", () => {
    const buffer = createRecordBuffer();
    buffer.push(input());
    expect(buffer.getSnapshot()).toBe(buffer.getSnapshot());
  });

  it("push와 clear 시 구독자에게 알린다", () => {
    const buffer = createRecordBuffer();
    const listener = vi.fn();
    buffer.subscribe(listener);
    buffer.push(input());
    buffer.clear();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(buffer.getSnapshot()).toEqual([]);
  });
});
