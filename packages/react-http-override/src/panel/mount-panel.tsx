import { createRoot } from "react-dom/client";

import type { HttpOverridePreset } from "../core";
import { HttpOverrideLauncher } from "./http-override-launcher";

export type MountPanelOptions = {
  presets?: HttpOverridePreset[];
};

export const mountPanel = ({ presets }: MountPanelOptions): (() => void) => {
  const container = document.createElement("div");
  container.setAttribute("data-http-override", "");
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<HttpOverrideLauncher presets={presets} enabled />);

  return () => {
    root.unmount();
    container.remove();
  };
};
