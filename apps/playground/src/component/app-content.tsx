import { Outlet } from "react-router";

import { PLAYGROUND_PAGES } from "../script/config/playground-page-config";
import { appContentCss } from "./app-content.css";
import { CommonPlaygroundSidebar } from "./view/_common/common-playground-sidebar";

export const AppContent = () => {
  return (
    <div className={appContentCss.shell}>
      <CommonPlaygroundSidebar items={PLAYGROUND_PAGES} />
      <Outlet />
    </div>
  );
};
