# 패키지 README 작성 가이드라인

`packages/*` README의 형식을 맞추기 위한 규칙과 복붙용 템플릿입니다.

## 원칙

- **대상 독자는 npm 등으로 패키지를 쓰는 외부 사용자**입니다. `packages/*/README.md`는 npm·GitHub에 노출되므로, 모노레포 내부 워크플로(`pnpm --filter`, `pnpm dev`, preset 스크립트, `docs/` maintainer 문서 등)는 **README에 적지 않습니다**. 내부 절차는 `docs/`(예: `ADDING_PACKAGE.md`)에 둡니다.
- **섹션 제목(`##`, 주요 `###`)은 영어**로 둡니다. GitHub 등에서 생성되는 **앵커(slug)가 영문**이 되도록 하기 위함입니다. 본문 설명은 한글로 작성해도 됩니다.
- **`package.json`의 `name`, `description`, `dependencies`, `peerDependencies`**와 내용이 어긋나지 않게 유지합니다.
- **사용 예**는 실제로 import할 수 있는 **공개 API 이름**을 기준으로 작성합니다. 존재하지 않는 API 이름을 적지 않습니다.
- 가이드·템플릿의 `{HookName}`·`{OptionsType}`·예시 블록은 **형식 샘플**입니다. 특정 패키지 API를 가정하지 않고, **작업 대상 패키지** 소스에서 이름·필드를 채웁니다.

## UX writing (한글 본문)

README는 **설치·사용 방법을 빠르게 이해**하는 문서입니다. 구현 내부(`src/index.ts`, re-export 등)보다 **사용자가 무엇을 할 수 있는지**를 먼저 씁니다.

### 톤

- **짧고 구어체에 가깝게**: “~입니다”, “~할 수 있습니다”를 기본으로 합니다.
- **독자 = 패키지를 쓰는 개발자**: “호스트 프로젝트”, “소비자”, “런타임 dependencies” 같은 내부·직역 표현은 피합니다.
- **영어 용어는 코드·공식 패키지명에만**: `react`, `peerDependencies`, `exports`처럼 그대로 두는 것은 괜찮습니다. 본문에 “디펜던시”, “노출”, “재수출”, “실행기”처럼 어색한 혼용은 쓰지 않습니다.

### 자주 쓰는 표현

| 피할 표현 | 대신 쓸 표현 |
| --------- | ------------ |
| 리액트기반 ~ | React용 ~ / React에서 ~ |
| ~을 노출합니다 | ~을 제공합니다 / import해서 쓸 수 있습니다 |
| `src/index.ts`에서 … | (문장 생략하고 Usage 예제로 바로 시작) |
| 호스트 프로젝트 | 프로젝트 / 사용하는 앱 |
| 재수출합니다 | (내부 구현 설명 생략) Watcha 공통 설정을 제공합니다 |
| 디펜던시 | 의존성 |
| 함께 내려받아지는 | 함께 설치되는 |
| Prettier 실행기 | Prettier 본체 |
| 반드시 직접 설치 | 프로젝트에 함께 설치 |

### 한 줄 설명 (제목 아래)

`package.json` `description`과 맞추되, README에서는 **한 문장으로 무엇을 해 주는지**만 적습니다.

```markdown
React용 슬라이더 컴포넌트입니다. 드래그·스와이프, 키보드 탐색, 무한 루프를 지원합니다.
```

### Dependencies 섹션

- **Runtime**: “이 패키지와 함께 설치되는 패키지” 정도로 짧게.
- **Peer**: “React와 React DOM은 프로젝트에 **함께 설치**해야 합니다.”처럼 **무엇을 왜** 설치하는지 한 줄로.

### Usage 섹션

- `src/index.ts` 경로나 export 메커니즘은 적지 않습니다.
- Usage는 **동작 예시**만 담습니다. 타입·기본값·허용값 설명은 `API`에 둡니다.

### API 섹션

- `API`는 **API 레퍼런스**입니다. Usage에 나온 항목을 포함해 공개 API 전부를 문서화합니다.
- 스펙 필드는 **테이블 우선**입니다. union·리터럴 허용값이 길면 해당 필드 아래 **불릿**으로 보조합니다.
- `## Options` 단독 섹션은 쓰지 않습니다. `options`가 **export된 타입**이면 `### {TypeName}`에 필드 테이블을 둡니다. 미export 인라인 객체만 훅 아래 `#### Options`를 씁니다.

## 권장 섹션 순서

아래 순서를 기본으로 하고, 패키지 특성에 따라 섹션을 추가·생략합니다.

| 순서 | 영문 제목 (앵커)      | 설명                                                   |
| ---- | --------------------- | ------------------------------------------------------ |
| 1    | (없음)                | `# 패키지명` + npm 뱃지 + 한 줄 설명 + **릴리즈 링크** |
| 2    | `Table of contents`   | `#table-of-contents` — 아래 주요 `##`로 점프           |
| 3    | `Dependencies`        | `#dependencies` — Runtime / Peer 하위 구분             |
| 4    | `Installation`        | `#installation` — `pnpm` 기준                          |
| 5    | `Usage`               | `#usage` — 시나리오별 동작 예시                          |
| 6    | `API`                 | `#api` — API 레퍼런스 (컴포넌트·훅·함수)                 |
| 선택 | `Exported symbols` 등 | 설정 패키지처럼 export 목록이 중요할 때                |

## 1. 제목 · 뱃지 · 설명

```markdown
# @watcha-authentic/{package-name}

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/{package-name})](https://www.npmjs.com/package/@watcha-authentic/{package-name})

{한 줄 설명 — package.json의 description과 동일하거나 확장}

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q={package-name})
```

- `{package-name}`: 스코프 뒤 이름만 (예: `react-slider`, `eslint-config`).
- 뱃지·npm 링크의 패키지 경로가 실제 배포명과 일치하는지 확인합니다.

### 릴리즈 링크

- **CHANGELOG**: Lerna(latest) 배포 시 갱신되는 `./CHANGELOG.md`를 가리킵니다.
- **GitHub Releases**: [bistro-house Releases](https://github.com/frograms/bistro-house/releases) 검색 URL입니다.
  - `q=`에는 **`@watcha-authentic/` 없이** `{package-name}`만 넣습니다. (예: `eslint-config`, `react-slider`)
  - 릴리즈 제목이 `@watcha-authentic/eslint-config@1.0.0` 형태라, 짧은 이름으로 검색해야 필터가 동작합니다.
  - `@watcha-authentic%2Feslint-config`처럼 스코프 전체를 `q=`에 넣으면 검색이 기대대로 되지 않을 수 있습니다.

## 2. 목차 (Table of contents)

실제 넣은 `##` 제목과 **앵커가 일치**하도록 링크를 적습니다.

```markdown
## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
```

- `Exported symbols` 등을 쓴 경우 목차에도 같은 영문 앵커로 추가합니다.

## 3. 종속성 (Dependencies)

반드시 **`## Dependencies`** 아래에 하위 제목을 둡니다.

### Runtime dependencies (`dependencies`)

- `package.json`의 **`dependencies`**가 있으면: **패키지명 + 버전 range**와 역할을 짧게 적습니다.
- **없으면**: “런타임 dependencies가 없다”고 명시합니다.

```markdown
### Runtime dependencies

이 패키지와 함께 설치됩니다.

- `@watcha-authentic/react-event-callback` `^1.1.7` — 키보드 핸들러 참조를 안정적으로 유지합니다.
```

### Peer dependencies (`peerDependencies`)

- **프로젝트에 반드시 설치해야 함**을 굵게 또는 문장으로 강조합니다.
- **패키지명 + peer version range**를 `package.json`과 동일하게 적습니다.

```markdown
### Peer dependencies

**React와 React DOM은 프로젝트에 함께 설치해야 합니다.**

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`
```

설정 패키지(ESLint/Prettier 등)는 피어가 많을 수 있으므로 **표 + 설치 예시 블록**으로 정리해도 됩니다.

## 4. 설치 (Installation)

패키지 설치와 peer 설치를 **분리**합니다. 한 블록에 섞지 않습니다.

````markdown
## Installation

### Install this package

```bash
pnpm add @watcha-authentic/{package-name}
```

### Install peer dependencies

```bash
pnpm add react@>=18.0.0 react-dom@>=18.0.0
```
````

- peer가 없으면 `### Install peer dependencies` 섹션은 생략합니다.
- dev 전용이면 `pnpm add -D ...` 로 맞춥니다.
- Installation 명령의 버전은 `package.json` `peerDependencies` range와 일치해야 합니다.

**bin CLI 패키지**는 호스트에 dependency로 넣기보다 `npx` / `pnpm dlx` / 전역 설치(`npm install -g`) 예시를 우선합니다. 모노레포에서의 `dev`·`exec` 실행법은 README에 넣지 않습니다.

````markdown
## Installation

```bash
npx @watcha-authentic/{package-name} --help
# 또는
pnpm dlx @watcha-authentic/{package-name} --help
```
````

## 5. 사용 예 (Usage)

Usage는 **시나리오별 동작 예시**입니다. API 스펙 설명은 `API`에 둡니다.

### 역할

| Usage | API |
| ----- | --- |
| import + 실제 사용 코드 | 파라미터·반환값·타입·기본값 |
| “이렇게 쓴다” | “이 값은 무엇인가” |
| 시나리오 1개 = 기능/상황 1개 | 공개 API 항목 전부 |

### 시나리오 선정

1. `### Basic usage`는 **항상** 포함합니다.
2. 공개 API 중 **별도 설명 가치가 있는 옵션·반환값·패턴**마다 시나리오를 추가합니다.
3. 한 시나리오에 서로 다른 기능을 섞지 않습니다.

### 블록 형식 (고정)

각 시나리오는 아래 순서를 따릅니다.

````markdown
## Usage

### Basic usage

{1~2문장: 이 예제가 보여 주는 동작}

```tsx
{실제 export 이름을 사용한 코드}
```
````

- 시나리오 제목은 **영어 `###`** (예: `With auto focus`, `Toggling keyboard handling`).
- 코드 블록 언어는 `tsx` / `js` / `json` 등 실제에 맞게 선택합니다.

## 6. API · Exported symbols

### 패키지 유형별 적용

| 유형 | API | Exported symbols |
| ---- | --- | ---------------- |
| React 컴포넌트 | **필수** — `#### Props`, 필요 시 `#### Ref methods` | — |
| React 훅 | **필수** — `#### Parameters`, `#### Returns`. options가 export 타입이면 `### {TypeName}` 추가 | export 타입 필드 테이블 |
| 설정(ESLint/Prettier) | — | **권장** — export 이름 |
| CLI(bin) | — | — |
| 유틸(함수만) | `#### Parameters`, `#### Returns` | — |

### API

`src/index.ts`와 타입 정의를 읽고 **공개 API 전부**를 문서화합니다.

### 작성 순서 (내부)

README 파일 섹션 순서와 별개로, 작성 시 아래 순서를 따릅니다.

1. `package.json` + `src/index.ts` + 타입에서 **API 목록** 추출
2. **`API` 초안** 작성 (테이블 + 필요 시 불릿 보조)
3. **`Usage` 시나리오** 작성 (`Basic usage` + 필요 시 추가)
4. Usage에 등장한 항목이 API에도 있는지 **대조**

### 반드시 포함

- 훅/함수 **인자** (`target`, `handler`, `options` …)
- **반환값** (`{methodName}`, ref 메서드 …)
- `options` **하위 필드** — export 타입이면 `### {TypeName}` 테이블. 미export 인라인 객체만 훅 아래 `#### Options` 테이블
- **기본값** (테이블 `Default` 열)
- union·리터럴 **허용 값** (테이블 Description에 짧게 + 필요 시 아래 불릿)

### 블록 형식 (고정)

- 섹션 제목: `## API`
- 공개 심볼: `### {exportName}` (훅·컴포넌트·함수·export 타입 이름)
- 훅/함수 하위: `#### Parameters` / `#### Returns`
- 컴포넌트 하위: `#### Props` / `#### Ref methods`
- export options·config 타입: `### {TypeName}` + 필드 테이블 (`Name | Type | Default | Description`)
- options가 **미export** 인라인 객체일 때만 훅/함수 아래 `#### Options` 사용
- 필드 나열: **테이블** (`Name | Type | Default | Description`)
- `Returns` 테이블은 `Default` 열 생략 (`Name | Type | Description`)
- `### Other props`처럼 여러 항목을 한 데 묶지 않습니다.
- flat `### {propName}` 나열은 쓰지 않습니다.

- `options` 하위 필드를 훅 `#### Options`와 export 타입 `###`에 **중복**하지 않습니다.

#### 훅 예시 (export options 타입)

가이드의 `{HookName}`·`{OptionsType}`·필드명은 **플레이스홀더**입니다. **작업 대상 패키지** `src/index.ts`·타입 정의의 실제 공개 API로 채웁니다.

````markdown
## API

### use{HookName}

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `{param}` | `{type}` | `{default}` | {설명} |
| `options` | `{OptionsType}` | — | 아래 `{OptionsType}` 참고 |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `{methodName}` | `{signature}` | {설명} |

### {OptionsType}

`use{HookName}`의 `options` 타입입니다.

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `{optionField}` | `{type}` | `{default}` | {설명} |

`{optionField}` 허용 값(union·리터럴일 때):

- `{valueA}` — {설명}
- `{valueB}` — {설명}
````

#### 컴포넌트 예시

````markdown
## API

### Slider

#### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `defaultIndex` | `number` | `0` | 처음 보여 줄 슬라이드 인덱스 |
| `items` | `T[]` | — | 슬라이드 아이템 배열 |
| `onIndexChange` | `(index: number, cause: Cause) => void` | — | 슬라이드 변경 시 호출 |

#### Ref methods

| Name | Description |
| ---- | ----------- |
| `doNext()` | 다음 슬라이드 |
| `doPrev()` | 이전 슬라이드 |
````

- 목차에 `API`를 추가합니다.

### 품질 기준

- Usage 예제에 등장한 prop/옵션/반환값이 API에 없으면 **미완료**입니다.
- API에 있는 공개 API가 Usage에서 한 번도 안 쓰이면, `Basic usage`에 최소 포함하거나 Usage를 추가합니다.
- `options` 하위 필드를 top-level `Parameters`와 형제 `###`로 flat 나열하지 않습니다.

### Exported symbols

- **eslint-config 타입**: `## Exported symbols` 아래에 `### Rule blocks`, `### Preset exports` 등으로 export 이름을 나열합니다.
- **서브패스 export** (`exports`에 `./style.css` 등): Dependencies 또는 Usage에서 한 줄로 안내합니다.

## 복붙용 스켈레톤

아래를 복사한 뒤 `{placeholder}`만 바꿉니다.

````markdown
# @watcha-authentic/{package-name}

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/{package-name})](https://www.npmjs.com/package/@watcha-authentic/{package-name})

{설명}

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q={package-name})

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)

## Dependencies

### Runtime dependencies

{있으면 `패키지명` `version-range` — 역할 / 없으면 없음을 명시}

### Peer dependencies

**{무엇}은 프로젝트에 함께 설치해야 합니다.**

- `{peer}` `{version-range}`

## Installation

### Install this package

```bash
pnpm add @watcha-authentic/{package-name}
```

### Install peer dependencies

```bash
pnpm add {peer}@{range} ...
```

## Usage

### Basic usage

{1~2문장: 이 예제가 보여 주는 동작}

```tsx
{code}
```

### {Another scenario}

{1~2문장}

```tsx
{code}
```

## API

### {exportName}

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `{name}` | `{type}` | `{default}` | {설명} |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `{name}` | `{type}` | {설명} |

### {OptionsTypeName}

{한 줄: 어떤 파라미터의 타입인지}

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `{name}` | `{type}` | `{default}` | {설명} |
````