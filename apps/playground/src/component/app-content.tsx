import { appContentCss } from "@playground/component/app-content.css";
import {
  CommonSidebar,
  type CommonSidebarSection,
} from "@playground/component/view/_common/common-sidebar";
import { MENU_INFO } from "@playground/script/config/menu-info-config";
import { Outlet } from "react-router";

const PLAYGROUND_SIDEBAR_SECTIONS: ReadonlyArray<CommonSidebarSection> =
  MENU_INFO.map((menuInfo) => {
    return {
      items: menuInfo.items.map((item) => ({
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
