import { CommonCodeBlock } from "@playground/component/view/_common/common-code-block";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import {
  CommonExampleControlPanel,
  CommonExampleStagePanel,
  CommonExampleStatePanel,
} from "@playground/component/view/_common/common-example-panels";
import { commonExampleControlsCss } from "@playground/resource/css/common/common-example-controls.css";
import { useState } from "react";

import { reactThemeContextPickThemeCss } from "./_react-theme-context-pick-theme-container.css";
import { type ThemeName, useThemeContext } from "./react-theme-context";

/**
 * `setTheme`에 넘기는 값.
 */
type SetThemeName = ThemeName | "system-appearance";

const SET_THEME_OPTIONS: ReadonlyArray<{
  label: string;
  value: SetThemeName;
}> = [
  { label: "시스템", value: "system-appearance" },
  { label: "라이트", value: "light" },
  { label: "다크", value: "dark" },
];

const THEME_CONTEXT_CODE_EXAMPLE = `const ThemeContext = createThemeContext<ColorTokens, "dark" | "light">();

const ThemeLabel = () => {
  const { setTheme, theme } = ThemeContext.use();

  return (
    <p>
      {theme.name}
      <button type="button" onClick={() => setTheme("light")}>
        라이트로 바꾸기
      </button>
      <button type="button" onClick={() => setTheme("dark")}>
        다크로 바꾸기
      </button>
      <button type="button" onClick={() => setTheme("system-appearance")}>
        OS 어피어런스 따르기
      </button>
    </p>
  );
};

<ThemeContext.Provider
  defaultTheme="system-appearance"
  themes={[lightTheme, darkTheme]}
  onResolveSystemTheme={(appearance) => {
    return appearance ?? "light";
  }}
  onThemeSelect={(selected, before) => {
    document.documentElement.classList.add(selected.name);
    if (before !== undefined) {
      document.documentElement.classList.remove(before.name);
    }
  }}
>
  <ThemeLabel />
</ThemeContext.Provider>`;

export const ReactThemeContextPickThemeContainer = () => {
  const { setTheme, theme } = useThemeContext();
  const [preference, setPreference] =
    useState<SetThemeName>("system-appearance");

  return (
    <CommonContainer>
      <CommonExampleControlPanel>
        <label className={commonExampleControlsCss.checkboxField}>
          <span>테마</span>
          <select
            aria-label="테마"
            value={preference}
            onChange={(event) => {
              const nextThemeName = event.target.value as SetThemeName;

              setPreference(nextThemeName);
              setTheme(nextThemeName);
            }}>
            {SET_THEME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </CommonExampleControlPanel>
      <CommonExampleStagePanel className={reactThemeContextPickThemeCss.stage}>
        <p className={reactThemeContextPickThemeCss.stageGuide}>
          테마를 골라 보세요.
        </p>
        <div className={reactThemeContextPickThemeCss.card}>
          <div
            className={reactThemeContextPickThemeCss.swatch}
            style={{
              backgroundColor: theme.value.background,
              color: theme.value.color,
            }}>
            <p className={reactThemeContextPickThemeCss.swatchLabel}>
              theme.name
            </p>
            <p className={reactThemeContextPickThemeCss.swatchValue}>
              {theme.name}
            </p>
          </div>
        </div>
      </CommonExampleStagePanel>
      <CommonExampleStatePanel
        items={[
          { label: "preference", value: preference },
          { label: "theme.name", value: theme.name },
        ]}
      />
      <CommonCodeBlock code={THEME_CONTEXT_CODE_EXAMPLE} />
    </CommonContainer>
  );
};
