import reactStableRefCallbackReadme from "@packages/react-stable-ref-callback/README.md?raw";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import { CommonReadme } from "@playground/component/view/_common/common-readme";

export const ReactStableRefCallbackDocumentationContainer = () => {
  return (
    <CommonContainer>
      <CommonReadme markdown={reactStableRefCallbackReadme} />
    </CommonContainer>
  );
};
