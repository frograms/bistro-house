import { HomeContainer } from "@playground/component/view/home/_home-container";
import { AppPlaygroundContent } from "@playground/component/view/package/app-playground-content";
import { withRouteComponent } from "@playground/script/util/router-utils";
import type { RouteObject } from "react-router";

export const commonRoutes: ReadonlyArray<RouteObject> = [
  withRouteComponent({
    AppContent: AppPlaygroundContent,
    routes: [
      {
        element: <HomeContainer />,
        path: "/",
      },
    ],
  }),
];
