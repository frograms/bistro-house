# 모노레포 유지보수 가이드 (Maintainer)

`@watcha-authentic/*` 패키지의 **등록·개발·배포·문서화**를 맡은 maintainer용 운영 인덱스입니다.  
패키지 사용법은 [루트 README](../README.md)와 각 `packages/<name>/README.md`를 기준으로 안내합니다.

## 운영 작업별 시작점

| 작업 | 먼저 볼 문서·명령 | 완료 기준 |
| ---- | ----------------- | --------- |
| 새 패키지 추가 | [ADDING_PACKAGE.md](./ADDING_PACKAGE.md) | 레지스트리 선등록, OIDC 등록, 스캐폴딩, PR 검증 완료 |
| README 작성·수정 | [PACKAGE_README_GUIDE.md](./PACKAGE_README_GUIDE.md) | 외부 사용자 기준 Usage·Dependencies 정합성 유지 |
| 종속성·빌드 확인 | [PACKAGE_DEPS_AND_BUILD.md](./PACKAGE_DEPS_AND_BUILD.md) | `dependencies` / `peerDependencies` 분류와 dist external import 일치 |
| playground 예제 추가 | [PLAYGROUND_EXAMPLE_GUIDE.md](./PLAYGROUND_EXAMPLE_GUIDE.md) | 기능 단위 예제 route와 메뉴 정보 일치 |
| 배포·권한 확인 | [bistro-house npm registry (Notion)](https://www.notion.so/watcha/bistro-house-npm-registry-2f1a2845fc0f80c7a4c9c2c2b7907d1d) | 로컬 `npm login`과 CI OIDC 경로 구분 |

## 전제

- Node.js `^24`, pnpm `^9.9.0`
- npm **`@watcha-authentic` org publish 권한** (로컬 배포·`prepare-package`는 `npm login`)
- CI 배포는 **OIDC** (`npm login` 아님)

## 저장소 구조 (운영)

```
bistro-house/
├── packages/                # 배포 대상
├── apps/playground/         # 통합 확인
├── project-attachment/script/   # CI·배포 스크립트
└── .github/workflows/       # validate-pr, publish
```

## 스크립트

| 명령                            | 설명                                   |
| ------------------------------- | -------------------------------------- |
| `pnpm dev`                      | 패키지 빌드 후 playground dev 실행     |
| `pnpm build`                    | 전체 turbo build                       |
| `pnpm build:packages`           | `@watcha-authentic/*` 패키지만 build   |
| `pnpm validate`                 | test · lint · build · typecheck        |
| `pnpm publish:canary <package>` | 카나리 npm 배포 (로컬, `npm login`)    |
| `pnpm prepare-package <name>`   | npm 레지스트리 빈 패키지 선등록 (로컬) |
| `pnpm add-package`              | 모노레포 프리셋으로 패키지 스캐폴딩    |
| `pnpm format`                   | Prettier                               |

## CI

| 워크플로                                                | 트리거          | 역할                                       |
| ------------------------------------------------------- | --------------- | ------------------------------------------ |
| [validate-pr.yml](../.github/workflows/validate-pr.yml) | PR              | 전체 워크스페이스 `pnpm validate`          |
| [publish.yml](../.github/workflows/publish.yml)         | `master` push   | 변경 패키지 validate → latest 배포         |
| [publish.yml](../.github/workflows/publish.yml)         | `patch/**` push | 변경 패키지 validate → patch dist-tag 배포 |

## 배포

### 정식 (latest)

`master` merge 시 [publish.yml](../.github/workflows/publish.yml)이 아래 순서로 실행됩니다.

1. 변경 패키지 validate · build
2. `pnpm lerna publish --yes --conventional-commits --no-push`
3. lockfile 보정이 있으면 release commit amend
4. tag push · GitHub Release 생성

버전은 패키지별 independent (`lerna.json`)입니다. CLI는 [Lerna-Lite](https://github.com/lerna-lite/lerna-lite) (`pnpm lerna`)를 사용합니다.

로컬 dry-run:

```bash
pnpm exec lerna changed --parseable
pnpm lerna publish --yes --conventional-commits --no-push --dry-run
```

### 카나리 (로컬)

```bash
npm login
pnpm publish:canary react-slider
# 예: 0.1.9-canary.feature-init.0
```

### patch (CI, `patch/**`)

`publish-patch.sh`가 `{version}-patch.{n}` 버전을 만들고 dist-tag `patch`로 배포합니다. CHANGELOG는 Lerna(latest) 배포에서만 갱신됩니다.

### 인증 경로

- 절차: [Notion — bistro-house npm registry](https://www.notion.so/watcha/bistro-house-npm-registry-2f1a2845fc0f80c7a4c9c2c2b7907d1d)

| 경로 | 용도 | 필요한 설정 |
| ---- | ---- | ----------- |
| `npm login` | 로컬 `prepare-package`, 로컬 canary | `@watcha-authentic` org publish 권한 계정 |
| OIDC Trusted Publishing | GitHub Actions latest/patch 배포 | 패키지별 Trusted Publisher, workflow `id-token: write` |

## 패키지 추가·개발 체크

1. [ADDING_PACKAGE.md](./ADDING_PACKAGE.md) — `prepare-package` → OIDC → `add-package` → 구현 → PR
2. [PACKAGE_README_GUIDE.md](./PACKAGE_README_GUIDE.md) — 외부 README
3. [PACKAGE_DEPS_AND_BUILD.md](./PACKAGE_DEPS_AND_BUILD.md) — deps / peer / tsdown
4. [PLAYGROUND_EXAMPLE_GUIDE.md](./PLAYGROUND_EXAMPLE_GUIDE.md) — playground 예제 추가
5. `pnpm validate --filter=@watcha-authentic/<name>`

## dist · Turbo cache

`build` 스크립트는 `rm -rf dist && tsdown`이지만, turbo **cache hit** 시 스크립트가 스킵되어 예전 dist가 남을 수 있습니다. dist가 이상하면:

```bash
pnpm turbo run build --filter '@watcha-authentic/*' --force
```

배포 직전 빌드는 [build-targets.sh](../project-attachment/script/target/build-targets.sh) 경로(turbo)를 타므로, publish job에서 cache 무시 또는 `--force` 검토 대상입니다.
