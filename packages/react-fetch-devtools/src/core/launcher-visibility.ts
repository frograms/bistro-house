import { createStore } from "./create-store";
import type { FetchDevtoolsStorage } from "./types";

const STORAGE_KEY = "__API_DEVTOOLS_LAUNCHER_HIDDEN__";

export const RESTORE_HINT =
  "[react-fetch-devtools] 런처 버튼을 숨겼습니다. 콘솔에서 __API_DEVTOOLS__.show() 로 다시 표시할 수 있습니다.";

export type LauncherVisibility = {
  getSnapshot(): boolean;
  hide(): void;
  show(): void;
  subscribe(listener: () => void): () => void;
  toggle(): void;
};

export const createLauncherVisibility = (
  storage: FetchDevtoolsStorage
): LauncherVisibility => {
  const store = createStore<boolean>(storage.getItem(STORAGE_KEY) === null);

  const show = () => {
    storage.removeItem(STORAGE_KEY);
    store.setSnapshot(true);
  };

  const hide = () => {
    storage.setItem(STORAGE_KEY, "1");
    store.setSnapshot(false);
    console.info(RESTORE_HINT);
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
