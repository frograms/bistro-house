import { createLauncherVisibility } from "./launcher-visibility";
import {
  createOverrideFetch,
  DEFAULT_MAX_BODY_BYTES,
  truncateBody,
} from "./override-fetch";
import { createPresetNameStore } from "./preset-names";
import { createRecordBuffer } from "./record-buffer";
import { createRuleStore } from "./rule-store";
import { createSafeStorage } from "./safe-storage";
import type { HttpOverrideApi, HttpOverrideStorage } from "./types";

export type InstallHttpOverrideOptions = {
  isServerRequest?: (url: string) => boolean;
  maxBodyBytes?: number;
  maxRecords?: number;
  onRevalidate?: (url: string) => Promise<unknown> | void;
  ssrData?: Record<string, unknown>;
  storage?: HttpOverrideStorage;
};

const stringifyForRecord = (value: unknown): string | null => {
  try {
    return JSON.stringify(value) ?? null;
  } catch {
    return null;
  }
};

type Installation = {
  api: HttpOverrideApi;
  cleanups: (() => void)[];
  originalFetch: typeof fetch;
  patchedFetch: typeof fetch;
};

let installation: Installation | null = null;

/** 설치 안 됐거나 SSR이면 null */
export const getHttpOverride = (): HttpOverrideApi | null =>
  installation?.api ?? null;

/** window.fetch를 가로채 설치한다. SSR이면 no-op, 중복 호출 시 기존 설치 반환 */
export const installHttpOverride = (
  options: InstallHttpOverrideOptions = {}
): HttpOverrideApi | null => {
  if (typeof window === "undefined") return null;
  if (installation !== null) return installation.api;

  const {
    isServerRequest,
    maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
    maxRecords,
    onRevalidate,
    ssrData,
    storage,
  } = options;
  const originalFetch = window.fetch;
  const sessionStore =
    storage ?? createSafeStorage(() => window.sessionStorage);
  const ruleStore = createRuleStore(sessionStore);
  const presetNames = createPresetNameStore(sessionStore);
  const buffer = createRecordBuffer({ maxRecords });
  const installedAt = Date.now();
  Object.entries(ssrData ?? {}).forEach(([key, value]) => {
    const body = stringifyForRecord(value);
    buffer.push({
      durationMs: null,
      method: "SSR",
      mocked: false,
      ok: true,
      responseBody: body === null ? null : truncateBody(body, maxBodyBytes),
      source: "server",
      startedAt: installedAt,
      state: "done",
      status: null,
      url: key,
    });
  });
  const launcher = createLauncherVisibility(
    createSafeStorage(() => window.localStorage)
  );

  const canRevalidate = (method: string) =>
    onRevalidate !== undefined || method === "GET";

  const api: HttpOverrideApi = {
    canRevalidate,
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
    revalidate: (url, method) => {
      if (onRevalidate !== undefined) {
        onRevalidate(url);
        return;
      }
      if (!canRevalidate(method)) return;
      patchedFetch(url).catch(() => undefined);
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

  const patchedFetch = createOverrideFetch({
    baseFetch: (input, init) => originalFetch.call(window, input, init),
    buffer,
    getRules: ruleStore.getSnapshot,
    isServerRequest,
    maxBodyBytes,
  });

  window.fetch = patchedFetch;
  installation = { api, cleanups: [], originalFetch, patchedFetch };
  return api;
};

export const onUninstall = (cleanup: () => void): void => {
  installation?.cleanups.push(cleanup);
};

/** 원래 fetch로 되돌린다. 그 사이 다른 코드가 fetch를 다시 패치했다면 그 패치는 건드리지 않는다 */
export const uninstallHttpOverride = (): void => {
  if (installation === null) return;
  installation.cleanups.forEach((cleanup) => cleanup());
  if (window.fetch === installation.patchedFetch) {
    window.fetch = installation.originalFetch;
  }
  installation = null;
};
