import { createBrowserRouter, type RouteObject } from "react-router";

import { AppContent } from "../../component/app-content";
import { ErrorContainer } from "../../component/view/_common/_status-error-container";
import { NotFoundContainer } from "../../component/view/_common/_status-not-found-container";
import { withRouteComponent } from "../util/router-utils";
import { commonRoutes } from "./common-routes";
import { playgroundRoutes } from "./playground-routes";

let routes: Array<RouteObject> = [
  {
    element: <NotFoundContainer />,
    path: "/404",
  },
  {
    element: <ErrorContainer />,
    path: "/500",
  },
  {
    element: <NotFoundContainer />,
    path: "*",
  },
];

routes = routes.concat(commonRoutes);
routes = routes.concat(playgroundRoutes);

export const router = createBrowserRouter([
  withRouteComponent({ AppContent, routes }),
]);
