import { ErrorContainer } from "@playground/component/view/_common/_status-error-container";
import type { ComponentType } from "react";
import type { RouteObject } from "react-router";

export const withChildrenRouteErrorElement = (
  routes: Array<RouteObject> | ReadonlyArray<RouteObject>
) => {
  return routes.map((route) => {
    if (route.errorElement) {
      return route;
    }

    return {
      ...route,
      errorElement: <ErrorContainer />,
    };
  });
};

export const withRouteComponent = ({
  AppContent,
  routes,
}: {
  AppContent: ComponentType;
  routes: Array<RouteObject> | ReadonlyArray<RouteObject>;
}) => {
  return {
    children: withChildrenRouteErrorElement(routes),
    Component: AppContent,
  };
};
