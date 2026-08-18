export type FetchDevtoolsRule = {
  body?: string;
  delayMs?: number;
  id: string;
  /** 룰 바에 패턴 대신 표시할 이름 (프리셋이 만든 룰) */
  label?: string;
  patch?: { path: string; remove?: boolean; value?: unknown }[];
  pattern: string;
  status?: number;
};

export type FetchDevtoolsRuleInput = Omit<FetchDevtoolsRule, "id"> & {
  id?: string;
};

/** 앱이 정의해 패널에 넘기는 룰 묶음 — 목록에서 하나 고르면 적용 */
export type FetchDevtoolsPreset = {
  description?: string;
  id: string;
  name: string;
  rules: FetchDevtoolsRuleInput[];
};

export type FetchDevtoolsRecord = {
  durationMs: number;
  error?: string;
  method: string;
  mocked: boolean;
  ok: boolean;
  /** patch 룰이 적용된 응답 */
  patched?: boolean;
  /** clone 후 비동기로 채워지므로 채워지기 전엔 null */
  responseBody: string | null;
  ruleId?: string;
  seq: number;
  startedAt: number;
  status: number;
  url: string;
};

export type FetchDevtoolsStorage = {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
};

export type FetchDevtoolsSubscribe = (listener: () => void) => () => void;

export type FetchDevtoolsApi = {
  fetch: typeof fetch;
  hide(): void;
  launcher: {
    getSnapshot(): boolean;
    subscribe: FetchDevtoolsSubscribe;
  };
  presetNames: {
    getSnapshot(): Record<string, string>;
    reset(id: string): void;
    set(id: string, name: string): void;
    subscribe: FetchDevtoolsSubscribe;
  };
  records: {
    clear(): void;
    getSnapshot(): FetchDevtoolsRecord[];
    subscribe: FetchDevtoolsSubscribe;
  };
  rules: {
    add(input: FetchDevtoolsRuleInput): FetchDevtoolsRule;
    clear(): void;
    getSnapshot(): FetchDevtoolsRule[];
    remove(id: string): void;
    subscribe: FetchDevtoolsSubscribe;
    update(id: string, patch: Partial<Omit<FetchDevtoolsRule, "id">>): void;
  };
  show(): void;
  toggle(): void;
};

declare global {
  interface Window {
    __API_DEVTOOLS__?: FetchDevtoolsApi;
  }
}
