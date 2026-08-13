import { PackageAppContent } from "@playground/component/view/package/app-package-content";
import { ReactFetchDevtoolsObserveAndMockContainer } from "@playground/component/view/package/react-fetch-devtools/_react-fetch-devtools-observe-and-mock-container";
import { ReactMotionGlobalContainer } from "@playground/component/view/package/react-motion/_react-motion-global-container";
import { ReactMotionPointerContainer } from "@playground/component/view/package/react-motion/_react-motion-pointer-container";
import { ReactSliderPeekContainer } from "@playground/component/view/package/react-slider/_react-slider-peek-container";
import { ReactSliderSingleContainer } from "@playground/component/view/package/react-slider/_react-slider-single-container";
import { ReactSliderTransitionContainer } from "@playground/component/view/package/react-slider/_react-slider-transition-container";
import { ReactStableRefCallbackAvoidNullOnRerenderContainer } from "@playground/component/view/package/react-stable-ref-callback/_react-stable-ref-callback-avoid-null-on-rerender-container";
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
      {
        element: <ReactSliderTransitionContainer />,
        path: "/react-slider/transition",
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
  // react-stable-ref-callback
  withRouteComponent({
    AppContent: PackageAppContent,
    routes: [
      {
        lazy: async () => {
          return {
            Component: (
              await import("@playground/component/view/package/react-stable-ref-callback/_react-stable-ref-callback-documentation-container")
            ).ReactStableRefCallbackDocumentationContainer,
          };
        },
        path: "/react-stable-ref-callback",
      },
      {
        element: <ReactStableRefCallbackAvoidNullOnRerenderContainer />,
        path: "/react-stable-ref-callback/avoid-null-on-rerender",
      },
    ],
  }),
  // react-fetch-devtools
  withRouteComponent({
    AppContent: PackageAppContent,
    routes: [
      {
        lazy: async () => {
          return {
            Component: (
              await import("@playground/component/view/package/react-fetch-devtools/_react-fetch-devtools-documentation-container")
            ).ReactFetchDevtoolsDocumentationContainer,
          };
        },
        path: "/react-fetch-devtools",
      },
      {
        element: <ReactFetchDevtoolsObserveAndMockContainer />,
        path: "/react-fetch-devtools/observe-and-mock",
      },
    ],
  }),
];
