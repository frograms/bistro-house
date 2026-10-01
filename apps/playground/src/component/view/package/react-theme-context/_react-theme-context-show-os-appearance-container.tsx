import { CommonCodeBlock } from "@playground/component/view/_common/common-code-block";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import {
  CommonExampleStagePanel,
  CommonExampleStatePanel,
} from "@playground/component/view/_common/common-example-panels";
import { useSystemAppearance } from "@watcha-authentic/react-theme-context";

import { reactThemeContextShowOsAppearanceCss } from "./_react-theme-context-show-os-appearance-container.css";

const SYSTEM_APPEARANCE_CODE_EXAMPLE = `const { appearance } = useSystemAppearance();`;

export const ReactThemeContextShowOsAppearanceContainer = () => {
  const { appearance } = useSystemAppearance();

  return (
    <CommonContainer>
      <CommonExampleStagePanel
        className={reactThemeContextShowOsAppearanceCss.stage}>
        <div className={reactThemeContextShowOsAppearanceCss.card}>
          <p className={reactThemeContextShowOsAppearanceCss.label}>
            appearance
          </p>
          <p className={reactThemeContextShowOsAppearanceCss.value}>
            {appearance ?? "pending..."}
          </p>
        </div>
      </CommonExampleStagePanel>
      <CommonExampleStatePanel
        items={[
          {
            label: "appearance",
            value: appearance ?? "pending...",
          },
        ]}
      />
      <CommonCodeBlock code={SYSTEM_APPEARANCE_CODE_EXAMPLE} />
    </CommonContainer>
  );
};
