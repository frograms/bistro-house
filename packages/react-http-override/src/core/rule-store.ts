import { createStore } from "./create-store";
import type {
  HttpOverrideRule,
  HttpOverrideRuleInput,
  HttpOverrideStorage,
} from "./types";

const STORAGE_KEY = "__HTTP_OVERRIDE_RULES__";

export type RuleStore = {
  add(input: HttpOverrideRuleInput): HttpOverrideRule;
  clear(): void;
  getSnapshot(): HttpOverrideRule[];
  remove(id: string): void;
  subscribe(listener: () => void): () => void;
  update(id: string, patch: Partial<Omit<HttpOverrideRule, "id">>): void;
};

/** sessionStorage에서 꺼낸 데이터는 100%는 신뢰할 수 없기 때문에 가드 추가 */
const isRule = (value: unknown): value is HttpOverrideRule =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as HttpOverrideRule).id === "string" &&
  typeof (value as HttpOverrideRule).pattern === "string";

/** 룰 모양이 바뀌면 올림 — 버전이 다른 저장분은 통째로 버림 */
const SCHEMA_VERSION = 1;

const loadRules = (storage: HttpOverrideStorage): HttpOverrideRule[] => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return [];
    const envelope = parsed as { rules?: unknown; v?: unknown };
    if (envelope.v !== SCHEMA_VERSION || !Array.isArray(envelope.rules)) {
      return [];
    }
    return envelope.rules.filter(isRule);
  } catch {
    return [];
  }
};

let idSeq = 0;

const createRuleId = (): string =>
  `rule-${Date.now().toString(36)}-${(idSeq += 1).toString(36)}`;

export const createRuleStore = (storage: HttpOverrideStorage): RuleStore => {
  const store = createStore<HttpOverrideRule[]>(loadRules(storage));

  const setRules = (rules: HttpOverrideRule[]) => {
    store.setSnapshot(rules);
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({ rules, v: SCHEMA_VERSION }));
    } catch {
      // 실패해도 메모리 상태로 계속 동작
    }
  };

  return {
    add: (input) => {
      const rule: HttpOverrideRule = {
        ...input,
        id: input.id ?? createRuleId(),
      };
      setRules([
        ...store.getSnapshot().filter((existing) => existing.id !== rule.id),
        rule,
      ]);
      return rule;
    },
    clear: () => {
      setRules([]);
    },
    getSnapshot: store.getSnapshot,
    remove: (id) => {
      setRules(store.getSnapshot().filter((rule) => rule.id !== id));
    },
    subscribe: store.subscribe,
    update: (id, patch) => {
      setRules(
        store
          .getSnapshot()
          .map((rule) => (rule.id === id ? { ...rule, ...patch, id } : rule))
      );
    },
  };
};
