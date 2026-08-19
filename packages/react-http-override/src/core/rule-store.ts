import { createStore } from "./create-store";
import type {
  FetchDevtoolsRule,
  FetchDevtoolsRuleInput,
  FetchDevtoolsStorage,
} from "./types";

const STORAGE_KEY = "__API_DEVTOOLS_RULES__";

export type RuleStore = {
  add(input: FetchDevtoolsRuleInput): FetchDevtoolsRule;
  clear(): void;
  getSnapshot(): FetchDevtoolsRule[];
  remove(id: string): void;
  subscribe(listener: () => void): () => void;
  update(id: string, patch: Partial<Omit<FetchDevtoolsRule, "id">>): void;
};

/** sessionStorage에서 꺼낸 데이터는 100%는 신뢰할 수 없기 때문에 가드 추가 */
const isRule = (value: unknown): value is FetchDevtoolsRule =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as FetchDevtoolsRule).id === "string" &&
  typeof (value as FetchDevtoolsRule).pattern === "string";

const loadRules = (storage: FetchDevtoolsStorage): FetchDevtoolsRule[] => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRule);
  } catch {
    return [];
  }
};

let idSeq = 0;

const createRuleId = (): string =>
  `rule-${Date.now().toString(36)}-${(idSeq += 1).toString(36)}`;

export const createRuleStore = (storage: FetchDevtoolsStorage): RuleStore => {
  const store = createStore<FetchDevtoolsRule[]>(loadRules(storage));

  const setRules = (rules: FetchDevtoolsRule[]) => {
    store.setSnapshot(rules);
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(rules));
    } catch {
      // 실패해도 메모리 상태로 계속 동작
    }
  };

  return {
    add: (input) => {
      const rule: FetchDevtoolsRule = {
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
