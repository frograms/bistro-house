import { PackageAppContent } from "@playground/component/view/package/app-package-content";
import { ReactMotionGlobalContainer } from "@playground/component/view/package/react-motion/_react-motion-global-container";
import { ReactMotionPointerContainer } from "@playground/component/view/package/react-motion/_react-motion-pointer-container";
import { ReactSliderPeekContainer } from "@playground/component/view/package/react-slider/_react-slider-peek-container";
import { ReactSliderSingleContainer } from "@playground/component/view/package/react-slider/_react-slider-single-container";
import { withRouteComponent } from "@playground/script/util/router-utils";
import type { RouteObject } from "react-router";

export const playgroundRoutes: ReadonlyArray<RouteObject> = [
  // react-slider
  withRouteComponent({
    AppContent: PackageAppContent,
    routes: [
      {
        lazy: async () => {
          return {
            Component: (
              await import("@playground/component/view/package/react-slider/_react-slider-documentation-container")
            ).ReactSliderDocumentationContainer,
          };
        },
        path: "/react-slider",
      },
      {
        element: <ReactSliderSingleContainer />,
        path: "/react-slider/single",
      },
      {
        element: <ReactSliderPeekContainer />,
        path: "/react-slider/peek",
      },
    ],
  }),
  // react-motion
  withRouteComponent({
    AppContent: PackageAppContent,
    routes: [
      {
        lazy: async () => {
          return {
            Component: (
              await import("@playground/component/view/package/react-motion/_react-motion-documentation-container")
            ).ReactMotionDocumentationContainer,
          };
        },
        path: "/react-motion",
      },
      {
        element: <ReactMotionPointerContainer />,
        path: "/react-motion/pointer",
      },
      {
        element: <ReactMotionGlobalContainer />,
        path: "/react-motion/global",
      },
    ],
  }),
];
