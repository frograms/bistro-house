#!/usr/bin/env node
/**
 * angular preset(parser/writer) + git 범위로 섹션을 생성해 패키지 CHANGELOG.md에 반영합니다.
 *
 * Usage: node ./project-attachment/script/generate-package-changelog.mjs <package> <commit-sha> [--dry-run]
 *
 * - package: packages/ 하위 폴더 이름 (예: react-slider)
 * - commit-sha: git 범위 <sha>^..<sha> + packages/<package>/ (CI: GITHUB_SHA)
 * - version: package.json (publish 직후 runner 기준 patch.N)
 * - changelogPreset: lerna.json → conventional-changelog-{preset}
 */

import { createRequire } from "module";
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "../..");

const CHANGELOG_HEADER = `# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

`;

function usage() {
  console.error(
    "Usage: node generate-package-changelog.mjs <package> <commit-sha> [--dry-run]"
  );
  process.exit(1);
}

function parseArgs(argv) {
  let dryRun = false;
  const positional = [];

  for (let index = 2; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run") {
      dryRun = true;
      continue;
    }
    positional.push(argument);
  }

  const packageDirectoryName = positional[0];
  const commitSha = positional[1];
  if (!packageDirectoryName || !commitSha) {
    usage();
  }

  return { packageDirectoryName, commitSha, dryRun };
}

function gitRevisionExists(revision) {
  try {
    execFileSync("git", ["rev-parse", "--verify", `${revision}^{commit}`], {
      cwd: rootDir,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function resolveGitRawCommitsOptions(packageDirectoryName, commitSha) {
  const pathOption = `packages/${packageDirectoryName}/`;

  if (!gitRevisionExists(commitSha)) {
    console.error(`커밋을 찾을 수 없습니다: ${commitSha}`);
    process.exit(1);
  }

  const fromRevision = `${commitSha}^`;
  if (gitRevisionExists(fromRevision)) {
    return {
      path: pathOption,
      from: fromRevision,
      to: commitSha,
      format:
        "%B%n-hash-%n%H%n-gitTags-%n%d%n-committerDate-%n%ci",
    };
  }

  return {
    path: pathOption,
    to: commitSha,
    format: "%B%n-hash-%n%H%n-gitTags-%n%d%n-committerDate-%n%ci",
  };
}

function loadPackage(packageDirectoryName) {
  const packagePath = path.join(rootDir, "packages", packageDirectoryName);
  const packageJsonPath = path.join(packagePath, "package.json");

  if (!existsSync(packageJsonPath)) {
    console.error(`package.json 없음: ${packageJsonPath}`);
    process.exit(1);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  if (!packageJson.name || !packageJson.version) {
    console.error("package.json name/version 이 없습니다.");
    process.exit(1);
  }

  return { packagePath, packageJsonPath, packageJson };
}

function loadLernaConfig() {
  return JSON.parse(readFileSync(path.join(rootDir, "lerna.json"), "utf8"));
}

function resolveChangelogPreset(lernaConfig) {
  const publish = lernaConfig.command?.publish ?? {};
  const version = lernaConfig.command?.version ?? {};
  return publish.changelogPreset ?? version.changelogPreset ?? "angular";
}

function resolvePresetPackageName(presetName) {
  if (presetName.includes("conventional-changelog-")) {
    return presetName;
  }
  return `conventional-changelog-${presetName}`;
}

async function loadChangelogConfig(presetName) {
  const presetPackageName = resolvePresetPackageName(presetName);
  let loaded;
  try {
    loaded = require(presetPackageName);
  } catch (error) {
    console.error(
      `changelog preset 로드 실패: ${presetName} (${presetPackageName})`
    );
    console.error(error.message);
    process.exit(1);
  }

  const config = typeof loaded === "function" ? await loaded() : loaded;

  if (config.conventionalChangelog) {
    return { ...config.conventionalChangelog };
  }

  return { ...config };
}

function findVersionSectionIndex(content) {
  const lines = content.split("\n");
  const index = lines.findIndex((line) =>
    /^#+ (?:<small>)?(?:\[)?\d+\.\d/.test(line)
  );
  return index < 0 ? lines.length : index;
}

function writeChangelog(packagePath, section) {
  const changelogFile = path.join(packagePath, "CHANGELOG.md");
  const block = `${section.trimEnd()}\n\n`;

  if (!existsSync(changelogFile)) {
    writeFileSync(changelogFile, CHANGELOG_HEADER + block);
    return;
  }

  const existing = readFileSync(changelogFile, "utf8");
  const hasChangeLogHeader = existing.startsWith("# Change Log");

  if (!hasChangeLogHeader) {
    writeFileSync(changelogFile, CHANGELOG_HEADER + block + existing);
    return;
  }

  const lines = existing.split("\n");
  const insertAt = findVersionSectionIndex(existing);
  const before = lines.slice(0, insertAt).join("\n");
  const after = lines.slice(insertAt).join("\n");
  const prefix = before.endsWith("\n") ? before : `${before}\n`;

  writeFileSync(changelogFile, `${prefix}\n${block}${after}`);
}

async function streamToString(stream) {
  let body = "";
  for await (const chunk of stream) {
    body += chunk;
  }
  return body;
}

/** angular writer commit 줄: "* subject …" */
function hasChangelogCommitEntries(body) {
  return /^\* /m.test(body);
}

function warnNoChangelogEntries(packageDirectoryName, commitSha) {
  console.warn(
    `CHANGELOG에 기록할 conventional 커밋이 없습니다: packages/${packageDirectoryName} @ ${commitSha}`
  );
  console.warn(
    "feat/fix 등 CHANGELOG 대상 커밋이 해당 경로에 포함되는지 확인하세요."
  );
}

async function generateChangelogBody(changelogConfig, packageJson, gitRawCommitsOptions) {
  const gitRawCommits = require("git-raw-commits");
  const conventionalCommitsParser = require("conventional-commits-parser");
  const conventionalChangelogWriter = require("conventional-changelog-writer");

  const context = {
    version: packageJson.version,
    linkCompare: false,
  };

  const stream = gitRawCommits(gitRawCommitsOptions)
    .pipe(conventionalCommitsParser(changelogConfig.parserOpts ?? {}))
    .pipe(
      conventionalChangelogWriter(context, changelogConfig.writerOpts ?? {})
    );

  return streamToString(stream);
}

async function main() {
  const { packageDirectoryName, commitSha, dryRun } = parseArgs(process.argv);
  const { packagePath, packageJson } = loadPackage(packageDirectoryName);
  const gitRawCommitsOptions = resolveGitRawCommitsOptions(
    packageDirectoryName,
    commitSha
  );
  const changelogConfig = await loadChangelogConfig(
    resolveChangelogPreset(loadLernaConfig())
  );

  const body = await generateChangelogBody(
    changelogConfig,
    packageJson,
    gitRawCommitsOptions
  );
  if (!body.trim() || !hasChangelogCommitEntries(body)) {
    warnNoChangelogEntries(packageDirectoryName, commitSha);
    return;
  }

  const section = `${body.trimEnd()}\n`;

  if (dryRun) {
    process.stdout.write(section);
    return;
  }

  writeChangelog(packagePath, section);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
