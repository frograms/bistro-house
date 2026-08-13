import reactFetchDevtoolsReadme from "@packages/react-fetch-devtools/README.md?raw";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import { CommonReadme } from "@playground/component/view/_common/common-readme";

export const ReactFetchDevtoolsDocumentationContainer = () => (
  <CommonContainer>
    <CommonReadme markdown={reactFetchDevtoolsReadme} />
  </CommonContainer>
);
