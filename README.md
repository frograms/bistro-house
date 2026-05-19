# bistro-house

Watcha 웹 개발에서 사용하는 `@watcha-authentic/*` npm 패키지 모노레포입니다. ESLint/Prettier 설정과 React UI·유틸을 `packages/`에서 관리하고, [npm](https://www.npmjs.com/org/watcha-authentic)으로 배포합니다. 아래는 로컬 개발, CI, 레지스트리 연동까지의 운영 흐름을 정리한 문서입니다.

## 저장소 구조

```
bistro-house/
├── apps/
│   └── playground/          # 패키지 통합 개발·확인용 앱
├── packages/                # 배포 대상 라이브러리
├── project-attachment/      # CI 스크립트, 배포 스크립트 등
└── .github/workflows/       # GitHub Actions
```

## 요구 사항

- Node.js `^22.21.1`
- pnpm `^9.9.0`

## 시작하기

```bash
pnpm install
pnpm build:packages    # packages/* 빌드
pnpm dev:playground    # playground 개발 서버
```

## 패키지

| 패키지 | 설명 |
|--------|------|
| `@watcha-authentic/eslint-config` | 공통 ESLint 설정 |
| `@watcha-authentic/prettier-config` | 공통 Prettier 설정 |
| `@watcha-authentic/react-event-callback` | 이벤트 콜백 디펜던시 유지 |
| `@watcha-authentic/react-a11y` | 접근성 유틸 |
| `@watcha-authentic/react-motion` | 포인터·제스처 모션 |
| `@watcha-authentic/react-slider` | 슬라이더 컴포넌트 |

각 패키지 상세는 `packages/<name>/README.md`를 참고하세요.

## 스크립트

| 명령 | 설명 |
|------|------|
| `pnpm dev` | turbo `dev` (워크스페이스 전체) |
| `pnpm dev:playground` | playground 개발 서버 |
| `pnpm build` | 전체 빌드 |
| `pnpm build:packages` | `@watcha-authentic/*`만 빌드 |
| `pnpm validate` | 전체 validate |
| `pnpm lint` | 전체 lint |
| `pnpm test` | 전체 test |
| `pnpm validate-targets` | `lerna changed` 기준 변경 패키지만 validate |
| `pnpm build-targets` | `lerna changed` 기준 변경 패키지만 build |
| `pnpm publish:canary <package>` | 카나리 버전 npm 배포 (로컬) |
| `pnpm format` | Prettier 포맷 |

## CI

| 워크플로 | 트리거 | 역할 |
|----------|--------|------|
| [validate.yml](.github/workflows/validate.yml) | PR | 변경된 패키지에 대해 `validate-targets` |
| [publish.yml](.github/workflows/publish.yml) | `master` push | 변경 패키지 빌드 후 Lerna로 정식 배포, GitHub Release 생성 |

## 배포

### 정식 배포 (latest)

`master`에 merge되면 [publish.yml](.github/workflows/publish.yml)이 실행됩니다.

1. `lerna changed`로 변경된 패키지만 `build-targets`
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

CI 정식 배포는 npm **Trusted Publishing (OIDC)** 로 인증합니다. 설정 절차, 로컬 배포와의 차이는 아래 Notion 문서를 따릅니다.

- **[bistro-house npm registry](https://www.notion.so/watcha/bistro-house-npm-registry-2f1a2845fc0f80c7a4c9c2c2b7907d1d)** (내부 문서)

로컬 카나리 배포는 `npm login`이 필요합니다 (`publish:canary`).

## 패키지 추가

새 `@watcha-authentic/*` 패키지를 추가하고 **CI로 npm에 배포**할 때는, 코드·스캐폴딩보다 **OIDC(Trusted Publishing) 설정을 먼저** 진행합니다.  
설정 없이 `master`에 merge하면 [publish.yml](.github/workflows/publish.yml)의 `lerna publish`가 실패할 수 있습니다.

**권장 순서**

1. **[bistro-house npm registry](https://www.notion.so/watcha/bistro-house-npm-registry-2f1a2845fc0f80c7a4c9c2c2b7907d1d)** 에 따라 npm OIDC(Trusted Publishing) 등록
2. `pnpm prepare-package` 등으로 패키지 추가, `packages/<name>/` 구성
3. [PACKAGE_README_GUIDE.md](project-attachment/context-document/PACKAGE_README_GUIDE.md)에 맞춰 `packages/<name>/README.md` 작성
4. PR에서 `validate-targets` 통과 후 `master` merge로 정식 배포

카나리만 먼저 검증할 때는 1번 이후 `pnpm publish:canary <package>` (로컬 `npm login`)를 사용할 수 있습니다.
