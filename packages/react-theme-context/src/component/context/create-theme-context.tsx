"use client";

import { createContext } from "@watcha-authentic/react-context-factory";
import { useEventCallback } from "@watcha-authentic/react-event-callback";
import { useIsomorphicLayoutEffect } from "@watcha-authentic/react-isomorphic-layout-effect";
import { type SetStateAction, useMemo, useRef, useState } from "react";

import type { SystemAppearanceName } from "../../script/type/appearance-type";
import type {
  Theme,
  ThemeContextActions,
  ThemeContextProviderProps,
} from "../../script/type/theme-type";
import { useSystemAppearance } from "../hook/use-system-appearance";

/**
 * 목록에서 이름과 같은 테마를 찾는다.
 */
const findTheme = <ThemeValue, ThemeName extends string>({
  name,
  themes,
}: {
  name: string;
  themes: ReadonlyArray<Theme<ThemeValue, ThemeName>>;
}): Theme<ThemeValue, ThemeName> | undefined => {
  return themes.find((item) => {
    return item.name === name;
  });
};

/**
 * 테마 컨텍스트를 만든다. 모듈 스코프에서 한 번 호출한다.
 * - 처음에는 `defaultTheme` 이름에 해당하는 테마를 쓴다.
 * - `"system-appearance"`이면 `onResolveSystemTheme`으로 OS 어피어런스를 따른다.
 * - `setTheme`이 호출되면 목록에 있는 테마로 바꾸거나 OS를 따른다.
 */
export const createThemeContext = <
  ThemeValue,
  ThemeName extends string = string,
>() =>
  createContext<
    ThemeContextActions<ThemeValue, ThemeName>,
    ThemeContextProviderProps<ThemeValue, ThemeName>
  >({
    providerComponent: ({ context }) => {
      /**
       * 선택된 테마를 하위에 전달한다.
       */
      const ThemeContextProvider = ({
        children,
        defaultTheme,
        onResolveSystemTheme,
        onThemeSelect,
        themes,
      }: ThemeContextProviderProps<ThemeValue, ThemeName>) => {
        const [themeName, setThemeName] = useState<
          ThemeName | SystemAppearanceName
        >(defaultTheme);

        const prevTheme = useRef<Theme<ThemeValue, ThemeName> | undefined>(
          undefined
        );

        const { appearance } = useSystemAppearance();

        const stableOnThemeSelect = useEventCallback(onThemeSelect);
        const stableOnResolveSystemTheme =
          useEventCallback(onResolveSystemTheme);

        const selectTheme = useEventCallback(
          (next: SetStateAction<ThemeName | SystemAppearanceName>) => {
            setThemeName((prevThemeName) => {
              const nextThemeName =
                typeof next === "function" ? next(prevThemeName) : next;

              if (nextThemeName === "system-appearance") {
                return nextThemeName;
              } else {
                return (
                  findTheme({ name: nextThemeName, themes })?.name ??
                  prevThemeName
                );
              }
            });
          }
        );

        const theme = useMemo(() => {
          let resolvedThemeName: ThemeName;

          if (themeName === "system-appearance") {
            resolvedThemeName = stableOnResolveSystemTheme(appearance);
          } else {
            resolvedThemeName = themeName;
          }

          const foundTheme = findTheme({ name: resolvedThemeName, themes });
          if (!foundTheme) {
            throw new Error(
              `Cannot find theme in themes. (${resolvedThemeName})`
            );
          }

          return foundTheme;
        }, [appearance, stableOnResolveSystemTheme, themeName, themes]);

        const actions = useMemo<
          ThemeContextActions<ThemeValue, ThemeName>
        >(() => {
          return {
            setTheme: selectTheme,
            theme,
          };
        }, [selectTheme, theme]);

        // 테마가 변경되면 onThemeSelect을 호출한다.
        useIsomorphicLayoutEffect(() => {
          if (prevTheme.current?.name !== theme.name) {
            stableOnThemeSelect(theme, prevTheme.current);
          }
          prevTheme.current = theme;
        }, [stableOnThemeSelect, theme]);

        return <context.Provider value={actions}>{children}</context.Provider>;
      };

      return ThemeContextProvider;
    },
  });
