import type { CreatePackageType } from "../../../type/create-package";
import { askQuestion } from "../../util/cli-utils";
import {
  PACKAGE_MANAGER_VALUES,
  PACKAGE_TYPE_VALUES,
} from "./create-package-options";

/** Commander action 이 넘기는 옵션 객체 (storeOptionsAsProperties: false) */
export type CreatePackageRawOptions = {
  authorEmail?: string;
  authorName?: string;
  authorUrl?: string;
  canPublish?: boolean;
  destDir?: string;
  eslintConfig?: string;
  licenseHolder?: string;
  packageManager?: string;
  packageName?: string;
  postAction?: string;
  postTargetAction?: string;
  projectDescription?: string;
  projectGitUrl?: string;
  projectHomepage?: string;
  projectName?: string;
  projectOrganization?: string;
  registryAlias?: string;
  registryUrl?: string;
  tsconfig?: string;
  type?: string;
  withoutInstall?: boolean;
  yes?: boolean;
};

export type CreatePackageInput = {
  authorEmail: string;
  authorName: string;
  authorUrl: string;
  canPublish: boolean;
  destDir?: string;
  eslintConfig?: string;
  licenseHolder: string;
  packageManager: string;
  packageName: string;
  postAction?: string;
  postTargetAction?: string;
  projectDescription: string;
  projectGitUrl: string;
  projectHomepage?: string;
  projectName: string;
  projectOrganization: string;
  registryAlias?: string;
  registryUrl?: string;
  skipInteraction: boolean;
  tsconfig?: string;
  type: CreatePackageType;
  withoutInstall: boolean;
};

const nonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const promptOptionalString = async ({
  defaultValue,
  description,
  promptKey,
  skipInteraction,
  value,
}: {
  defaultValue?: string;
  description: string;
  promptKey: string;
  skipInteraction: boolean;
  value?: string;
}): Promise<string | undefined> => {
  if (value) return value;
  if (skipInteraction) return defaultValue;

  const measuredDefaultValue = defaultValue?.toString();
  const answer = await askQuestion({
    defaultValue: measuredDefaultValue,
    description: measuredDefaultValue
      ? `${description} (기본값: ${measuredDefaultValue})`
      : description,
    query: promptKey,
  });
  const trimmed = answer.trim();
  return trimmed.length > 0 ? trimmed : defaultValue;
};

const requireString = (
  value: string | undefined,
  label: string
): string => {
  if (!value) {
    throw new Error(`${label} 은(는) 필수입니다.`);
  }
  return value;
};

export const validateCreatePackageInput = (input: CreatePackageInput) => {
  if (!PACKAGE_TYPE_VALUES.includes(input.type)) {
    throw new Error("패키지 타입은 lib, react, react-vite 중 하나여야 합니다.");
  }

  if (
    !PACKAGE_MANAGER_VALUES.includes(
      input.packageManager as (typeof PACKAGE_MANAGER_VALUES)[number]
    )
  ) {
    throw new Error("패키지 매니저는 npm, yarn, pnpm, bun 중 하나여야 합니다.");
  }
};

export const resolveCreatePackageInput = async (
  raw: CreatePackageRawOptions
): Promise<CreatePackageInput> => {
  const skipInteraction = !!raw.yes;

  const type = nonEmptyString(raw.type);
  const projectName = nonEmptyString(raw.projectName);
  const projectDescription = nonEmptyString(raw.projectDescription);

  const packageManager = await promptOptionalString({
    defaultValue: "pnpm",
    description:
      "패키지 매니저: npm, yarn, pnpm, bun (기본 pnpm)",
    promptKey: "package-manager",
    skipInteraction,
    value: nonEmptyString(raw.packageManager),
  });

  const input: CreatePackageInput = {
    authorEmail: await promptOptionalString({
      description: "author 이메일. 미입력 시 git user.email",
      promptKey: "author-email",
      skipInteraction,
      value: nonEmptyString(raw.authorEmail),
    }) ?? "",
    authorName: await promptOptionalString({
      description:
        "author 이름. scope 가 있으면 @{scope}#{name} 형태. 미입력 시 git user.name",
      promptKey: "author-name",
      skipInteraction,
      value: nonEmptyString(raw.authorName),
    }) ?? "",
    authorUrl: await promptOptionalString({
      description: "author URL",
      promptKey: "author-url",
      skipInteraction,
      value: nonEmptyString(raw.authorUrl),
    }) ?? "",
    canPublish: !!raw.canPublish,
    destDir: await promptOptionalString({
      description: "패키지를 생성할 워크스페이스 루트 상대 경로",
      promptKey: "dest-dir",
      skipInteraction,
      value: nonEmptyString(raw.destDir),
    }),
    eslintConfig: await promptOptionalString({
      description:
        "대체 eslint 설정 파일 경로 (지정 시 템플릿 eslint 대체)",
      promptKey: "eslint-config",
      skipInteraction,
      value: nonEmptyString(raw.eslintConfig),
    }),
    licenseHolder: await promptOptionalString({
      description: "LICENSE Copyright 보유자. 미입력 시 author-name",
      promptKey: "license-holder",
      skipInteraction,
      value: nonEmptyString(raw.licenseHolder),
    }) ?? "",
    packageManager: requireString(packageManager, "package-manager"),
    packageName: await promptOptionalString({
      description:
        "npm 패키지명. 미입력 시 @{scope}/{project-name} 또는 {project-name}",
      promptKey: "package-name",
      skipInteraction,
      value: nonEmptyString(raw.packageName),
    }) ?? "",
    postAction: await promptOptionalString({
      description: "생성 후 호출 위치(cwd)에서 실행할 shell 명령",
      promptKey: "post-action",
      skipInteraction,
      value: nonEmptyString(raw.postAction),
    }),
    postTargetAction: await promptOptionalString({
      description: "생성 후 outputDir 에서 실행할 shell 명령",
      promptKey: "post-target-action",
      skipInteraction,
      value: nonEmptyString(raw.postTargetAction),
    }),
    projectDescription: requireString(projectDescription, "project-description"),
    projectGitUrl: await promptOptionalString({
      description: "Git 저장소 URL (https://github.com/org/repo)",
      promptKey: "project-git-url",
      skipInteraction,
      value: nonEmptyString(raw.projectGitUrl),
    }) ?? "",
    projectHomepage: await promptOptionalString({
      description:
        "package.json homepage. 미입력 시 project-git-url#readme 를 사용",
      promptKey: "project-homepage",
      skipInteraction,
      value: nonEmptyString(raw.projectHomepage),
    }),
    projectName: requireString(projectName, "project-name"),
    projectOrganization: await promptOptionalString({
      description: "npm scope (조직명). 예: watcha-authentic",
      promptKey: "project-organization",
      skipInteraction,
      value: nonEmptyString(raw.projectOrganization),
    }) ?? "",
    registryAlias: await promptOptionalString({
      description:
        "private 레지스트리 publishConfig 키 (--registry-url 과 함께)",
      promptKey: "registry-alias",
      skipInteraction,
      value: nonEmptyString(raw.registryAlias),
    }),
    registryUrl: await promptOptionalString({
      description: "private npm 레지스트리 URL",
      promptKey: "registry-url",
      skipInteraction,
      value: nonEmptyString(raw.registryUrl),
    }),
    skipInteraction,
    tsconfig: await promptOptionalString({
      description: "대체 tsconfig.json 경로",
      promptKey: "tsconfig",
      skipInteraction,
      value: nonEmptyString(raw.tsconfig),
    }),
    type: requireString(type, "type") as CreatePackageType,
    withoutInstall: !!raw.withoutInstall,
  };

  validateCreatePackageInput(input);
  return input;
};
