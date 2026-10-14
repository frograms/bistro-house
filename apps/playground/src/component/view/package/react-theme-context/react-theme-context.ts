import { createThemeContext } from "@watcha-authentic/react-theme-context";

/**
 * 토큰.
 */
export type SampleThemeToken = {
  background: string;
  color: string;
};

/**
 * 테마 이름.
 */
export type ThemeName = "dark" | "light";

/**
 * 테마 컨텍스트.
 */
export const { Provider: ThemeContextProvider, use: useThemeContext } =
  createThemeContext<SampleThemeToken, ThemeName>();
