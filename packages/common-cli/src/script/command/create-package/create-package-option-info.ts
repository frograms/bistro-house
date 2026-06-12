import type { CreatePackageType } from "../../../type/create-package";
import { PACKAGE_LICENSE_VALUES } from "../../config/package-license-config";
import { defineOptionInfo } from "../../module/option/custom-option-utils";

export const PACKAGE_MANAGER_VALUES = ["npm", "yarn", "pnpm", "bun"] as const;
export const PACKAGE_TYPE_VALUES: CreatePackageType[] = [
  "lib",
  "react",
  "react-vite",
];

export const CREATE_PACKAGE_OPTION_INFO = defineOptionInfo({
  authorEmail: {
    description: "author 이메일. 미입력 시 git user.email",
    flags: "--ae, --author-email <author-email>",
    name: "author-email",
    type: "string",
  },
  authorName: {
    description:
      "author 이름. scope 가 있으면 @{scope}#{name} 형태. 미입력 시 git user.name",
    flags: "--an, --author-name <author-name>",
    name: "author-name",
    type: "string",
  },
  authorUrl: {
    description: "author URL",
    flags: "--au, --author-url <author-url>",
    name: "author-url",
    type: "string",
  },
  canPublish: {
    description: "배포용 package.json 템플릿 사용",
    flags: "--cp, --can-publish",
    name: "can-publish",
    type: "boolean",
  },
  destDir: {
    description: "패키지를 생성할 최종 경로 (미지정 시 {cwd}/{project-name}/)",
    flags: "-d, --dest-dir <dest-dir>",
    name: "dest-dir",
    type: "string",
  },
  eslintConfig: {
    description: "대체 eslint 설정 파일 경로 (지정 시 템플릿 eslint 대체)",
    flags: "--eslint-config <eslint-config>",
    name: "eslint-config",
    type: "string",
  },
  license: {
    choices: PACKAGE_LICENSE_VALUES,
    defaultValue: "private",
    description: `라이선스: ${PACKAGE_LICENSE_VALUES.join(", ")} (기본 private)`,
    flags: "--lic, --license <license>",
    name: "license",
    type: "string",
  },
  licenseHolder: {
    description: "LICENSE Copyright 보유자. 미입력 시 author-name",
    flags: "--lh, --license-holder <license-holder>",
    name: "license-holder",
    type: "string",
  },
  packageManager: {
    choices: PACKAGE_MANAGER_VALUES,
    defaultValue: "pnpm",
    description: "패키지 매니저: npm, yarn, pnpm, bun (기본 pnpm)",
    flags: "--pm, --package-manager <package-manager>",
    name: "package-manager",
    type: "string",
  },
  packageName: {
    description:
      "npm 패키지명. 미입력 시 @{scope}/{project-name} 또는 {project-name}",
    flags: "--pkg-n, --package-name <package-name>",
    name: "package-name",
    type: "string",
  },
  postAction: {
    description: "생성 후 호출 위치(cwd)에서 실행할 shell 명령",
    flags: "--pa, --post-action <post-action>",
    name: "post-action",
    type: "string",
  },
  postTargetAction: {
    description: "생성 후 outputDir 에서 실행할 shell 명령",
    flags: "--pta, --post-target-action <post-target-action>",
    name: "post-target-action",
    type: "string",
  },
  projectDescription: {
    description: "프로젝트 설명",
    flags: "--pd, --project-description <project-description>",
    name: "project-description",
    required: true,
    type: "string",
  },
  projectGitUrl: {
    description: "Git 저장소 URL (https://github.com/org/repo)",
    flags: "--pgu, --project-git-url <project-git-url>",
    name: "project-git-url",
    type: "string",
  },
  projectHomepage: {
    description:
      "package.json homepage. 미입력 시 project-git-url#readme 를 사용",
    flags: "--ph, --project-homepage <project-homepage>",
    name: "project-homepage",
    type: "string",
  },
  projectName: {
    description:
      "프로젝트 이름 (package.json·placeholder용, kebab-case 권장. --dest-dir 미지정 시 출력 폴더명)",
    flags: "--pn, --project-name <project-name>",
    name: "project-name",
    required: true,
    type: "string",
  },
  projectOrganization: {
    description: "npm scope (조직명). 예: watcha-authentic",
    flags: "--po, --project-organization <project-organization>",
    name: "project-organization",
    type: "string",
  },
  registryAlias: {
    description: "private 레지스트리 publishConfig 키 (--registry-url 과 함께)",
    flags: "--ra, --registry-alias <registry-alias>",
    name: "registry-alias",
    type: "string",
  },
  registryUrl: {
    description: "private npm 레지스트리 URL",
    flags: "--ru, --registry-url <registry-url>",
    name: "registry-url",
    type: "string",
  },
  tsconfig: {
    description: "대체 tsconfig.json 경로",
    flags: "--ts, --tsconfig <tsconfig>",
    name: "tsconfig",
    type: "string",
  },
  type: {
    choices: PACKAGE_TYPE_VALUES,
    description:
      "패키지 타입: lib(tsdown), react(tsdown+React), react-vite(Vite 라이브러리 모드)",
    flags: "-t, --type <type>",
    name: "type",
    required: true,
    type: "string",
  },
  withoutInstall: {
    description: "의존성 install 생략",
    flags: "--wi, --without-install",
    name: "without-install",
    type: "boolean",
  },
  yes: {
    description: "대화형 입력 생략 (필수값은 CLI 로 전달)",
    flags: "-y, --yes",
    name: "yes",
    type: "boolean",
  },
});
