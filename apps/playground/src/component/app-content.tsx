import { Outlet } from "react-router";

import { MENU_INFO } from "../script/config/menu-info-config";
import { appContentCss } from "./app-content.css";
import { CommonSidebar, type CommonSidebarSection } from "./view/_common/common-sidebar";

const PLAYGROUND_SIDEBAR_SECTIONS: ReadonlyArray<CommonSidebarSection> =
  MENU_INFO.map((menuInfo) => {
    return {
      items: menuInfo.items
        .map((item) => ({
          label: item.exampleLabel,
          to: item.path,
        })),
      label: menuInfo.packageLabel,
      to: menuInfo.path,
    };
  });

export const AppContent = () => {
  return (
    <div className={appContentCss.shell}>
      <CommonSidebar sections={PLAYGROUND_SIDEBAR_SECTIONS} />
      <Outlet />
    </div>
  );
};
