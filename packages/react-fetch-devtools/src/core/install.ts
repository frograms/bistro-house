import { createDevtoolsFetch } from "./devtools-fetch";
import { createLauncherVisibility } from "./launcher-visibility";
import { createPresetNameStore } from "./preset-names";
import { createRecordBuffer } from "./record-buffer";
import { createRuleStore } from "./rule-store";
import { createSafeStorage } from "./safe-storage";
import type { FetchDevtoolsApi, FetchDevtoolsStorage } from "./types";

export type InstallFetchDevtoolsOptions = {
  baseFetch?: typeof fetch;
  enabled: boolean;
  maxBodyBytes?: number;
  maxRecords?: number;
  storage?: FetchDevtoolsStorage;
};

/** enabled=false 또는 SSR이면 no-op. 중복 호출 시 기존 설치 반환 */
export const installFetchDevtools = (
  options: InstallFetchDevtoolsOptions
): FetchDevtoolsApi | null => {
  const { baseFetch, enabled, maxBodyBytes, maxRecords, storage } = options;

  if (!enabled) return null;
  if (typeof window === "undefined") return null;
  if (window.__API_DEVTOOLS__ !== undefined) return window.__API_DEVTOOLS__;

  const sessionStore =
    storage ?? createSafeStorage(() => window.sessionStorage);
  const ruleStore = createRuleStore(sessionStore);
  const presetNames = createPresetNameStore(sessionStore);
  const buffer = createRecordBuffer({ maxRecords });
  const launcher = createLauncherVisibility(
    createSafeStorage(() => window.localStorage)
  );
  // 설치 시점에 고정하지 않고 호출 시점에 조회 — 이후 패치된 fetch 위에서도 동작
  const defaultBaseFetch: typeof fetch = (input, init) =>
    window.fetch(input, init);

  const api: FetchDevtoolsApi = {
    fetch: createDevtoolsFetch({
      baseFetch: baseFetch ?? defaultBaseFetch,
      buffer,
      getRules: ruleStore.getSnapshot,
      maxBodyBytes,
    }),
    hide: launcher.hide,
    launcher: {
      getSnapshot: launcher.getSnapshot,
      subscribe: launcher.subscribe,
    },
    presetNames: {
      getSnapshot: presetNames.getSnapshot,
      reset: presetNames.reset,
      set: presetNames.set,
      subscribe: presetNames.subscribe,
    },
    records: {
      clear: buffer.clear,
      getSnapshot: buffer.getSnapshot,
      subscribe: buffer.subscribe,
    },
    rules: {
      add: ruleStore.add,
      clear: ruleStore.clear,
      getSnapshot: ruleStore.getSnapshot,
      remove: ruleStore.remove,
      subscribe: ruleStore.subscribe,
      update: ruleStore.update,
    },
    show: launcher.show,
    toggle: launcher.toggle,
  };

  window.__API_DEVTOOLS__ = api;
  return api;
};
