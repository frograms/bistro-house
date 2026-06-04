import type { CreatePackageType } from "../../../type/create-package";
import type { CommandOptionDefinition } from "../../util/commander-utils";

export const PACKAGE_MANAGER_VALUES = ["npm", "yarn", "pnpm", "bun"] as const;
export const PACKAGE_TYPE_VALUES: CreatePackageType[] = [
  "lib",
  "react",
  "react-vite",
];

export const CREATE_PACKAGE_OPTION_DEFINITIONS: CommandOptionDefinition[] = [
  {
    description:
      "패키지 타입: lib(tsdown), react(tsdown+React), react-vite(Vite 라이브러리 모드)",
    flags: "-t, --type <type>",
    required: true,
  },
  {
    description: "패키지 매니저: npm, yarn, pnpm, bun (기본 pnpm)",
    flags: "--pm, --package-manager <package-manager>",
  },
  {
    description: "패키지를 생성할 워크스페이스 루트 상대 경로",
    flags: "-d, --dest-dir <dest-dir>",
  },
  {
    description: "생성 후 호출 위치(cwd)에서 실행할 shell 명령",
    flags: "--pa, --post-action <post-action>",
  },
  {
    description: "생성 후 outputDir 에서 실행할 shell 명령",
    flags: "--pta, --post-target-action <post-target-action>",
  },
  {
    description: "프로젝트 이름 (폴더명, kebab-case 권장)",
    flags: "--pn, --project-name <project-name>",
    required: true,
  },
  {
    description: "프로젝트 설명",
    flags: "--pd, --project-description <project-description>",
    required: true,
  },
  {
    description: "Git 저장소 URL (https://github.com/org/repo)",
    flags: "--pgu, --project-git-url <project-git-url>",
  },
  {
    description:
      "package.json homepage. 미입력 시 project-git-url#readme 를 사용",
    flags: "--ph, --project-homepage <project-homepage>",
  },
  {
    description:
      "npm 패키지명. 미입력 시 @{scope}/{project-name} 또는 {project-name}",
    flags: "--pkg-n, --package-name <package-name>",
  },
  {
    description: "npm scope (조직명). 예: watcha-authentic",
    flags: "--po, --project-organization <project-organization>",
  },
  {
    description:
      "author 이름. scope 가 있으면 @{scope}#{name} 형태. 미입력 시 git user.name",
    flags: "--an, --author-name <author-name>",
  },
  {
    description: "author 이메일. 미입력 시 git user.email",
    flags: "--ae, --author-email <author-email>",
  },
  {
    description: "author URL",
    flags: "--au, --author-url <author-url>",
  },
  {
    description: "LICENSE Copyright 보유자. 미입력 시 author-name",
    flags: "--lh, --license-holder <license-holder>",
  },
  {
    description:
      "private 레지스트리 publishConfig 키 (--registry-url 과 함께)",
    flags: "--ra, --registry-alias <registry-alias>",
  },
  {
    description: "private npm 레지스트리 URL",
    flags: "--ru, --registry-url <registry-url>",
  },
  {
    description: "대체 tsconfig.json 경로",
    flags: "--ts, --tsconfig <tsconfig>",
  },
  {
    description: "대체 eslint 설정 파일 경로 (지정 시 템플릿 eslint 대체)",
    flags: "--eslint-config <eslint-config>",
  },
  {
    description: "배포용 package.json 템플릿 사용",
    flags: "--cp, --can-publish",
  },
  {
    description: "의존성 install 생략",
    flags: "--wi, --without-install",
  },
  {
    description: "대화형 입력 생략 (필수값은 CLI 로 전달)",
    flags: "-y, --yes",
  },
];
