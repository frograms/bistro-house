import { CommonContainer } from "@playground/component/view/_common/common-container";
import { CommonReadme } from "@playground/component/view/_common/common-readme";
import reactSliderReadme from "@watcha-authentic/react-slider/README.md?raw";

export const ReactSliderDocumentationContainer = () => {
  return (
    <CommonContainer>
      <CommonReadme markdown={reactSliderReadme} />
    </CommonContainer>
  );
};
