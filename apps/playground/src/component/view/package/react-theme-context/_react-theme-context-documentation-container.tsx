import { CommonContainer } from "@playground/component/view/_common/common-container";
import { CommonReadme } from "@playground/component/view/_common/common-readme";
import reactThemeContextReadme from "@watcha-authentic/react-theme-context/README.md?raw";

export const ReactThemeContextDocumentationContainer = () => {
  return (
    <CommonContainer>
      <CommonReadme markdown={reactThemeContextReadme} />
    </CommonContainer>
  );
};
