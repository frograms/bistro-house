# @watcha-authentic/common-cli

bistro-house 모노레포에서 `@watcha-authentic/*` 패키지를 생성하는 CLI입니다.

## 실행

레포 루트:

```bash
pnpm --filter=@watcha-authentic/common-cli dev create-package --help
```

패키지 디렉터리 (`packages/common-cli`):

```bash
pnpm dev create-package --help
```

빌드 후 bin (배포와 동일):

```bash
pnpm --filter @watcha-authentic/common-cli exec watcha-common-cli create-package --help
```

## 패키지 타입

| 타입         | 빌드   | 용도                              |
| ------------ | ------ | --------------------------------- |
| `lib`        | tsdown | 설정/유틸 라이브러리              |
| `react`      | tsdown | React 라이브러리                  |
| `react-vite` | Vite   | Vite 라이브러리 모드 React 패키지 |

생성 템플릿에는 `@watcha-authentic/eslint-config`, `@watcha-authentic/prettier-config`(lib/react)가 포함됩니다.  
author·git url·license 보유자는 **CLI 입력** 또는 **git config**에서 가져옵니다.

## bistro-house에서 새 패키지 추가

```bash
pnpm add-package <type> <project-name> "<project-description>"
# 예: pnpm add-package lib my-pkg "My package description"
```

`project-homepage`는 `packages/<project-name>` 경로로 preset 스크립트가 자동 설정합니다.  
추가 create-package 옵션은 4번째 인자부터 전달 (`--yes`, `--without-install` 등).

## 옵션 예시

```bash
pnpm --filter=@watcha-authentic/common-cli dev create-package \
  --type react \
  --project-name my-pkg \
  --project-description "설명" \
  --dest-dir=./packages \
  --project-organization=watcha-authentic \
  --project-git-url=https://github.com/frograms/bistro-house \
  --project-homepage=https://github.com/frograms/bistro-house/tree/master/packages/my-pkg#readme \
  --author-name=web-dev-group \
  --author-email=web-dev-group@watcha.com \
  --can-publish \
  --without-install \
  --yes
```

## edge-effect / tpirates 에서 가져온 기능

- 템플릿 복사·치환, `can-publish`, post-action / post-target-action
- private registry (`--registry-url`, `--registry-alias`)
- package manager `bun` 지원, post-action 빈 command 검증

## 관련 문서

- [docs/ADDING_PACKAGE.md](../../docs/ADDING_PACKAGE.md)
