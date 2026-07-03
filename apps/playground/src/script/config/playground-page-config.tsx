import type { ReactNode } from "react";

import type { CommonMenuItem } from "../../component/view/_common/common-sidebar";
import { ReactMotionDocumentationContainer } from "../../component/view/package/react-motion/_react-motion-documentation-container";
import { ReactMotionPlaygroundContainer } from "../../component/view/package/react-motion/_react-motion-playground-container";
import { ReactSliderDocumentationContainer } from "../../component/view/package/react-slider/_react-slider-documentation-container";
import { ReactSliderPlaygroundContainer } from "../../component/view/package/react-slider/_react-slider-playground-container";

export type PlaygroundPage = CommonMenuItem & {
  githubUrl: string;
  npmUrl: string;
  packageDescription: string;
  renderPage: () => ReactNode;
  showTableOfContents?: boolean;
};

export const PLAYGROUND_PAGES: ReadonlyArray<PlaygroundPage> = [
  {
    description: "README에서 설치 방법과 사용법을 확인합니다.",
    exampleId: "react-slider-documentation",
    exampleLabel: "Documentation",
    githubUrl:
      "https://github.com/frograms/bistro-house/tree/master/packages/react-slider#readme",
    isDocumentation: true,
    npmUrl: "https://www.npmjs.com/package/@watcha-authentic/react-slider",
    packageDescription:
      "루프 이동, 드래그, 키보드 조작을 지원하는 React 슬라이더 컴포넌트입니다.",
    packageLabel: "React Slider",
    packageName: "@watcha-authentic/react-slider",
    path: "/react-slider",
    renderPage: () => <ReactSliderDocumentationContainer />,
    showTableOfContents: true,
  },
  {
    description: "현재 아이템 한 개만 보여주는 기본 구성을 확인합니다.",
    exampleId: "react-slider-single",
    exampleLabel: "예제 - 기본",
    githubUrl:
      "https://github.com/frograms/bistro-house/tree/master/packages/react-slider#readme",
    npmUrl: "https://www.npmjs.com/package/@watcha-authentic/react-slider",
    packageDescription:
      "루프 이동, 드래그, 키보드 조작을 지원하는 React 슬라이더 컴포넌트입니다.",
    packageLabel: "React Slider",
    packageName: "@watcha-authentic/react-slider",
    path: "/react-slider/single",
    renderPage: () => <ReactSliderPlaygroundContainer variant="single" />,
  },
  {
    description: "현재 아이템 양옆의 이전/다음 아이템을 살짝 노출합니다.",
    exampleId: "react-slider-peek",
    exampleLabel: "예제 - 양옆 아이템 노출 슬라이더",
    githubUrl:
      "https://github.com/frograms/bistro-house/tree/master/packages/react-slider#readme",
    npmUrl: "https://www.npmjs.com/package/@watcha-authentic/react-slider",
    packageDescription:
      "루프 이동, 드래그, 키보드 조작을 지원하는 React 슬라이더 컴포넌트입니다.",
    packageLabel: "React Slider",
    packageName: "@watcha-authentic/react-slider",
    path: "/react-slider/peek",
    renderPage: () => <ReactSliderPlaygroundContainer variant="peek" />,
  },
  {
    description: "README에서 설치 방법과 사용법을 확인합니다.",
    exampleId: "react-motion-documentation",
    exampleLabel: "Documentation",
    githubUrl:
      "https://github.com/frograms/bistro-house/tree/master/packages/react-motion#readme",
    isDocumentation: true,
    npmUrl: "https://www.npmjs.com/package/@watcha-authentic/react-motion",
    packageDescription:
      "포인터 이동과 드래그 상태를 다루는 React 제스처 훅입니다.",
    packageLabel: "React Motion",
    packageName: "@watcha-authentic/react-motion",
    path: "/react-motion",
    renderPage: () => <ReactMotionDocumentationContainer />,
    showTableOfContents: true,
  },
  {
    description: "포인터 이동 값과 드래그 상태를 확인합니다.",
    exampleId: "react-motion-pointer",
    exampleLabel: "예제 - 포인터 드래그",
    githubUrl:
      "https://github.com/frograms/bistro-house/tree/master/packages/react-motion#readme",
    npmUrl: "https://www.npmjs.com/package/@watcha-authentic/react-motion",
    packageDescription:
      "포인터 이동과 드래그 상태를 다루는 React 제스처 훅입니다.",
    packageLabel: "React Motion",
    packageName: "@watcha-authentic/react-motion",
    path: "/react-motion/pointer",
    renderPage: () => <ReactMotionPlaygroundContainer variant="pointer" />,
  },
  {
    description: "문서 전역 포인터 이벤트로 이어지는 드래그 흐름을 확인합니다.",
    exampleId: "react-motion-global",
    exampleLabel: "예제 - 전역 포인터 드래그",
    githubUrl:
      "https://github.com/frograms/bistro-house/tree/master/packages/react-motion#readme",
    npmUrl: "https://www.npmjs.com/package/@watcha-authentic/react-motion",
    packageDescription:
      "포인터 이동과 드래그 상태를 다루는 React 제스처 훅입니다.",
    packageLabel: "React Motion",
    packageName: "@watcha-authentic/react-motion",
    path: "/react-motion/global",
    renderPage: () => <ReactMotionPlaygroundContainer variant="global" />,
  },
];
