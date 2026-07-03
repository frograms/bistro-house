import { HomeContainer } from "@playground/component/view/home/_home-container";
import { PackageAppContent } from "@playground/component/view/package/app-package-content";
import { withRouteComponent } from "@playground/script/util/router-utils";
import type { RouteObject } from "react-router";

export const commonRoutes: ReadonlyArray<RouteObject> = [
  withRouteComponent({
    AppContent: PackageAppContent,
    routes: [
      {
        element: <HomeContainer />,
        path: "/",
      },
    ],
  }),
];
