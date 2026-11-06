import { createRoot } from "react-dom/client";

import type { MountPanel } from "../create-auto-install";
import { HttpOverrideLauncher } from "./http-override-launcher";
import { appendPanelContainer, keepPanelAttached } from "./panel-container";

export const mountPanel: MountPanel = ({ presets }) => {
  const container = appendPanelContainer();
  const detach = keepPanelAttached(container);
  const root = createRoot(container);
  root.render(<HttpOverrideLauncher presets={presets} />);

  return () => {
    detach();
    root.unmount();
    container.remove();
  };
};
