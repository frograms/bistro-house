import type { RouteObject } from "react-router";

import { PackageAppContent } from "../../component/view/package/app-package-content";
import { ReactMotionDocumentationContainer } from "../../component/view/package/react-motion/_react-motion-documentation-container";
import { ReactMotionGlobalContainer } from "../../component/view/package/react-motion/_react-motion-global-container";
import { ReactMotionPointerContainer } from "../../component/view/package/react-motion/_react-motion-pointer-container";
import { ReactSliderDocumentationContainer } from "../../component/view/package/react-slider/_react-slider-documentation-container";
import { ReactSliderPeekContainer } from "../../component/view/package/react-slider/_react-slider-peek-container";
import { ReactSliderSingleContainer } from "../../component/view/package/react-slider/_react-slider-single-container";
import { withRouteComponent } from "../util/router-utils";

export const playgroundRoutes: ReadonlyArray<RouteObject> = [
  withRouteComponent({
    AppContent: PackageAppContent,
    routes: [
      {
        element: <ReactSliderDocumentationContainer />,
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
        element: <ReactMotionDocumentationContainer />,
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
