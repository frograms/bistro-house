# 패키지 종속성·빌드 가이드 (유지보수)

`@watcha-authentic/*` 패키지를 만들거나 수정할 때 **`dependencies` / `peerDependencies` / `devDependencies`를 어떻게 나누고**, **tsdown 빌드와 맞추는지** 정리한 문서입니다.  
npm에 노출되는 `packages/<name>/README.md` 형식은 [PACKAGE_README_GUIDE.md](./PACKAGE_README_GUIDE.md)를, 레지스트리·CI 절차는 [ADDING_PACKAGE.md](./ADDING_PACKAGE.md)를 참고하세요.

## 전제: tsdown 기본 동작

bistro-house의 `lib` / `react` 패키지는 **단일 entry** (`src/index.ts`)를 tsdown으로 번들합니다.

| 항목               | 기본 동작                                                          |
| ------------------ | ------------------------------------------------------------------ |
| `dependencies`     | **external** — dist에 코드를 넣지 않고 `import` / `require`로 남김 |
| `peerDependencies` | **external** — 호스트 `node_modules`에서 resolve                   |
| `devDependencies`  | 빌드·lint·typecheck 전용 — tarball·런타임과 무관                   |

즉 **dist는 “자기 코드 + external import”** 이고, 소비자가 `pnpm add` 할 때 `dependencies`는 함께 설치되고, `peerDependencies`는 호스트가 직접 맞춰 설치해야 합니다.

`skipNodeModulesBundle` 같은 별도 옵션은 쓰지 않습니다. tsdown 기본 externalization에 맡깁니다.

### platform 차이

| 템플릿  | `platform` | 용도                                                     |
| ------- | ---------- | -------------------------------------------------------- |
| `lib`   | `node`     | Node 전용 설정·유틸 (formatting·lint preset 등) |
| `react` | `neutral`  | ESM/CJS 양쪽 소비 가능한 React 라이브러리                |

## 종속성 종류별 역할

### `dependencies` (runtime)

- **항상 이 패키지와 함께 깔려야 하는** 런타임 패키지.
- `@watcha-authentic/*` 내부 패키지를 조합할 때 주로 사용합니다.
- tsdown dist에는 import만 남고, npm install 시 transitive dependency로 따라옵니다.
- README **Dependencies → Runtime dependencies**에 반드시 기재.

**넣기 좋은 경우**

- 이 패키지 API가 항상 다른 `@watcha-authentic/*` 패키지에 의존할 때
- 버전을 패키지가 통제해도 되고, 중복 설치가 문제되지 않을 때

**피하기 좋은 경우**

- 호스트가 버전을 하나만 써야 하는 경우 (React, ESLint 플러그인 등) → `peerDependencies`

### `peerDependencies` (호스트 제공)

- **소비자 프로젝트가 직접 설치**해야 하는 패키지.
- tsdown dist에서 external import로 남습니다.
- README **Dependencies → Peer dependencies**에 **“호스트에 반드시 설치”** 문구와 버전 범위를 적습니다.

**넣기 좋은 경우**

- React / React DOM (`react`, `react-dom`)
- ESLint·Prettier 플러그인처럼 **호스트 버전·싱글톤**이 중요할 때
- 선택적 피어만 쓰는 ESLint preset (`peerDependenciesMeta.optional`)

**예:** ESLint preset — 피어는 많지만 preset별로 필요한 것만 호스트가 설치. `peerDependenciesMeta.optional`로 선택 피어 표시.

### `devDependencies` (개발 전용)

- tsdown, typescript, eslint, `@types/*`, 로컬 테스트용 `react` 등.
- **publish tarball에 runtime으로 포함되지 않음** (소비자 install 대상 아님).
- 모노레포 안에서 lint/typecheck/build 돌릴 때만 사용.

## 선택 기준 (요약)

| 상황                                                             | 권장                                    |
| ---------------------------------------------------------------- | --------------------------------------- |
| React / React DOM                                                | `peerDependencies`                      |
| ESLint·PostCSS preset (호스트 toolchain)                         | `peerDependencies` (+ 필요 시 optional) |
| `@watcha-authentic/*` 내부 조합 (항상 함께 쓰는 하위 라이브러리) | `dependencies`                          |
| tsdown, eslint, prettier, `@types/*`                             | `devDependencies`                       |

README의 Dependencies 섹션은 **`package.json`과 동일한 분류·버전**을 유지합니다 ([PACKAGE_README_GUIDE](./PACKAGE_README_GUIDE.md) 원칙).

## tsdown과 `package.json` 정합성

스캐폴드 템플릿(`lib` / `react` 변형) 기준 — 패키지 루트의 `tsdown.config.mts`

```text
build: rm -rf ./dist && tsdown && pnpm build:post
```

- `clean: true`인 format(esm) pass가 dist를 비운 뒤 산출.
- 산출물: `dist/index.mjs`, `dist/index.cjs`, `dist/index.d.ts` (+ post-build CSS 등).
- `exports["."]`만 공식 entry — dist 여분 파일은 tarball에 들어가지 않도록 **clean build** 유지.

**체크**

1. `pnpm build --filter=@watcha-authentic/<name>` 후 dist import에 `@watcha-authentic/*`·peer가 **external**로 남는지
2. `dependencies` / `peerDependencies` 변경 시 README Dependencies 갱신
3. peer 추가 시 Installation 예시에 `pnpm add ... peer패키지` 포함

## 워크스페이스 내부 vs npm 소비자

| 구분                  | 모노레포 (`workspace:*`)                      | npm 소비자                |
| --------------------- | --------------------------------------------- | ------------------------- |
| `@watcha-authentic/*` | `dependencies`에 workspace 버전               | `^x.y.z` range로 install  |
| React                 | 패키지 `devDependencies` + `peerDependencies` | peer로 직접 install       |
| eslint preset 피어    | `devDependencies`에 전체 (로컬 lint)          | README 표 + `pnpm add -D` |

모노레포에서 `devDependencies`에 react·eslint를 넣는 것은 **로컬 validate**용이고, npm 사용자에게는 **peer + README**로 안내합니다.

## 자주 하는 실수

1. **React를 `dependencies`에 넣음** — 호스트와 React 인스턴스가 갈라질 수 있음 → peer로.
2. **eslint 플러그인을 dependencies에 넣음** — 호스트 ESLint 버전과 어긋남 → peer (+ optional).
3. **README와 `package.json` 불일치** — external import는 package.json 기준으로 resolve됨.
4. **tsdown에 불필요한 `skipNodeModulesBundle` / 수동 external 목록** — 기본값과 중복. 특별한 이유 없으면 템플릿 그대로.
5. **Turbo cache hit 후 dist 찌꺼기** — build 스크립트가 스킵되면 `rm -rf dist`도 안 돌아감. dist가 이상하면 `pnpm turbo run build --filter '@watcha-authentic/*' --force`로 갱신.

## 체크리스트 (PR 전)

- [ ] `dependencies` / `peerDependencies` / `devDependencies` 역할이 위 기준과 맞음
- [ ] `pnpm validate --filter=@watcha-authentic/<name>` 통과
- [ ] dist entry(`index.mjs` / `index.cjs`)만으로 import 가능, 의도한 external import 유지
- [ ] README Dependencies가 `package.json`과 일치
- [ ] `@watcha-authentic/*` chain 변경 시 downstream 패키지 버전·range 확인

## 패턴 유형 (요약)

| 유형 | `dependencies` | `peerDependencies` | tsdown·빌드 |
| ---- | -------------- | ------------------ | ----------- |
| React 조합 라이브러리 | `@watcha-authentic/*` 내부 조합 | `react`, `react-dom` | `react` 템플릿, single entry |
| ESLint / Prettier preset | 거의 없음 | 플러그인·코어 (필요 시 optional) | `lib` 템플릿 |
| 설정·유틸 lib | 없거나 최소 | 없음 | `lib` 템플릿, Node `platform` |

## 예제: internal `dependencies` + React `peerDependencies`

내부 `@watcha-authentic/*`는 **transitive install**, React는 **호스트가 직접 install** 하도록 나누는 대표 패턴입니다.  
아래 `{internal-*}`·import 이름은 **플레이스홀더** — 실제 패키지는 `package.json`·dist를 기준으로 확인합니다.

### `package.json` 분류 (예)

```json
{
  "dependencies": {
    "@watcha-authentic/{internal-a}": "^x.y.z",
    "@watcha-authentic/{internal-b}": "^x.y.z"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "devDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

| 패키지 | `package.json` | tsdown dist | 소비자 install 시 |
| ------ | -------------- | ----------- | ----------------- |
| `@watcha-authentic/{internal-*}` | `dependencies` | **external** (`import … from "@watcha-authentic/…"`) | `pnpm add {package}` 시 **함께 설치** (transitive) |
| `react`, `react-dom` | `peerDependencies` | **external** (`import … from "react"`) | 호스트가 **직접** `pnpm add react react-dom` |
| `react` (로컬 lint/typecheck) | `devDependencies` | dist에 **포함되지 않음** | tarball·런타임과 무관 |

### 빌드 후 `dist/index.mjs` (형태 예)

```js
import React, { … } from "react";
import { … } from "@watcha-authentic/{internal-a}";
import { … } from "@watcha-authentic/{internal-b}";
```

- **`@watcha-authentic/*`** — 번들에 넣지 않음. npm이 dependency tree로 **resolve**.
- **`react`** — 번들에 넣지 않음. 앱의 `node_modules/react` **한 벌**을 쓰도록 peer로 강제.

ESLint preset류는 플러그인 전부 **peer(+ optional)** 이라 dist import가 `eslint-plugin-*` 등으로만 남고, 호스트 toolchain이 **resolve**합니다.

### 의도와 다르게 보일 때

| dist에서 보이는 것                                      | 의심                                                                                           |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `react` 코드가 dist 안에 인라인됨                       | `react`가 `dependencies`에 들어갔거나 tsdown `noExternal` 등으로 번들됨                        |
| `@watcha-authentic/*` import가 없는데 소스에서 import함 | `dependencies` 누락 또는 잘못된 번들 설정                                                      |
| `dist/component/**` 등 entry 밖 파일                    | Turbo cache hit 등으로 **clean build가 안 된 잔재** — `pnpm turbo run build --force` 후 재확인 |

## 주의사항

**dist 산출물은 PR·배포 전에 반드시 직접 확인**하세요. `package.json`만 맞춰도 tsdown·Turbo cache·예전 설정 잔재 때문에 dist import가 의도와 어긋날 수 있습니다.

```bash
pnpm --filter=@watcha-authentic/<name> run build   # turbo 우회, rm -rf dist 포함
rg '^import |require\\(' packages/<name>/dist/index.mjs
npm pack --dry-run --pack-destination /tmp   # (패키지 디렉터리에서) tarball 파일 목록
```

확인 포인트:

- `dependencies` / `peerDependencies`에 있는 패키지가 dist에서 **external import**로 남는지
- 번들에 넣으면 안 되는 패키지(React, eslint 플러그인 등)가 **dist 본문에 섞이지 않았는지**
- `exports["."]` entry 외 **불필요한 dist 파일**이 없는지

현재 CI는 `validate`(build 통과)까지만 있고, **dist import ↔ `package.json` 종속성 정합성을 자동 검사하는 파이프라인은 없습니다.** 향후 스크립트 또는 CI job으로 추가하는 것을 권장합니다. 추적: [#22](https://github.com/frograms/bistro-house/issues/22).
