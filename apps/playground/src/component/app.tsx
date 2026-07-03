import "@playground/resource/css/common/global-style.css";

import { router } from "@playground/script/route/_router";
import { RouterProvider } from "react-router";

export const App = () => {
  return <RouterProvider router={router} />;
};
