export type MenuItemInfo = {
  exampleLabel: string;
  path: string;
};

export type MenuInfo = {
  githubUrl: string;
  items: ReadonlyArray<MenuItemInfo>;
  npmUrl: string;
  packageDescription: string;
  packageLabel: string;
  packageName: string;
  path: string;
  showTableOfContents?: boolean;
};

export type PageInfo = MenuItemInfo & Omit<MenuInfo, "items">;

export const MENU_INFO: ReadonlyArray<MenuInfo> = [
  {
    githubUrl:
      "https://github.com/frograms/bistro-house/tree/master/packages/react-slider#readme",
    items: [
      {
        exampleLabel: "예제 - 기본",
        path: "/react-slider/single",
      },
      {
        exampleLabel: "예제 - 양옆 아이템 노출 슬라이더",
        path: "/react-slider/peek",
      },
      {
        exampleLabel: "예제 - transition 값 응용",
        path: "/react-slider/transition",
      },
    ],
    npmUrl: "https://www.npmjs.com/package/@watcha-authentic/react-slider",
    packageDescription:
      "루프 이동, 드래그, 키보드 조작을 지원하는 React 슬라이더 컴포넌트입니다.",
    packageLabel: "React Slider",
    packageName: "@watcha-authentic/react-slider",
    path: "/react-slider",
    showTableOfContents: true,
  },
  {
    githubUrl:
      "https://github.com/frograms/bistro-house/tree/master/packages/react-motion#readme",
    items: [
      {
        exampleLabel: "예제 - 포인터 드래그",
        path: "/react-motion/pointer",
      },
      {
        exampleLabel: "예제 - 포인터 드래그 (Global)",
        path: "/react-motion/global",
      },
    ],
    npmUrl: "https://www.npmjs.com/package/@watcha-authentic/react-motion",
    packageDescription:
      "포인터 이동과 드래그 상태를 다루는 React 제스처 훅입니다.",
    packageLabel: "React Motion",
    packageName: "@watcha-authentic/react-motion",
    path: "/react-motion",
    showTableOfContents: true,
  },
  {
    githubUrl:
      "https://github.com/frograms/bistro-house/tree/master/packages/react-stable-ref-callback#readme",
    items: [
      {
        exampleLabel: "예제 - 렌더 시 ref null 방지",
        path: "/react-stable-ref-callback/avoid-null-on-rerender",
      },
    ],
    npmUrl:
      "https://www.npmjs.com/package/@watcha-authentic/react-stable-ref-callback",
    packageDescription:
      "callback ref 참조를 고정해 리렌더 시 null 재호출·구독 리셋을 막는 React 훅",
    packageLabel: "React Stable Ref Callback",
    packageName: "@watcha-authentic/react-stable-ref-callback",
    path: "/react-stable-ref-callback",
    showTableOfContents: true,
  },
  {
    githubUrl:
      "https://github.com/frograms/bistro-house/tree/master/packages/react-http-override#readme",
    items: [
      {
        exampleLabel: "예제 - 요청 관찰과 목 응답 주입",
        path: "/react-http-override/observe-and-mock",
      },
    ],
    npmUrl:
      "https://www.npmjs.com/package/@watcha-authentic/react-http-override",
    packageDescription: "Fetch observation and error simulation devtools panel",
    packageLabel: "React Fetch Devtools",
    packageName: "@watcha-authentic/react-http-override",
    path: "/react-http-override",
    showTableOfContents: true,
  },
];

export const PAGE_INFOS = MENU_INFO.flatMap((menuInfo) => {
  const { items, ...packageInfo } = menuInfo;

  return [
    {
      ...packageInfo,
      exampleLabel: "Documentation",
    },
    ...items.map((item) => ({
      ...packageInfo,
      ...item,
      showTableOfContents: undefined,
    })),
  ];
});
