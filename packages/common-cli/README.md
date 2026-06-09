# @watcha-authentic/common-cli

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/common-cli)](https://www.npmjs.com/package/@watcha-authentic/common-cli)

bistro-house·`@watcha-authentic/*` 워크플로를 돕는 **공통 CLI**입니다. [Commands](#commands) 섹션의 커맨드를 제공합니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=common-cli)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [License](#license)
- [Contributing](#contributing)

## Dependencies

### Runtime dependencies

- `commander` — CLI 파싱
- `fs-extra` — 파일 복사·치환 등

### Peer dependencies

**없습니다.** Node.js `^24`에서 실행합니다.

## Installation

npm registry에서 바로 실행할 때:

```bash
npx @watcha-authentic/common-cli --help
# 또는
pnpm dlx @watcha-authentic/common-cli --help
```

전역 설치 후:

```bash
npm install -g @watcha-authentic/common-cli
watcha-common-cli --help
```

## Usage

```bash
watcha-common-cli <command> [options]
```

서브커맨드별 상세는 `watcha-common-cli <command> --help` 또는 [Commands](#commands)를 참고하세요.

## Commands

| Command          | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `create-package` | `@watcha-authentic/*` 패키지 템플릿 생성 (복사·치환·install) |

### create-package

```bash
npx @watcha-authentic/common-cli create-package \
  --type lib \
  --project-name my-pkg \
  --project-description "설명"
```

author·license 보유자·이메일 등은 CLI 인자 또는 **git config**(`user.name`, `user.email`)에서 가져옵니다.

#### Package types

| `--type`     | Build                        | React peer           | 설명                                                        | 예시                                   |
| ------------ | ---------------------------- | -------------------- | ----------------------------------------------------------- | -------------------------------------- |
| `lib`        | tsdown (`platform: node`)    | 없음                 | **React 없는** TypeScript 라이브러리. config·util·공통 로직 | `prettier-config`, `eslint-config`     |
| `react`      | tsdown (`platform: neutral`) | `react`, `react-dom` | React hook·컴포넌트 라이브러리                              | `react-motion`, `react-event-callback` |
| `react-vite` | Vite library mode            | `react`, `react-dom` | Vite 기반 React 패키지 (CSS·dev server 등)                  | _(아직 없음)_                          |

`lib` / `react` 템플릿에는 `@watcha-authentic/eslint-config`, `@watcha-authentic/prettier-config` 설정이 포함됩니다.

#### Options

`create-package --help`와 동일한 옵션입니다. 자주 쓰는 항목만 정리했습니다.

| Option                         | Parameter                | Required | Default                        | Description                                |
| ------------------------------ | ------------------------ | -------- | ------------------------------ | ------------------------------------------ |
| `-t, --type`                   | `<type>`                 | ✅       | —                              | `lib`, `react`, `react-vite`               |
| `--pn, --project-name`         | `<project-name>`         | ✅       | —                              | 프로젝트 폴더명 (kebab-case 권장)          |
| `--pd, --project-description`  | `<project-description>`  | ✅       | —                              | package.json `description`                 |
| `-d, --dest-dir`               | `<dest-dir>`             |          | cwd                            | 생성 루트 상대 경로 (예: `./packages`)     |
| `--po, --project-organization` | `<project-organization>` |          | —                              | npm scope (예: `watcha-authentic`)         |
| `--pkg-n, --package-name`      | `<package-name>`         |          | `{scope}/{name}` 또는 `{name}` | npm 패키지명                               |
| `--pgu, --project-git-url`     | `<project-git-url>`      |          | —                              | Git 저장소 URL                             |
| `--ph, --project-homepage`     | `<project-homepage>`     |          | `{git-url}#readme`             | package.json `homepage`                    |
| `--an, --author-name`          | `<author-name>`          |          | git `user.name`                | author 이름                                |
| `--ae, --author-email`         | `<author-email>`         |          | git `user.email`               | author 이메일                              |
| `--au, --author-url`           | `<author-url>`           |          | —                              | author URL                                 |
| `--lh, --license-holder`       | `<license-holder>`       |          | author-name                    | LICENSE Copyright                          |
| `--cp, --can-publish`          |                          |          | `false`                        | publish용 `package.json` variant           |
| `--pm, --package-manager`      | `<package-manager>`      |          | `pnpm`                         | `npm`, `yarn`, `pnpm`, `bun`               |
| `--wi, --without-install`      |                          |          | `false`                        | 생성 후 install 생략                       |
| `-y, --yes`                    |                          |          | `false`                        | 대화형 입력 생략                           |
| `--pa, --post-action`          | `<post-action>`          |          | —                              | 생성 후 cwd에서 실행할 shell               |
| `--pta, --post-target-action`  | `<post-target-action>`   |          | —                              | 생성 후 outputDir에서 실행할 shell         |
| `--ru, --registry-url`         | `<registry-url>`         |          | —                              | private registry URL                       |
| `--ra, --registry-alias`       | `<registry-alias>`       |          | —                              | publishConfig 키 (`--registry-url`과 함께) |
| `--ts, --tsconfig`             | `<tsconfig>`             |          | —                              | 템플릿 대신 쓸 tsconfig 경로               |
| `--eslint-config`              | `<eslint-config>`        |          | —                              | 템플릿 대신 쓸 eslint config 경로          |

## License

MIT

## Contributing

이슈·PR 환영합니다. [frograms/bistro-house](https://github.com/frograms/bistro-house) 저장소 기준으로 논의해 주세요.
