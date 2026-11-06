import { createStore } from "./create-store";
import { DEFAULT_SHORTCUT } from "./shortcut";
import type { HttpOverrideStorage } from "./types";

const STORAGE_KEY = "__HTTP_OVERRIDE_LAUNCHER_HIDDEN__";

const howToShow = (shortcutLabel: null | string) =>
  shortcutLabel === null ? "api.show()" : shortcutLabel;

export const restoreHint = (shortcutLabel: null | string) =>
  `[react-http-override] devtool 버튼을 숨겼습니다. ${howToShow(shortcutLabel)}로 다시 표시할 수 있습니다.`;

export const hiddenOnLoadHint = (shortcutLabel: null | string) =>
  `[react-http-override] devtool 버튼이 숨김 상태입니다. ${howToShow(shortcutLabel)}로 표시할 수 있습니다.`;

export type LauncherVisibility = {
  getSnapshot(): boolean;
  hide(): void;
  show(): void;
  subscribe(listener: () => void): () => void;
  toggle(): void;
};

export const createLauncherVisibility = (
  storage: HttpOverrideStorage,
  shortcutLabel: null | string = DEFAULT_SHORTCUT
): LauncherVisibility => {
  const store = createStore<boolean>(storage.getItem(STORAGE_KEY) === null);

  if (!store.getSnapshot()) {
    console.info(hiddenOnLoadHint(shortcutLabel));
  }

  const show = () => {
    storage.removeItem(STORAGE_KEY);
    store.setSnapshot(true);
  };

  const hide = () => {
    storage.setItem(STORAGE_KEY, "1");
    store.setSnapshot(false);
    console.info(restoreHint(shortcutLabel));
  };

  return {
    getSnapshot: store.getSnapshot,
    hide,
    show,
    subscribe: store.subscribe,
    toggle: () => {
      if (store.getSnapshot()) hide();
      else show();
    },
  };
};
