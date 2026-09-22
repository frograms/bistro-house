import { CommonContainer } from "@playground/component/view/_common/common-container";
import { CommonReadme } from "@playground/component/view/_common/common-readme";
import reactStableRefCallbackReadme from "@watcha-authentic/react-stable-ref-callback/README.md?raw";

export const ReactStableRefCallbackDocumentationContainer = () => {
  return (
    <CommonContainer>
      <CommonReadme markdown={reactStableRefCallbackReadme} />
    </CommonContainer>
  );
};
