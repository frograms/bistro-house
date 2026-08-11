import {
  initializeApp,
  initializeGlobalApp,
} from "@playground/app-initializer";
import { useVitePreloadError } from "@playground/component/hook/use-vite-preload-error";
import { router } from "@playground/script/route/_router";
import { useEffect } from "react";
import { RouterProvider } from "react-router";

initializeGlobalApp();

export const App = () => {
  useVitePreloadError();

  useEffect(() => {
    initializeApp();
  }, []);

  return <RouterProvider router={router} />;
};
