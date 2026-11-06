import type { ReactElement } from "react";
import * as ReactDOM from "react-dom";

import type { MountPanel } from "../create-auto-install";
import { HttpOverrideLauncher } from "./http-override-launcher";
import { appendPanelContainer, keepPanelAttached } from "./panel-container";

/* React 17,18 전용 API — React 19 타입에는 없어서 직접 선언한다 */
type LegacyReactDom = {
  render(element: ReactElement, container: Element): void;
  unmountComponentAtNode(container: Element): boolean;
};

export const mountPanel: MountPanel = ({ presets }) => {
  const legacyDom = ReactDOM as unknown as LegacyReactDom;
  const container = appendPanelContainer();
  const detach = keepPanelAttached(container);
  legacyDom.render(
    <HttpOverrideLauncher presets={presets} />,
    container
  );

  return () => {
    detach();
    legacyDom.unmountComponentAtNode(container);
    container.remove();
  };
};
