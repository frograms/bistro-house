import reactHttpOverrideReadme from "@packages/react-http-override/README.md?raw";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import { CommonReadme } from "@playground/component/view/_common/common-readme";

export const ReactHttpOverrideDocumentationContainer = () => (
  <CommonContainer>
    <CommonReadme markdown={reactHttpOverrideReadme} />
  </CommonContainer>
);
