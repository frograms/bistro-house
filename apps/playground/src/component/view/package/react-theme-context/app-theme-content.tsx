import type { Theme } from "@watcha-authentic/react-theme-context";
import { Outlet } from "react-router";

import {
  type SampleThemeToken,
  ThemeContextProvider,
  type ThemeName,
} from "./react-theme-context";

const lightTheme: Theme<SampleThemeToken, Extract<ThemeName, "light">> = {
  name: "light",
  value: { background: "#ffffff", color: "#111827" },
};
const darkTheme: Theme<SampleThemeToken, Extract<ThemeName, "dark">> = {
  name: "dark",
  value: { background: "#111827", color: "#ffffff" },
};
const themes = [lightTheme, darkTheme];

export const AppThemeContent = () => {
  return (
    <ThemeContextProvider
      defaultTheme="system-appearance"
      themes={themes}
      onResolveSystemTheme={(appearance) => {
        return appearance ?? "light";
      }}>
      <Outlet />
    </ThemeContextProvider>
  );
};
