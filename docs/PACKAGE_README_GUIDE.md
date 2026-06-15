# 패키지 README 작성 가이드라인

`packages/*` README의 형식을 맞추기 위한 규칙과 복붙용 템플릿입니다.

## 원칙

- **대상 독자는 npm 등으로 패키지를 쓰는 외부 사용자**입니다. `packages/*/README.md`는 npm·GitHub에 노출되므로, 모노레포 내부 워크플로(`pnpm --filter`, `pnpm dev`, preset 스크립트, `docs/` maintainer 문서 등)는 **README에 적지 않습니다**. 내부 절차는 `docs/`(예: `ADDING_PACKAGE.md`)에 둡니다.
- **섹션 제목(`##`, 주요 `###`)은 영어**로 둡니다. GitHub 등에서 생성되는 **앵커(slug)가 영문**이 되도록 하기 위함입니다. 본문 설명은 한글로 작성해도 됩니다.
- **`package.json`의 `name`, `description`, `dependencies`, `peerDependencies`**와 내용이 어긋나지 않게 유지합니다.
- **사용 예**는 `src/index.ts`(또는 실제 진입점)에서 **export되는 심볼**을 기준으로 작성합니다. 존재하지 않는 API 이름을 적지 않습니다.

## 권장 섹션 순서

아래 순서를 기본으로 하고, 패키지 특성에 따라 섹션을 추가·생략합니다.

| 순서 | 영문 제목 (앵커)      | 설명                                                   |
| ---- | --------------------- | ------------------------------------------------------ |
| 1    | (없음)                | `# 패키지명` + npm 뱃지 + 한 줄 설명 + **릴리즈 링크** |
| 2    | `Table of contents`   | `#table-of-contents` — 아래 주요 `##`로 점프           |
| 3    | `Dependencies`        | `#dependencies` — Runtime / Peer 하위 구분             |
| 4    | `Installation`        | `#installation` — `pnpm` 기준                          |
| 5    | `Usage`               | `#usage` — 하위에 시나리오별 `###` (영어)              |
| 선택 | `Main props` 등       | 컴포넌트·API 문서가 필요할 때                          |
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
```

- `Main props`, `Exported symbols` 등을 쓴 경우 목차에도 같은 영문 앵커로 추가합니다.

## 3. 종속성 (Dependencies)

반드시 **`## Dependencies`** 아래에 하위 제목을 둡니다.

### Runtime dependencies (`dependencies`)

- `package.json`의 **`dependencies`**가 있으면: 패키지 이름과 역할을 짧게 설명합니다.
- **없으면**: “런타임 `dependencies`가 없다”고 명시합니다.

### Peer dependencies (`peerDependencies`)

- **호스트 프로젝트에 반드시 설치해야 함**을 굵게 또는 문장으로 강조합니다.
- 버전은 `package.json`의 `peerDependencies`와 맞춥니다.

설정 패키지(ESLint/Prettier 등)는 피어가 많을 수 있으므로 **표 + 설치 예시 블록**으로 정리해도 됩니다.

## 4. 설치 (Installation)

라이브러리·설정 패키지:

````markdown
## Installation

```bash
pnpm add @watcha-authentic/{package-name} {필요 시 peer 패키지}
```
````

- dev 전용이면 `pnpm add -D ...` 로 맞춥니다.

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

````markdown
## Usage

{진입점에서 노출하는 API 한 줄 요약}

### Basic usage

```tsx
// 실제 export 이름 사용
```
````

- 하위 시나리오 제목도 **영어 `###`** (예: `Navigation with ref`, `Extending a preset`).
- 코드 블록 언어는 실제와 맞게 `tsx` / `js` / `json` 등 선택합니다.

## 6. 선택 섹션

- **React 컴포넌트 패키지**: 주요 props가 많으면 `## Main props` 아래에 `### propName` 형태(영문 앵커)로 정리.
- **eslint-config 타입**: `## Exported symbols` 아래에 `### Rule blocks`, `### Preset exports` 등으로 export 이름을 나열.
- **서브패스 export** (`exports`에 `./style.css` 등): Dependencies 또는 Usage에서 한 줄로 안내.

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

## Dependencies

### Runtime dependencies

{있으면 목록 / 없으면 없음을 명시}

### Peer dependencies

**호스트 프로젝트에 반드시 설치해야 합니다.**

- `{peer}` `{version-range}`

## Installation

```bash
pnpm add @watcha-authentic/{package-name}
```

## Usage

### Basic usage

```{lang}
{code}
```
````

## 참고

- 동일 규칙이 적용된 예시: `packages/react-slider/README.md`, `packages/eslint-config/README.md` 등.
