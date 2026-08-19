import { createStore } from "./create-store";
import type { HttpOverrideRecord } from "./types";

export const DEFAULT_MAX_RECORDS = 200;

export type RecordBuffer = {
  clear(): void;
  getSnapshot(): HttpOverrideRecord[];
  patch(seq: number, patch: Partial<Omit<HttpOverrideRecord, "seq">>): void;
  push(input: Omit<HttpOverrideRecord, "seq">): HttpOverrideRecord;
  subscribe(listener: () => void): () => void;
};

export const createRecordBuffer = (
  options: { maxRecords?: number } = {}
): RecordBuffer => {
  const { maxRecords = DEFAULT_MAX_RECORDS } = options;
  const store = createStore<HttpOverrideRecord[]>([]);
  let seq = 0;

  return {
    clear: () => {
      store.setSnapshot([]);
    },
    getSnapshot: store.getSnapshot,
    patch: (targetSeq, patch) => {
      const current = store.getSnapshot();
      if (!current.some((record) => record.seq === targetSeq)) return;
      store.setSnapshot(
        current.map((record) =>
          record.seq === targetSeq
            ? { ...record, ...patch, seq: targetSeq }
            : record
        )
      );
    },
    push: (input) => {
      seq += 1;
      const record: HttpOverrideRecord = { ...input, seq };
      const next = [...store.getSnapshot(), record];
      store.setSnapshot(next.slice(Math.max(0, next.length - maxRecords)));
      return record;
    },
    subscribe: store.subscribe,
  };
};
