export type HttpOverrideRule = {
  body?: string;
  delayMs?: number;
  id: string;
  /** 룰 바에 패턴 대신 표시할 이름 (프리셋이 만든 룰) */
  label?: string;
  patch?: { path: string; remove?: boolean; value?: unknown }[];
  pattern: string;
  status?: number;
};

export type HttpOverrideRuleInput = Omit<HttpOverrideRule, "id"> & {
  id?: string;
};

/** 앱이 정의해 패널에 넘기는 룰 묶음 — 목록에서 하나 고르면 적용 */
export type HttpOverridePreset = {
  description?: string;
  id: string;
  name: string;
  rules: HttpOverrideRuleInput[];
};

export type HttpOverrideRecord = {
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

export type HttpOverrideStorage = {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
};

export type HttpOverrideSubscribe = (listener: () => void) => () => void;

export type HttpOverrideApi = {
  fetch: typeof fetch;
  hide(): void;
  launcher: {
    getSnapshot(): boolean;
    subscribe: HttpOverrideSubscribe;
  };
  presetNames: {
    getSnapshot(): Record<string, string>;
    reset(id: string): void;
    set(id: string, name: string): void;
    subscribe: HttpOverrideSubscribe;
  };
  records: {
    clear(): void;
    getSnapshot(): HttpOverrideRecord[];
    subscribe: HttpOverrideSubscribe;
  };
  rules: {
    add(input: HttpOverrideRuleInput): HttpOverrideRule;
    clear(): void;
    getSnapshot(): HttpOverrideRule[];
    remove(id: string): void;
    subscribe: HttpOverrideSubscribe;
    update(id: string, patch: Partial<Omit<HttpOverrideRule, "id">>): void;
  };
  show(): void;
  toggle(): void;
};

declare global {
  interface Window {
    __HTTP_OVERRIDE__?: HttpOverrideApi;
  }
}
