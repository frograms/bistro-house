import { ReactMotionGlobalContainer } from "@playground/component/view/package/react-motion/_react-motion-global-container";
import { ReactMotionPointerContainer } from "@playground/component/view/package/react-motion/_react-motion-pointer-container";
import { ReactSliderPeekContainer } from "@playground/component/view/package/react-slider/_react-slider-peek-container";
import { ReactSliderSingleContainer } from "@playground/component/view/package/react-slider/_react-slider-single-container";
import { ReactSliderTransitionContainer } from "@playground/component/view/package/react-slider/_react-slider-transition-container";
import { ReactStableRefCallbackAvoidNullOnRerenderContainer } from "@playground/component/view/package/react-stable-ref-callback/_react-stable-ref-callback-avoid-null-on-rerender-container";
import { ReactThemeContextPickThemeContainer } from "@playground/component/view/package/react-theme-context/_react-theme-context-pick-theme-container";
import { ReactThemeContextShowOsAppearanceContainer } from "@playground/component/view/package/react-theme-context/_react-theme-context-show-os-appearance-container";
import { AppThemeContent } from "@playground/component/view/package/react-theme-context/app-theme-content";
import { withRouteComponent } from "@playground/script/util/router-utils";
import type { RouteObject } from "react-router";

export const playgroundRoutes: ReadonlyArray<RouteObject> = [
  // react-slider
  withRouteComponent({
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
  // react-theme-context
  withRouteComponent({
    AppContent: AppThemeContent,
    routes: [
      {
        lazy: async () => {
          return {
            Component: (
              await import("@playground/component/view/package/react-theme-context/_react-theme-context-documentation-container")
            ).ReactThemeContextDocumentationContainer,
          };
        },
        path: "/react-theme-context",
      },
      {
        element: <ReactThemeContextPickThemeContainer />,
        path: "/react-theme-context/pick-theme",
      },
    ],
  }),
  withRouteComponent({
    routes: [
      {
        element: <ReactThemeContextShowOsAppearanceContainer />,
        path: "/react-theme-context/show-os-appearance",
      },
    ],
  }),
];
