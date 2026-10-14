import type { Dispatch, ReactNode, SetStateAction } from "react";

import type { SystemAppearance, SystemAppearanceName } from "./appearance-type";

/**
 * 이름이 있는 테마.
 */
export type Theme<ThemeValue, ThemeName extends string = string> = {
  name: ThemeName;
  value: ThemeValue;
};

/**
 * 테마 컨텍스트 값.
 */
export type ThemeContextActions<
  ThemeValue,
  ThemeName extends string = string,
> = {
  /**
   * 테마 이름 또는 `"system-appearance"`로 변경합니다.
   */
  setTheme: Dispatch<SetStateAction<ThemeName | SystemAppearanceName>>;
  theme: Theme<ThemeValue, ThemeName>;
};

/**
 * 테마 Provider props.
 */
export type ThemeContextProviderProps<
  ThemeValue,
  ThemeName extends string = string,
> = {
  children?: ReactNode;

  defaultTheme: ThemeName | SystemAppearanceName;
  /**
   * OS 어피어런스를 목록 테마 이름으로 바꾼다.
   */
  onResolveSystemTheme: (appearance: SystemAppearance | undefined) => ThemeName;
  /**
   * 테마 이름이 바뀔 때 호출한다.
   * 첫 호출의 `before`는 비어 있습니다.
   */
  onThemeSelect?: (
    selected: Theme<ThemeValue, ThemeName>,
    before?: Theme<ThemeValue, ThemeName>
  ) => void;
  themes: ReadonlyArray<Theme<ThemeValue, ThemeName>>;
};
