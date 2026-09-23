import { CommonContainer } from "@playground/component/view/_common/common-container";
import { CommonReadme } from "@playground/component/view/_common/common-readme";
import reactMotionReadme from "@watcha-authentic/react-motion/README.md?raw";

export const ReactMotionDocumentationContainer = () => {
  return (
    <CommonContainer>
      <CommonReadme markdown={reactMotionReadme} />
    </CommonContainer>
  );
};
