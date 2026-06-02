# bistro-house

Watcha 웹 개발에서 사용하는 `@watcha-authentic/*` npm 패키지 모노레포입니다. ESLint/Prettier 설정과 React UI·유틸을 `packages/`에서 관리하고, [npm](https://www.npmjs.com/org/watcha-authentic)으로 배포합니다. 아래는 로컬 개발, CI, 레지스트리 연동까지의 운영 흐름을 정리한 문서입니다.

## 저장소 구조

```
bistro-house/
├── apps/
│   └── playground/          # 패키지 통합 개발·확인용 앱
├── packages/                # 배포 대상 라이브러리
├── project-attachment/
│   └── script/            # CI·배포 스크립트 (target/* = *-targets 스크립트)
└── .github/workflows/       # GitHub Actions
```

## 요구 사항

- Node.js `^24`
- pnpm `^9.9.0`

## 시작하기

```bash
pnpm install
pnpm build:packages    # packages/* 빌드
pnpm dev:playground    # playground 개발 서버
```

## 패키지

| 패키지                                   | 설명                      |
| ---------------------------------------- | ------------------------- |
| `@watcha-authentic/eslint-config`        | 공통 ESLint 설정          |
| `@watcha-authentic/prettier-config`      | 공통 Prettier 설정        |
| `@watcha-authentic/react-event-callback` | 이벤트 콜백 디펜던시 유지 |
| `@watcha-authentic/react-a11y`           | 접근성 유틸               |
| `@watcha-authentic/react-motion`         | 포인터·제스처 모션        |
| `@watcha-authentic/react-slider`         | 슬라이더 컴포넌트         |

각 패키지 상세는 `packages/<name>/README.md`를 참고하세요.

## 스크립트

| 명령                            | 설명                                        |
| ------------------------------- | ------------------------------------------- |
| `pnpm dev`                      | turbo `dev` (워크스페이스 전체)             |
| `pnpm dev:playground`           | playground 개발 서버                        |
| `pnpm build`                    | 전체 빌드                                   |
| `pnpm build:packages`           | `@watcha-authentic/*`만 빌드                |
| `pnpm validate`                 | 전체 validate                               |
| `pnpm lint`                     | 전체 lint                                   |
| `pnpm test`                     | 전체 test                                   |
| `pnpm publish:canary <package>` | 카나리 버전 npm 배포 (로컬)                 |
| `pnpm prepare-package <name>`   | npm 레지스트리에 빈 패키지 선등록 (로컬)    |
| `pnpm format`                   | Prettier 포맷                               |

## CI

| 워크플로                                       | 트리거          | 역할                                                                        |
| ---------------------------------------------- | --------------- | --------------------------------------------------------------------------- |
| [validate-pr.yml](.github/workflows/validate-pr.yml) | PR              | `pnpm validate` (모노레포 전체)                                             |
| [publish.yml](.github/workflows/publish.yml)   | `master` push   | preflight → validate(changed) → Lerna 배포 (`publish-latest`)               |
| [publish.yml](.github/workflows/publish.yml)   | `patch/**` push | preflight → validate(changed) → patch 배포 (`publish-patch`)                |

## 배포

### 정식 배포 (latest)

`master`에 merge되면 [publish.yml](.github/workflows/publish.yml)이 실행됩니다.

1. 변경된 패키지 검증·빌드 (`publish.yml`)
2. `lerna publish` (conventional commits)
3. 필요 시 `pnpm-lock.yaml` 커밋 후 push, 태그·GitHub Release

버전은 패키지별 independent versioning (`lerna.json`)입니다.

### 카나리 배포

기능 브랜치에서 검증용으로 npm `canary` 태그에 올릴 때 사용합니다.

```bash
npm login   # @watcha-authentic publish 권한
pnpm publish:canary react-slider
# 예: 0.1.9-canary.feature-init.0
```

설치 예:

```bash
pnpm add @watcha-authentic/react-slider@canary
# 또는 특정 카나리 버전
pnpm add @watcha-authentic/react-slider@0.1.9-canary.feature-init.0
```

### npm / CI 인증 (OIDC)

CI 배포는 npm **Trusted Publishing (OIDC)** 로 인증합니다. 설정 절차·로컬과의 차이는 아래 Notion 문서를 따릅니다.

- **[bistro-house npm registry](https://www.notion.so/watcha/bistro-house-npm-registry-2f1a2845fc0f80c7a4c9c2c2b7907d1d)** (내부 문서)

**Trusted Publisher (npm 패키지 설정)**

- 패키지당 **Trusted Publisher는 하나**이며, GitHub Actions일 때 **워크플로 파일 이름도 하나**만 등록할 수 있습니다 ([npm 문서](https://docs.npmjs.com/trusted-publishers/)).
- 등록 예: `frograms` / `bistro-house` / **`publish.yml`** — `master` 정식 배포와 `patch/**` 배포 job 모두 이 파일에서 실행됩니다.
- [setup-action](.github/actions/setup-action/action.yml)의 `registry-url` + workflow `id-token: write`가 OIDC 전제입니다.

로컬 prerelease 배포는 `pnpm publish:canary` 만 (`npm login`).

### patch 배포 (구 정식 라인, CI 전용)

`patch/**` 브랜치 push 시 [publish.yml](.github/workflows/publish.yml)의 `publish-patch` job이 `publish-patch.sh`로 변경 패키지를 `{version}-patch.{n}` 형태로 배포합니다 (dist-tag: `patch`, auth: `npm-oidc`). git tag(`@watcha-authentic/<pkg>@<version>`)·GitHub Release(`generate-notes`)까지 워크플로에서 처리합니다. CHANGELOG는 Lerna(latest)만 갱신합니다.

| `auth`     | 용도            | 요구 사항                                                                                                                             |
| ---------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `npm-oidc` | GitHub Actions  | [publish.yml](.github/workflows/publish.yml) + setup-node `registry-url` + `id-token: write`, npm Trusted Publisher **`publish.yml`** |

## 패키지 추가 (유지보수)

새 `@watcha-authentic/*` 패키지는 **OIDC 등록 → npm 이름 선등록 → `packages/` 구현 → PR/배포** 순서입니다.  
설정 없이 `master`에 merge하면 [publish.yml](.github/workflows/publish.yml)의 `lerna publish`가 실패할 수 있습니다.

**상세 절차·체크리스트·오류 대응:** [docs/ADDING_PACKAGE.md](docs/ADDING_PACKAGE.md)

**README 형식:** [docs/PACKAGE_README_GUIDE.md](docs/PACKAGE_README_GUIDE.md)

**레지스트리·OIDC (Notion):** [bistro-house npm registry](https://www.notion.so/watcha/bistro-house-npm-registry-2f1a2845fc0f80c7a4c9c2c2b7907d1d)
