# @watcha-authentic/common-cli

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/common-cli)](https://www.npmjs.com/package/@watcha-authentic/common-cli)

몇 가지 유용한 기능을 제공하는 CLI입니다. `@watcha-authentic/*` npm 패키지 템플릿(`lib`, `react`, `react-vite`)을 복사·치환해 새 프로젝트를 만듭니다.

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
  -y \
  -t lib \
  --pn my-pkg \
  --pd "My package description" \
  -d ./packages
```

필수 옵션:

| Option | Description |
| ------ | ----------- |
| `-t, --type <type>` | `lib`, `react`, `react-vite` |
| `--pn, --project-name <name>` | 프로젝트 폴더명 (kebab-case 권장) |
| `--pd, --project-description <text>` | `package.json` `description` |

자주 쓰는 옵션:

| Option | Description |
| ------ | ----------- |
| `-d, --dest-dir <path>` | 생성 루트 (기본: cwd) |
| `--po, --project-organization <scope>` | npm scope (예: `watcha-authentic`) |
| `--pgu, --project-git-url <url>` | Git 저장소 URL |
| `--cp, --can-publish` | publish용 `package.json` variant |
| `--wi, --without-install` | 생성 후 install 생략 |
| `-y, --yes` | 대화형 입력 생략 |

전체 옵션 목록은 `create-package --help`와 동일합니다.

### Package types

| `--type` | Build | React peer | 설명 |
| -------- | ----- | ---------- | ---- |
| `lib` | tsdown (`platform: node`) | 없음 | React 없는 TypeScript 라이브러리 |
| `react` | tsdown (`platform: neutral`) | `react`, `react-dom` | React hook·컴포넌트 라이브러리 |
| `react-vite` | Vite library mode | `react`, `react-dom` | Vite 기반 React 패키지 |

`lib` / `react` 템플릿에는 `@watcha-authentic/eslint-config`, `@watcha-authentic/prettier-config` 설정이 포함됩니다.
