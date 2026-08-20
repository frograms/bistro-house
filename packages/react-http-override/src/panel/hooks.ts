import { useSyncExternalStore } from "use-sync-external-store/shim";

import type {
  HttpOverrideApi,
  HttpOverrideRecord,
  HttpOverrideRule,
} from "../core";

// SSR 프레임워크는 lazy 청크도 서버 렌더하므로 getServerSnapshot이 없으면 throw.
export const useRecords = (api: HttpOverrideApi): HttpOverrideRecord[] =>
  useSyncExternalStore(
    api.records.subscribe,
    api.records.getSnapshot,
    api.records.getSnapshot
  );

export const useRules = (api: HttpOverrideApi): HttpOverrideRule[] =>
  useSyncExternalStore(
    api.rules.subscribe,
    api.rules.getSnapshot,
    api.rules.getSnapshot
  );

export const useLauncherVisible = (api: HttpOverrideApi): boolean =>
  useSyncExternalStore(
    api.launcher.subscribe,
    api.launcher.getSnapshot,
    api.launcher.getSnapshot
  );

export const usePresetNames = (
  api: HttpOverrideApi
): Record<string, string> =>
  useSyncExternalStore(
    api.presetNames.subscribe,
    api.presetNames.getSnapshot,
    api.presetNames.getSnapshot
  );