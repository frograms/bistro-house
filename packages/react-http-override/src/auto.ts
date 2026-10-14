import { createAutoInstall } from "./create-auto-install";

export { uninstallHttpOverride } from "./core/install";
export type { InstallHttpOverrideOptions } from "./create-auto-install";

/** React 18 이상용 — createRoot로 패널을 띄운다 */
export const installHttpOverride = createAutoInstall(
  () => import("./panel/mount-panel")
);
