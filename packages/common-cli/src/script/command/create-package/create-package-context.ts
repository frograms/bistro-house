import path from "path";

import { loadJsonFromFile } from "../../util/file-utils";
import { readGitConfig } from "../../util/git-utils";
import type { CreatePackageInput } from "./create-package-input";

export type CreatePackageContext = {
  canPublish: boolean;
  configVariables: Record<string, string>;
  eslintConfig?: string;
  executeDir: string;
  outputDir: string;
  packageManager: string;
  packageRoot: string;
  packageType: CreatePackageInput["type"];
  postAction?: string;
  postTargetAction?: string;
  projectName: string;
  registryAlias?: string;
  registryUrl?: string;
  skipInteraction: boolean;
  targetTemplateDir: string;
  tsconfig?: string;
  withoutInstall: boolean;
};

const resolveHomepage = ({
  explicitHomepage,
  projectGitUrl,
}: {
  explicitHomepage?: string;
  projectGitUrl: string;
}) => {
  if (explicitHomepage) return explicitHomepage;
  if (projectGitUrl) return `${projectGitUrl}#readme`;
  return "";
};

export const buildCreatePackageContext = (
  input: CreatePackageInput
): CreatePackageContext => {
  const authorName =
    input.authorName || readGitConfig("user.name") || "";
  const authorEmail =
    input.authorEmail || readGitConfig("user.email") || "";
  const licenseHolder = input.licenseHolder || authorName;
  const projectHomepage = resolveHomepage({
    explicitHomepage: input.projectHomepage,
    projectGitUrl: input.projectGitUrl,
  });

  const executeDir = process.env.INIT_CWD || process.cwd();
  const packageRoot = path.join(__dirname, "../../../..");
  const cliPackageJson = loadJsonFromFile<{ name: string }>(
    path.join(packageRoot, "package.json")
  );

  const configVariables: Record<string, string> = {
    "author-email": authorEmail,
    "author-name": input.projectOrganization
      ? `@${input.projectOrganization}#${authorName}`
      : authorName,
    "author-url": input.authorUrl,
    "cli-package-name": cliPackageJson.name,
    "license-holder": licenseHolder,
    "package-name":
      input.packageName ||
      (input.projectOrganization
        ? `@${input.projectOrganization}/${input.projectName}`
        : input.projectName),
    "project-description": input.projectDescription,
    "project-git-url": input.projectGitUrl,
    "project-homepage": projectHomepage,
    "project-name": input.projectName,
  };

  const targetTemplateDir = path.join(
    packageRoot,
    "project-resource/package-template",
    input.type
  );
  const outputDir = path.join(
    input.destDir ? path.join(executeDir, input.destDir) : executeDir,
    input.projectName
  );

  return {
    canPublish: input.canPublish,
    configVariables,
    eslintConfig: input.eslintConfig,
    executeDir,
    outputDir,
    packageManager: input.packageManager,
    packageRoot,
    packageType: input.type,
    postAction: input.postAction,
    postTargetAction: input.postTargetAction,
    projectName: input.projectName,
    registryAlias: input.registryAlias,
    registryUrl: input.registryUrl,
    skipInteraction: input.skipInteraction,
    targetTemplateDir,
    tsconfig: input.tsconfig,
    withoutInstall: input.withoutInstall,
  };
};
