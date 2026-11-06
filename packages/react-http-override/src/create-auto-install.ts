import type { HttpOverrideApi, HttpOverridePreset } from "./core";
import {
  findMissingFeatures,
  PANEL_FEATURES,
  unsupportedMessage,
  warnHttpOverride,
} from "./core/environment";
import type { InstallHttpOverrideOptions as CoreInstallOptions } from "./core/install";
import {
  getHttpOverride,
  installHttpOverride as installCore,
  onUninstall,
} from "./core/install";

export type MountPanel = (options: {
  presets?: HttpOverridePreset[];
}) => () => void;

export type InstallHttpOverrideOptions = CoreInstallOptions & {
  /** false면 패널을 띄우지 않기. 호스트가 HttpOverrideLauncher를 직접 마운트할 때 사용 */
  autoMount?: boolean;
  presets?: HttpOverridePreset[];
};

const afterPageSettled = (callback: () => void): (() => void) => {
  let timer: number | null = null;
  const schedule = () => {
    timer =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(callback)
        : window.setTimeout(callback, 0);
  };

  if (document.readyState === "complete") {
    schedule();
  } else {
    window.addEventListener("load", schedule, { once: true });
  }

  return () => {
    window.removeEventListener("load", schedule);
    if (timer === null) return;
    if (typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(timer);
    }
    window.clearTimeout(timer);
  };
};

/** 마운트 방식(React 버전별)만 주입받아 자동 마운트 install을 만든다 */
export const createAutoInstall =
  (loadMountPanel: () => Promise<{ mountPanel: MountPanel }>) =>
  (options: InstallHttpOverrideOptions = {}): HttpOverrideApi | null => {
    const { autoMount = true, presets, ...coreOptions } = options;
    const alreadyInstalled = getHttpOverride() !== null;
    const api = installCore(coreOptions);
    if (api === null || alreadyInstalled || !autoMount) return api;

    let disposed = false;
    let unmount: (() => void) | null = null;
    const missing = findMissingFeatures(PANEL_FEATURES);
    if (missing.length > 0) {
      warnHttpOverride(unsupportedMessage("패널을", missing));
      return api;
    }

    // 패널이 실패해도 기록과 룰 적용은 계속 동작
    const cancelSchedule = afterPageSettled(() => {
      loadMountPanel()
        .then(({ mountPanel }) => {
          if (disposed) return;
          unmount = mountPanel({ presets });
        })
        .catch((error: unknown) => {
          warnHttpOverride("패널을 띄우지 못했습니다.", error);
        });
    });

    onUninstall(() => {
      disposed = true;
      cancelSchedule();
      if (unmount !== null) void Promise.resolve().then(unmount);
    });
    return api;
  };
