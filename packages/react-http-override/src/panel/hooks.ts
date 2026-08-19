import { useSyncExternalStore } from "use-sync-external-store/shim";

import type {
  FetchDevtoolsApi,
  FetchDevtoolsRecord,
  FetchDevtoolsRule,
} from "../core";

export const useRecords = (api: FetchDevtoolsApi): FetchDevtoolsRecord[] =>
  useSyncExternalStore(api.records.subscribe, api.records.getSnapshot);

export const useRules = (api: FetchDevtoolsApi): FetchDevtoolsRule[] =>
  useSyncExternalStore(api.rules.subscribe, api.rules.getSnapshot);

export const useLauncherVisible = (api: FetchDevtoolsApi): boolean =>
  useSyncExternalStore(api.launcher.subscribe, api.launcher.getSnapshot);

export const usePresetNames = (
  api: FetchDevtoolsApi
): Record<string, string> =>
  useSyncExternalStore(
    api.presetNames.subscribe,
    api.presetNames.getSnapshot
  );
