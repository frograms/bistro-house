import type { RouteObject } from "react-router";

import { PackageAppContent } from "../../component/view/package/app-package-content";
import { PLAYGROUND_PAGES } from "../config/playground-page-config";
import { withRouteComponent } from "../util/router-utils";

export const playgroundRoutes: ReadonlyArray<RouteObject> = [
  withRouteComponent({
    AppContent: PackageAppContent,
    routes: PLAYGROUND_PAGES.map<RouteObject>((page) => ({
      element: page.renderPage(),
      path: page.path.replace(/^\//, ""),
    })),
  }),
];
