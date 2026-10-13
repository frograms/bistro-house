import { createAutoInstall } from "./create-auto-install";

export { uninstallHttpOverride } from "./core/install";
export type { InstallHttpOverrideOptions } from "./create-auto-install";

/** React 17·18용 — ReactDOM.render로 패널을 띄운다 */
export const installHttpOverride = createAutoInstall(
  () => import("./panel/mount-panel-legacy")
);
