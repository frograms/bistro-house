import "../resource/css/common/global-style.css";

import { RouterProvider } from "react-router";

import { router } from "../script/route/_router";

export const App = () => {
  return <RouterProvider router={router} />;
};
