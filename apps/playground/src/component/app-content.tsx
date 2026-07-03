import { Outlet } from "react-router";

import { PLAYGROUND_PAGES } from "../script/config/playground-page-config";
import { appContentCss } from "./app-content.css";
import { CommonSidebar } from "./view/_common/common-sidebar";

export const AppContent = () => {
  return (
    <div className={appContentCss.shell}>
      <CommonSidebar items={PLAYGROUND_PAGES} />
      <Outlet />
    </div>
  );
};
