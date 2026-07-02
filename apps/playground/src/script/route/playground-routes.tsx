import { Navigate, type RouteObject } from "react-router";

import { AppContent } from "../../component/app-content";
import { HomeContainer } from "../../component/view/home/_home-container";
import { PLAYGROUND_PAGES } from "../config/playground-page-config";

export const playgroundRoutes: Array<RouteObject> = [
  {
    children: [
      {
        element: <HomeContainer />,
        index: true,
      },
      {
        element: <Navigate to="/react-slider/single" replace />,
        path: "react-slider/basic",
      },
      ...PLAYGROUND_PAGES.map<RouteObject>((page) => ({
        element: page.renderPage(),
        path: page.path.replace(/^\//, ""),
      })),
      {
        element: <Navigate to="/" replace />,
        path: "*",
      },
    ],
    element: <AppContent />,
  },
];
