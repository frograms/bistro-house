import reactSliderReadme from "@packages/react-slider/README.md?raw";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import { CommonReadme } from "@playground/component/view/_common/common-readme";

export const ReactSliderDocumentationContainer = () => {
  return (
    <CommonContainer>
      <CommonReadme markdown={reactSliderReadme} />
    </CommonContainer>
  );
};
