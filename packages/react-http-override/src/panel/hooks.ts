import { useSyncExternalStore } from "use-sync-external-store/shim";

import type {
  HttpOverrideApi,
  HttpOverrideRecord,
  HttpOverrideRule,
} from "../core";

export const useRecords = (api: HttpOverrideApi): HttpOverrideRecord[] =>
  useSyncExternalStore(api.records.subscribe, api.records.getSnapshot);

export const useRules = (api: HttpOverrideApi): HttpOverrideRule[] =>
  useSyncExternalStore(api.rules.subscribe, api.rules.getSnapshot);

export const useLauncherVisible = (api: HttpOverrideApi): boolean =>
  useSyncExternalStore(api.launcher.subscribe, api.launcher.getSnapshot);

export const usePresetNames = (
  api: HttpOverrideApi
): Record<string, string> =>
  useSyncExternalStore(
    api.presetNames.subscribe,
    api.presetNames.getSnapshot
  );
