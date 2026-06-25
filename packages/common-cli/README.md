# @watcha-authentic/common-cli

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/common-cli)](https://www.npmjs.com/package/@watcha-authentic/common-cli)

몇 가지 유용한 기능을 제공하는 CLI입니다. `@watcha-authentic/*` npm 패키지 템플릿(`lib`, `react`, `react-vite`)을 복사·치환해 새 패키지를 만듭니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=common-cli)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

## Dependencies

### Runtime dependencies

- `commander` — CLI 파싱
- `fs-extra` — 파일 복사·치환

### Peer dependencies

**없습니다.** Node.js에서 `watcha-common-cli` 바이너리로 실행합니다.

## Installation

```bash
npx @watcha-authentic/common-cli --help
# 또는
pnpm dlx @watcha-authentic/common-cli --help
```

전역 설치:

```bash
npm install -g @watcha-authentic/common-cli
watcha-common-cli --help
```

## Usage

`bin` 진입점 `watcha-common-cli`로 서브커맨드를 실행합니다.

```bash
watcha-common-cli <command> [options]
```

서브커맨드별 옵션은 `watcha-common-cli <command> --help`를 참고하세요.

### Basic usage

```bash
npx @watcha-authentic/common-cli create-package --help
```

### create-package

`lib` / `react` / `react-vite` 템플릿을 대상 디렉터리에 생성합니다. author·license 보유자 등은 CLI 인자 또는 git config(`user.name`, `user.email`)에서 가져옵니다.

```bash
npx @watcha-authentic/common-cli create-package \
  --type lib \
  --project-name my-pkg \
  --project-description "My package description" \
  --yes
```

옵션 (`create-package --help`와 동일):

| Option                                 | Description                                                                            | 필수 옵션 |
| -------------------------------------- | -------------------------------------------------------------------------------------- | --------- |
| `-t, --type <type>`                    | 패키지 타입: `lib`(tsdown), `react`(tsdown+React), `react-vite`(Vite 라이브러리 모드)  | 필수      |
| `--pn, --project-name <name>`          | 프로젝트 이름 (메타·placeholder. `--dest-dir` 생략 시 폴더명)                          | 필수      |
| `--pd, --project-description <text>`   | `package.json` `description`                                                           | 필수      |
| `--ae, --author-email <email>`         | author 이메일. 미입력 시 git `user.email`                                              | 옵셔널    |
| `--an, --author-name <name>`           | author 이름. scope 있으면 `@{scope}#{name}`. 미입력 시 git `user.name`                 | 옵셔널    |
| `--au, --author-url <url>`             | author URL                                                                             | 옵셔널    |
| `--cp, --can-publish`                  | 배포용 `package.json` 템플릿 사용 (기본 `false`)                                       | 옵셔널    |
| `-d, --dest-dir <path>`                | 최종 생성 경로 (미지정 시 `{cwd}/{project-name}/`)                                     | 옵셔널    |
| `--eslint-config <path>`               | 대체 eslint 설정 파일 (지정 시 템플릿 eslint 대체)                                     | 옵셔널    |
| `--lic, --license <name>`              | `private`(기본), `mit`, `isc`, `bsd-3-clause`                                          | 옵셔널    |
| `--lh, --license-holder <name>`        | LICENSE Copyright 보유자. 미입력 시 author-name                                        | 옵셔널    |
| `--pm, --package-manager <pm>`         | `npm`, `yarn`, `pnpm`, `bun` (기본 `pnpm`)                                             | 옵셔널    |
| `--pkg-n, --package-name <name>`       | npm 패키지명. 미입력 시 `@{scope}/{project-name}` 또는 `{project-name}`                | 옵셔널    |
| `--pa, --post-action <cmd>`            | 생성 후 cwd에서 실행할 shell 명령                                                      | 옵셔널    |
| `--pta, --post-target-action <cmd>`    | 생성 후 outputDir에서 실행할 shell 명령                                                | 옵셔널    |
| `--pgu, --project-git-url <url>`       | Git 저장소 URL (`https://github.com/org/repo`)                                         | 옵셔널    |
| `--ph, --project-homepage <url>`       | `package.json` homepage. 미입력 시 `project-git-url#readme`                            | 옵셔널    |
| `--po, --project-organization <scope>` | npm scope (예: `watcha-authentic`)                                                     | 옵셔널    |
| `--rvm, --react-vite-mode <mode>` | `react-vite` 타입 전용. `sandbox`(기본, with dev app), `library-only`(library build만) | 옵셔널 |
| `--st, --style <style>` | 스타일 빌드 방식: `css`, `scss` (기본값은 `lib`/`react`는 스타일 개발에 필요한 별도 처리 없음, `react-vite`는 기본적으로 `css` 사용) | 옵셔널 |
| `--ra, --registry-alias <key>` | private 레지스트리 `publishConfig` 키 (`--registry-url`과 함께) | 옵셔널 |
| `--ru, --registry-url <url>`           | private npm 레지스트리 URL                                                             | 옵셔널    |
| `--ts, --tsconfig <path>`              | 대체 `tsconfig.json` 경로                                                              | 옵셔널    |
| `--wi, --without-install`              | 생성 후 install 생략                                                                   | 옵셔널    |
| `-y, --yes`                            | 대화형 입력 생략 (기본 `false`. 필수값은 CLI로 전달)                                   | 옵셔널    |

### Package types

| `--type`     | Build                        | React peer           | 설명                             |
| ------------ | ---------------------------- | -------------------- | -------------------------------- |
| `lib`        | tsdown (`platform: node`)    | 없음                 | React 없는 TypeScript 라이브러리 |
| `react`      | tsdown (`platform: neutral`) | `react`, `react-dom` | React hook·컴포넌트 라이브러리   |
| `react-vite` | Vite library mode            | `react`, `react-dom` | Vite 기반 React 패키지           |

`lib` / `react` 템플릿에는 `@watcha-authentic/eslint-config`, `@watcha-authentic/prettier-config` 설정이 포함됩니다.
