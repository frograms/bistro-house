import type { RouteObject } from "react-router";

import { HomeContainer } from "../../component/view/home/_home-container";
import { PackageAppContent } from "../../component/view/package/app-package-content";
import { withRouteComponent } from "../util/router-utils";

export const commonRoutes: ReadonlyArray<RouteObject> = [
  withRouteComponent({
    AppContent: PackageAppContent,
    routes: [
      {
        element: <HomeContainer />,
        index: true,
      },
    ],
  }),
];
