# 모노레po 유지보수 가이드 (Maintainer)

`@watcha-authentic/*` 패키지 **등록·개발·배포·문서화**를 담당하는 maintainer용 인덱스입니다.  
npm에서 패키지를 **소비**하는 방법은 [루트 README](../README.md)와 `packages/<name>/README.md`를 참고하세요.

## 문서 목록

| 문서                                                                                                                          | 용도                                                     |
| ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [ADDING_PACKAGE.md](./ADDING_PACKAGE.md)                                                                                      | OIDC → npm 선등록 → `packages/` 추가 → CI 배포까지 절차  |
| [PACKAGE_README_GUIDE.md](./PACKAGE_README_GUIDE.md)                                                                          | npm에 노출되는 `packages/<name>/README.md` 작성 규칙     |
| [PACKAGE_DEPS_AND_BUILD.md](./PACKAGE_DEPS_AND_BUILD.md)                                                                      | `dependencies` / `peerDependencies` · tsdown 빌드 정합성 |
| [bistro-house npm registry (Notion)](https://www.notion.so/watcha/bistro-house-npm-registry-2f1a2845fc0f80c7a4c9c2c2b7907d1d) | OIDC(Trusted Publishing), org 권한                       |

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
| `pnpm dev`                      | `build:packages` 후 playground dev     |
| `pnpm build`                    | 전체 turbo build                       |
| `pnpm build:packages`           | `@watcha-authentic/*`만 build          |
| `pnpm validate`                 | test · lint · build · typecheck        |
| `pnpm publish:canary <package>` | 카나리 npm 배포 (로컬, `npm login`)    |
| `pnpm prepare-package <name>`   | npm 레지스트리 빈 패키지 선등록 (로컬) |
| `pnpm add-package`              | 모노repo preset으로 패키지 스캐폴딩    |
| `pnpm format`                   | Prettier                               |

## CI

| 워크플로                                                | 트리거          | 역할                                       |
| ------------------------------------------------------- | --------------- | ------------------------------------------ |
| [validate-pr.yml](../.github/workflows/validate-pr.yml) | PR              | `pnpm validate`                            |
| [publish.yml](../.github/workflows/publish.yml)         | `master` push   | validate(changed) → Lerna-Lite latest 배포 |
| [publish.yml](../.github/workflows/publish.yml)         | `patch/**` push | validate(changed) → patch dist-tag 배포    |

## 배포

### 정식 (latest)

`master` merge 시 [publish.yml](../.github/workflows/publish.yml):

1. 변경 패키지 validate · build
2. `pnpm lerna publish --yes --conventional-commits --no-push`
3. 필요 시 lockfile amend · tag · GitHub Release

버전: 패키지별 independent (`lerna.json`). CLI: [Lerna-Lite](https://github.com/lerna-lite/lerna-lite) (`pnpm lerna`).

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

`publish-patch.sh` — `{version}-patch.{n}`, dist-tag `patch`, OIDC. CHANGELOG는 Lerna(latest)만 갱신.

### npm / CI 인증 (OIDC)

- 절차: [Notion — bistro-house npm registry](https://www.notion.so/watcha/bistro-house-npm-registry-2f1a2845fc0f80c7a4c9c2c2b7907d1d)
- Trusted Publisher: `frograms` / `bistro-house` / **`publish.yml`** (패키지당 1개)
- [setup-action](../.github/actions/setup-action/action.yml) `registry-url` + workflow `id-token: write`

| auth        | 용도                               |
| ----------- | ---------------------------------- |
| `npm-oidc`  | GitHub Actions (Trusted Publisher) |
| `npm login` | 로컬 canary · `prepare-package`    |

## 패키지 추가·개발 체크

1. [ADDING_PACKAGE.md](./ADDING_PACKAGE.md) — OIDC · `prepare-package` · PR
2. [PACKAGE_README_GUIDE.md](./PACKAGE_README_GUIDE.md) — 외부 README
3. [PACKAGE_DEPS_AND_BUILD.md](./PACKAGE_DEPS_AND_BUILD.md) — deps / peer / tsdown
4. `pnpm validate --filter=@watcha-authentic/<name>`

## dist · Turbo cache

`build` 스크립트는 `rm -rf dist && tsdown`이지만, turbo **cache hit** 시 스크립트가 스킵되어 예전 dist가 남을 수 있습니다. dist가 이상하면:

```bash
pnpm turbo run build --filter '@watcha-authentic/*' --force
```

배포 직전 빌드는 [build-targets.sh](../project-attachment/script/target/build-targets.sh) 경로(turbo)를 타므로, publish job에서 cache 무시 또는 `--force` 검토 대상입니다.
