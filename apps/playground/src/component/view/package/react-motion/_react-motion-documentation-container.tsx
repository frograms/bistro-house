import reactMotionReadme from "@packages/react-motion/README.md?raw";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import { CommonReadme } from "@playground/component/view/_common/common-readme";

export const ReactMotionDocumentationContainer = () => {
  return (
    <CommonContainer>
      <CommonReadme markdown={reactMotionReadme} />
    </CommonContainer>
  );
};
