# Playground 예제 추가 가이드

`apps/playground`에 패키지 문서·동작 예제 route를 추가할 때 따르는 **형식·규칙·품질 기준**입니다.  
패키지 소스 변경은 예제 추가와 별개이므로, 필요한 경우 범위를 분리해 진행합니다.

### 이 문서 vs 스킬 (관심사 분리)

| | **이 문서 (가이드)** | **스킬** (`.agents/skills/playground-example-add/SKILL.md`) |
| --- | --- | --- |
| 담는 것 | 시나리오 선정·기획 표·§1~5 템플릿·블록 순서·옵션 노출·E2E **구현 요건**·품질 기준 | 작업 절차·E2E **실행**·**stage 비주얼·레이아웃**·자가점검·완료 보고 |
| 수정 시 | 형식·규칙·템플릿 변경 | 절차·stage 비주얼·E2E 실행 정책 변경 |

에이전트는 가이드를 **단일 규칙 기준**으로 읽고, 스킬로 **순서·점검·보고**를 따릅니다. 동일 규칙을 스킬에 다시 정의하지 않습니다.

## 원칙

- **형식·규칙·품질 기준은 이 문서가 단일 기준**입니다. route 선정, 파일·경로, 블록·옵션 노출 규칙은 여기서 수정합니다. 작업 절차·stage 비주얼·E2E 실행은 스킬을 봅니다.
- playground는 **패키지 공개 API를 조작·체감**하는 용도입니다. `packages/<name>/README.md` 작성·갱신과 **별개 작업**입니다.
- `MENU_INFO.items[].path`와 `playgroundRoutes`의 `path`는 **항상 일치**해야 합니다.
- `PAGE_INFOS`는 `MENU_INFO`에서 파생되므로 **직접 수정하지 않습니다**.
- 가이드·템플릿의 `{ExportName}`·`{optionField}` 등은 **플레이스홀더**입니다. **작업 대상 패키지** `src/index.ts`·타입·훅 소스에서 채웁니다.

## 시나리오 선정 (공개 API 기준)

### 예제 기획 표 (route 추가·변경 전 필수)

`packages/<name>/src/index.ts`와 타입 정의를 읽고, **패키지 형태 판별** 후 아래 열을 채웁니다. 형태별 빈 표는 [형태별 기획 표 (작성 템플릿)](#형태별-기획-표-작성-템플릿)를 씁니다.

| 열                                | 의미                                              |
| --------------------------------- | ------------------------------------------------- |
| 예제 타이틀 (짧은 한글)           | 사이드바·문서에서 보이는 **동작 설명** (8~20자)   |
| slug                              | path 세그먼트 — 타이틀에서 도출한 kebab-case 영어 |
| 대상 공개 API·옵션·반환           | 이 route가 다루는 export·옵션·반환값              |
| 이 route만 보여 주는 것 (한 문장) | 다른 route와 구분되는 체감·동작                   |
| E2E 확인 단계                     | 사용자 조작 2~4단계 → StatePanel 기대 변화        |
| stage·target·API 맥락이 다른가?   | Y면 분리 route, N이고 옵션만 다르면 통합 후보     |
| route                             | Y / **합침** (별도 route 불필요)                  |

판정 규칙:

- **한 문장**을 쓸 수 없으면 route 후보가 아닙니다.
- **stage·target·공개 API 맥락이 같고** 차이가 옵션·반환 토글뿐이면 **별도 route 대신 한 route에 컨트롤로 통합**합니다.

route 개수는 미리 정하지 않습니다. **예제 기획 표**와 **분할·통합 규칙**으로 결정합니다.

### 패키지 형태 판별

`src/index.ts`·타입에서 공개 API를 읽고, 아래 **판별 근거**에 따라 형태를 정합니다.

| 형태            | 판별 근거 (하나라도 해당)                                            | route 구성                                                                |
| --------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **맥락 분리형** | export된 훅·컴포넌트가 **2개 이상**이고 사용 맥락·입력 방식이 다름   | 공개 API(또는 사용 맥락)마다 route                                        |
| **옵션 집약형** | 핵심 공개 API가 **하나**이고 차이는 `options` 필드·반환 메서드 토글  | 기본 동작 route + 옵션·반환을 **한 route**에 통합 (분리 시 타이틀로 구분) |
| **모드 분리형** | 핵심 API는 같고 **stage UI·레이아웃·동작 모드**가 사용자 체감상 다름 | 모드마다 route                                                            |

형태가 애매하면 기획 표에서 **「stage·target·API 맥락이 다른가?」** 열로 나눌지·합칠지 판정합니다.

옵션·반환값마다 route를 쪼개지 않습니다.

### route 후보 (YES)

아래 **하나라도** 해당하면 기획 표에 후보로 적습니다.

- stage UI·조작 방식·입력 장치가 달라진다.
- 공개 API(훅·컴포넌트) 자체가 다르다.
- 코드만으로는 체감이 어렵다 (제스처, 포커스, 애니메이션 등).
- `CommonExampleStatePanel`로 보여 줄 **공개 API** 반환값·이벤트가 있다.

### 코드·문서만 (NO)

아래는 playground **인터랙티브 UI**(ControlPanel·StatePanel·stage 조작)로 만들지 않습니다.

- ref·콜백·import·**cleanup 전용** options 필드 — **§ 옵션·lifecycle API 노출** A/B 판정 후에도 체감 경로가 없으면
- 인터랙티브로 재현하기 어렵거나 유지비만 큰 엣지 케이스
- 타입·옵션 필드 하나씩 — 공개 API 정의만으로 충분한 경우
- **기본·단일 동작** — README `Basic usage` 한 블록으로 충분하고, stage에서 체감할 **복잡한 변형**이 없음

**주의**: 타입에 `{OptionsType}`·options 필드가 있어도, **전부 컨트롤에 올릴 의무는 없습니다.** 노출 여부는 **대상 패키지** 타입·훅 소스와 § 옵션·lifecycle API 노출로 판정합니다.

### 예제 route 추가 기준 (복잡한 변형만)

playground **예제 route**는 README만으로 전달하기 어려운 **복잡한 변형**에만 추가합니다. 기본 사용법은 **문서 route**(`CommonReadme`)로 충분합니다.

| 추가함 (Y) | 추가하지 않음 (N) |
| ---------- | ----------------- |
| cleanup·언마운트·effect lifecycle을 stage에서 재현해야 함 | README `Basic usage`와 동일한 **단일 target·단일 동작** |
| 다중 target·조건부 마운트·모드 전환 등 **조합 시나리오** | 옵션·필드 **하나**만 바뀌고 체감이 README 한 줄로 설명 가능 |
| E2E 2~4단계로 **한 문장 차별점**을 재현해야 함 | 컨트롤 하나·StatePanel 숫자만 바뀌는 단순 토글 |

- **옵션·필드마다 route를 늘리지 않습니다.** 복잡한 변형은 **한 route**에 통합합니다.
- 이미 문서 route가 있으면, **기본 예제 route를 먼저 만들지 않고** 복잡한 변형이 필요할 때만 예제를 추가합니다.

### route 분할 vs 통합

**나눈다** — 기획 표에서 “stage·target·API 맥락이 다른가?”가 **Y**일 때.

- export 훅·컴포넌트가 다르다.
- 같은 API라도 stage·입력 방식·시각 모드가 달라 한 route에 넣으면 한 문장 차별점이 없다.

**합친다** — 같은 stage·target에서 **옵션·반환 API만** 바뀔 때.

- `CommonExampleControlPanel`에 넣는 옵션은 **§ 옵션·lifecycle API 노출**을 통과한 것만
- slug·타이틀은 **동작 설명**에서 도출한다

**금지** — 아래 패턴이 필요하면 설계를 다시 봅니다.

- `basic`·`options`·`advanced`처럼 **역할만 드러나는 slug·타이틀** (`예제 - 기본`, `예제 - 옵션` 등)
- 거의 같은 화면에 컨트롤 하나만 다른 route
- 리마운트(`key` 증가)·`instanceKey`로만 API 효과를 보여 주는 route

### route·메뉴 표기

**타이틀과 slug는 기획 표의 「이 route만 보여 주는 것」한 문장에서 도출합니다.** 역할 이름(`basic`, `options`)을 쓰지 않습니다.

| 항목           | 규칙                                      | 좋은 예                               | 나쁜 예                      |
| -------------- | ----------------------------------------- | ------------------------------------- | ---------------------------- |
| `exampleLabel` | `"예제 - "` + **8~20자 동작 설명** (한글) | `예제 - {동작 설명}`              | `예제 - 기본`, `예제 - 옵션` |
| slug           | kebab-case **영어**, 타이틀 의미 반영     | `{descriptive-slug}`              | `basic`, `options`           |
| path           | `/<package-name>/<slug>`                  | `/{package-name}/{descriptive-slug}` | `/{package-name}/basic`   |

- 사이드바에서 **어떤 예제인지 타이틀만 보고** 알 수 있어야 합니다.
- slug는 URL·파일명에 쓰이므로 타이틀과 **같은 의미**를 유지합니다.

### 형태별 기획 표 (작성 템플릿)

판별한 형태에 맞춰 표를 채웁니다. slug·한 문장은 **대상 패키지 공개 API**에서 도출합니다.

**맥락 분리형** — export API마다 route 후보를 적고, stage·맥락이 다르면 Y.

| 예제 타이틀 (짧은 한글) | slug       | 대상 공개 API | 이 route만 보여 주는 것 (한 문장) | E2E 확인 단계 | stage·target·API 맥락이 다른가? | route |
| ----------------------- | ---------- | ------------- | --------------------------------- | ------------- | ------------------------------- | ----- |
| `{타이틀 A}`            | `{slug-a}` | `{ExportA}`   | …                                 | …             | Y                               | Y     |
| `{타이틀 B}`            | `{slug-b}` | `{ExportB}`   | …                                 | …             | Y                               | Y     |

**옵션 집약형** — 기본 동작과 옵션 통합 후보를 표에서 판정. slug·타이틀은 동작 설명에서 도출.

| 예제 타이틀 (짧은 한글) | slug       | 대상 공개 API·옵션·반환 | 이 route만 보여 주는 것 (한 문장) | E2E 확인 단계              | stage·target·API 맥락이 다른가? | route           |
| ----------------------- | ---------- | ----------------------- | --------------------------------- | -------------------------- | ------------------------------- | --------------- |
| `{타이틀 A}`            | `{slug-a}` | `{Hook}` 기본           | …                                 | `{조작}`→`{stateField}` 변경 | —                               | Y               |
| `{타이틀 B}`            | `{slug-b}` | `{option}`, `{return}`  | 같은 target에서 옵션·반환 토글    | `{토글}`→stage·StatePanel 변화 | N                               | Y 또는 **합침** |
| `{옵션별 임시명}`       | —          | 단일 옵션만 분리        | …                                 | …                          | N (A와 동일 stage)              | **합침**        |

**모드 분리형** — 체감 모드마다 한 문장 차별점이 있을 때만 Y.

| 예제 타이틀 (짧은 한글) | slug       | 대상 공개 API·모드 | 이 route만 보여 주는 것 (한 문장) | E2E 확인 단계 | stage·target·API 맥락이 다른가? | route |
| ----------------------- | ---------- | ------------------ | --------------------------------- | ------------- | ------------------------------- | ----- |
| `{타이틀 A}`            | `{slug-a}` | `{Component}`      | …                                 | …             | Y                               | Y     |
| `{타이틀 B}`            | `{slug-b}` | `{Component}`      | …                                 | …             | Y                               | Y     |

## 수정 위치

| 역할             | 경로                                                         |
| ---------------- | ------------------------------------------------------------ |
| 메뉴·페이지 메타 | `apps/playground/src/script/config/menu-info-config.ts`      |
| route 등록       | `apps/playground/src/script/route/playground-routes.tsx`     |
| 문서/예제 UI     | `apps/playground/src/component/view/package/<package-name>/` |

## 권장 작성 순서

아래 순서로 등록·구현합니다. path는 기획 표의 slug와 맞춥니다.

| 순서 | 대상                                     | 산출물                                                  |
| ---- | ---------------------------------------- | ------------------------------------------------------- |
| 1    | `menu-info-config.ts`                    | `MenuInfo` 또는 `items[]` 항목                          |
| 2    | `_<package>-documentation-container.tsx` | 문서 route용 container (신규 패키지·문서 route 추가 시) |
| 3    | `_<package>-<example>-container.tsx`     | 예제 route용 container                                  |
| 4    | `playground-routes.tsx`                  | `withRouteComponent` route 그룹                         |
| 5    | (선택) `*.css.ts`, `_shared/`            | stage·fixture 스타일·데이터                             |

`MENU_INFO.items[].path`와 `playgroundRoutes.routes[].path`는 **항상 일치**해야 합니다.

## 1. 메뉴 등록 (`menu-info-config.ts`)

### 신규 패키지

`MENU_INFO` 배열에 객체를 추가합니다. `packageDescription`·`packageLabel`은 `package.json` `description`·폴더명과 맞춥니다.

```ts
{
  githubUrl:
    "https://github.com/frograms/bistro-house/tree/master/packages/{package-name}#readme",
  items: [
    {
      exampleLabel: "예제 - {8~20자 동작 설명}",
      path: "/{package-name}/{descriptive-slug}",
    },
  ],
  npmUrl: "https://www.npmjs.com/package/@watcha-authentic/{package-name}",
  packageDescription: "{package.json description}",
  packageLabel: "{사이드바 카드 제목}",
  packageName: "@watcha-authentic/{package-name}",
  path: "/{package-name}",
  showTableOfContents: true,
},
```

### 기존 패키지에 예제 추가

해당 `MenuInfo`의 `items`에만 항목을 추가합니다.

```ts
{
  exampleLabel: "예제 - {한글 라벨}",
  path: "/{package-name}/{slug}",
},
```

- `exampleLabel`: `"예제 - "` + 기획 표 **예제 타이틀** (역할명 금지).
- `path`: `/<package-name>/<slug>` — slug는 타이틀에서 도출한 kebab-case 영어.

## 2. 문서 container

문서 route(`/<package-name>`)는 README raw를 렌더합니다. **예제 기획 입력으로 README를 읽지 않습니다.** 아래는 playground 문서 **화면**용입니다.

- `packages/<name>/README.md`가 **존재해야** 문서 route를 등록할 수 있습니다. 없으면 예제 route만 추가하거나, README 작성을 **별도 작업**(`package-readme-guide-update`)으로 먼저 진행합니다.

### 블록 구성 (고정)

| 순서 | 블록              | 필수 |
| ---- | ----------------- | ---- |
| 1    | `CommonContainer` | Y    |
| 2    | `CommonReadme`    | Y    |

### 템플릿

```tsx
import reactFooReadme from "@packages/react-foo/README.md?raw";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import { CommonReadme } from "@playground/component/view/_common/common-readme";

export const ReactFooDocumentationContainer = () => (
  <CommonContainer>
    <CommonReadme markdown={reactFooReadme} />
  </CommonContainer>
);
```

- export 이름: `React{PascalPackage}DocumentationContainer`.

## 3. 예제 container

예제 route(`/<package-name>/<slug>`)는 패키지 공개 API를 조작·체감하는 UI입니다.

### 파일 최상단 (조건부)

| 순서 | 내용                                         | 조건                            |
| ---- | -------------------------------------------- | ------------------------------- |
| 1    | `import "@packages/{name}/src/.../*.css"`    | 패키지 CSS side effect 필요 시  |
| 2    | `@packages/{name}/src/...` — 공개 API import | 항상                            |
| 3    | `@playground/...` — 공통·로컬 스타일         | 항상                            |
| 4    | `_shared/` fixture import                    | 더미 데이터·공유 스타일 필요 시 |

- `@watcha-authentic/{name}` barrel import는 쓰지 않습니다.

### JSX 블록 구성 (고정 순서)

`CommonContainer` 안에 **아래 순서**로 쌓습니다. 생략 가능한 블록은 조건을 따릅니다.

| 순서 | 블록                        | 조건                                                                          |
| ---- | --------------------------- | ----------------------------------------------------------------------------- |
| 1    | `CommonNote`                | **패키지·API 맥락**에서 꼭 전달할 정보가 있을 때만. 없으면 **생략**           |
| 2    | `CommonExampleControlPanel` | 사용자가 **토글·입력**으로 API·옵션을 바꿀 때. 컨트롤이 없으면 **넣지 않음**  |
| 3    | `CommonExampleStagePanel`   | **항상** — 예제 무대·대상 UI                                                  |
| 4    | `CommonExampleStatePanel`   | 반환값·이벤트·옵션 상태를 **공개 API 이름**으로 보여 줄 때                    |
| 5    | `CommonCodeBlock`           | 위 예제를 **코드로 옮길 때** 핵심만 보여 줄 스니펫이 있을 때. 없으면 **생략** |

- **맥락이 다른** 기능을 탭·추가 `section`으로 한 route에 묶지 않습니다.
- `ControlPanel` + `StagePanel` + `StatePanel`을 시각적으로 묶을 때만 바깥 `section` + `*.css.ts`를 쓸 수 있습니다 (선택). `CommonCodeBlock`은 **section 바깥·맨 마지막**에 둡니다.
- stage 레이아웃은 예제 `*.css.ts`의 `stage`·자식 클래스로 맞춥니다. **`_common` stagePanel은 수정하지 않습니다.**

### CommonNote (패키지 안내)

`CommonNote`는 **패키지·공개 API 맥락**에서 예제만으로는 드러나지 않는 **중요 정보**를 짧게 적는 영역입니다.

| 쓸 때                                                        | 쓰지 않을 때                                  |
| ------------------------------------------------------------ | --------------------------------------------- |
| 이 API를 쓸 때 전제가 있다 (특정 DOM 구조, 브라우저 제약 등) | 조작 순서·E2E 확인 단계 (`1.` `2.` 번호 목록) |
| README에 없는 playground 전용 주의 한 줄                     | 컨트롤·stage 라벨로 이미 설명되는 내용        |
| 패키지 설계 의도를 한 문장으로 보조                          | 사용법 튜토리얼·긴 안내                       |

- **조작 방법·검증 시나리오**는 기획 표 **E2E 확인 단계**에만 둡니다. `CommonNote`에 넣지 않습니다.
- 항목이 없으면 `CommonNote` 블록 자체를 **렌더하지 않습니다**.

### CommonExampleStagePanel (무대 — 구조)

`CommonExampleStagePanel`(`stagePanel`)은 **공통 컴포넌트**입니다. 레이아웃이 깨지면 `_common`·`common-example-panels.css.ts`를 **수정하지 않고**, 해당 예제 container의 `*.css.ts`에서 stage **안쪽**을 맞춥니다.

공통 `stagePanel`은 `overflow: hidden`·`border-radius`가 있으므로, 자식이 가장자리에서 **잘리지 않게** 예제 전용 `stage` 클래스를 `className`으로 넘깁니다.

| 예제 `*.css.ts`            | 역할                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `stage`                    | `CommonExampleStagePanel`에 `className` — **padding**·`minHeight`·`display`·`gap` 등 무대 **안쪽** inset·배치 |
| `target`·`{aux}` 등       | stage **자식** — `minHeight`·`padding`·`boxSizing: "border-box"`로 텍스트·포커스 링이 잘리지 않게            |

- 포커스·클릭 대상: 고정 `height`만 쓰면 라벨이 잘릴 수 있으므로 `minHeight`·`padding`을 명시합니다.
- 여러 대상은 `stage`에서 `flex` + `gap`으로 배치합니다.
- stage 전용 스타일은 **해당 예제** `*.css.ts` 또는 `_shared/`에만 둡니다.

**stage 비주얼·색·데모 카드 구성**(이중 프레임 회피, 세로 스택, Watcha 프리미티브 기본 추천 등)은 스킬 **§ Stage 비주얼·레이아웃**을 봅니다.

### CommonCodeBlock (코드 스니펫)

`CommonCodeBlock`은 **맨 마지막** 블록입니다. 위에서 체험한 예제를 프로젝트에 옮길 때 참고할 **짧은 코드 스니펫**을 보여 줍니다.

| 쓸 때                                                                  | 쓰지 않을 때                            |
| ---------------------------------------------------------------------- | --------------------------------------- |
| stage·컨트롤로 보여 준 연결 방식을 import·옵션·콜백 중심으로 요약할 때 | README Usage 전체를 복사할 때           |
| 공개 API 이름·옵션 필드가 드러나는 최소 예시                           | 동작 예제와 무관한 보일러플레이트       |
| 한 route에서 **핵심 패턴 1개**만 짧게                                  | 여러 시나리오를 코드 블록으로 나열할 때 |

- `code` prop: container 파일 상단 **문자열 상수** (`const FOO_CODE_EXAMPLE = \`...\`;`) 또는 `\_shared/` fixture.
- 스니펫은 **공개 API 이름**과 예제 container 구현과 일치해야 합니다.
- README 대체가 아닙니다. playground에서 바로 복사해 쓸 **핵심 연결부**만.

```tsx
import { CommonCodeBlock } from "@playground/component/view/_common/common-code-block";

const FOO_CODE_EXAMPLE = `use{ExportName}({
  target: targetRef,
  options: { {optionField}: true },
  handler: (event) => { /* ... */ },
});`;

// CommonContainer 안 — ControlPanel·Stage·State 다음, 맨 마지막
<CommonCodeBlock code={FOO_CODE_EXAMPLE} />;
```

- 가이드의 `{ExportName}`·`{optionField}`·`{stateField}` 등은 **플레이스홀더**입니다. **대상 패키지** `src/index.ts`·타입·훅 소스의 **실제 공개 API 이름**으로 채웁니다. 가이드 예시를 그대로 복사하지 않습니다.

### ControlPanel 안 (권장)

`commonExampleControlsCss`를 사용합니다.

| 패턴      | 클래스·요소                                                       |
| --------- | ----------------------------------------------------------------- |
| 버튼 그룹 | `commonExampleControlsCss.controlGroup` + `button`                |
| 체크박스  | `commonExampleControlsCss.checkboxField` + `input[type=checkbox]` |
| 셀렉트    | `label` + `select` (필요 시 `aria-label`)                         |

### 옵션·lifecycle API 노출 (ControlPanel·StatePanel)

타입·`options`에 필드가 있어도 **전부 컨트롤로 노출하지 않습니다.**  
ControlPanel·StatePanel·stage에 올리는 것은 **사용자 조작으로 체감 가능한 API만**입니다.

| 판정            | 조건                                                                  | 처리                                                    |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| **노출**        | 토글·입력 직후 stage·StatePanel·포커스 등 **눈에 보이는 변화**가 있다 | ControlPanel + (필요 시) StatePanel                     |
| **숨김**        | StatePanel 값만 바뀌고 체감이 없다                                    | UI에서 **제거**. `CommonCodeBlock`·README로만 언급 가능 |
| **cleanup API** | 동작 시점이 effect cleanup·언마운트뿐이다 (`{cleanupOption}` 등)    | **A** 또는 **B**                                        |

**A — cleanup이 실행되게 만든다**

- stage에서 cleanup이 **실제로 일어나는 조작**을 둔다.
  - 예: 조건부 렌더로 훅을 쓰는 하위 트리 **언마운트** 버튼 → `{cleanupOption}`이 가리키는 **체감 가능한 변화**
  - 예: 훅 `useEffect` deps에 들어 있는 옵션 변경 → 이전 effect cleanup이 실행되는 흐름을 E2E에 포함
- E2E 확인 단계에「언마운트 / 옵션 변경 → stage·StatePanel 변화」를 적는다.

**B — 체감 경로를 만들 수 없으면 숨긴다**

- ControlPanel·StatePanel·stage 전용 UI에서 **해당 옵션을 빼다**.
- 별도 route를 파지 않는다 (가이드 NO).

**메서드·deps 시점 옵션** — 특정 메서드 호출·`useEffect` deps 변경 시에만 의미 있는 `{optionsField}`·반환 `{methodName}`:

- 토글 시 `{methodName}(false)` → `{methodName}(true)` 등 **재바인딩으로 체감**시키거나,
- 체감 경로를 만들 수 없으면 **숨긴다** (StatePanel에 값만 찍지 않음).

판정에 쓸 필드명·메서드명은 **대상 패키지** 타입·훅 구현에서 읽는다.

### StatePanel

- `items`: `{ label, value }[]`
- `label`: **공개 API·옵션·반환 필드명** 또는 짧은 한글 설명.
- `value`: 현재 상태 (문자열·숫자·boolean 문자열).
- `instanceKey`, remount 횟수 등 구현 디테일은 넣지 않습니다.

### 템플릿 (예제 container)

```tsx
// import { ExportName } from "@packages/react-foo/src/{path}/{module}";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import {
  CommonExampleControlPanel,
  CommonExampleStagePanel,
  CommonExampleStatePanel,
} from "@playground/component/view/_common/common-example-panels";
import { commonExampleControlsCss } from "@playground/resource/css/common/common-example-controls.css";
import { useCallback, useRef, useState } from "react";

export const ReactFooExampleContainer = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [lastEvent, setLastEvent] = useState("-");

  // 훅·핸들러 — 공개 API 이름·옵션 필드명 유지
  // use{Export}(...)

  return (
    <CommonContainer>
      {/* CommonNote — 패키지 맥락에서 꼭 필요할 때만 1문장. 없으면 생략 */}

      <CommonExampleControlPanel>
        <label className={commonExampleControlsCss.checkboxField}>
          <input
            type="checkbox"
            onChange={() => {
              /* 옵션 토글 */
            }}
          />
          <span>{"{옵션 라벨}"}</span>
        </label>
      </CommonExampleControlPanel>

      <CommonExampleStagePanel>
        {/* 패키지 컴포넌트 또는 target + 훅 결과 */}
      </CommonExampleStagePanel>

      <CommonExampleStatePanel
        items={[{ label: "{apiField}", value: lastEvent }]}
      />

      {/* CommonCodeBlock — 핵심 스니펫이 있을 때만, 맨 마지막 */}
      {/* <CommonCodeBlock code={FOO_CODE_EXAMPLE} /> */}
    </CommonContainer>
  );
};
```

- export 이름: `React{PascalPackage}{PascalSlug}Container` (예: `ReactFooExampleContainer`).
- 파일명: `_react-foo-{slug}-container.tsx` (slug와 일치).
- `CommonNote`·`CommonExampleControlPanel`·`CommonExampleStatePanel`·`CommonCodeBlock`은 **해당 route에 필요할 때만** 포함합니다. `CommonCodeBlock`은 있을 때 **항상 맨 마지막**입니다.

## 4. Route 등록 (`playground-routes.tsx`)

**§2·§3 container 파일을 만든 뒤** 등록합니다.

패키지 단위로 `withRouteComponent` 그룹을 추가하거나 기존 그룹에 route를 넣습니다.

```tsx
// 예제 container — 파일 상단 eager import
import { ReactFooExampleContainer } from "@playground/component/view/package/react-foo/_react-foo-{slug}-container";

// ...

withRouteComponent({
  AppContent: PackageAppContent,
  routes: [
    {
      lazy: async () => ({
        Component: (
          await import(
            "@playground/component/view/package/react-foo/_react-foo-documentation-container"
          )
        ).ReactFooDocumentationContainer,
      }),
      path: "/react-foo",
    },
    {
      element: <ReactFooExampleContainer />,
      path: "/react-foo/{slug}",
    },
  ],
}),
```

- 문서 route: `lazy` import.
- 예제 route: `playground-routes.tsx` **상단** eager import + `element`.
- `path`는 `MENU_INFO`와 **동일 문자열**이어야 합니다.

## 5. 파일·경로 규칙

### 디렉터리

```
apps/playground/src/component/view/package/<package-name>/
├── _<package>-documentation-container.tsx
├── _<package>-<slug>-container.tsx
├── _<package>-<slug>-container.css.ts   # 선택
└── _shared/                              # 선택 — fixture, 공유 css
```

### path

- 문서: `/<package-name>`
- 예제: `/<package-name>/<slug>`

## 예제 품질 기준

- 예제는 패키지 **공개 API**를 드러내야 합니다. HTML 패턴(role, tabIndex)만 보여 주고 훅·컴포넌트 차별점이 없으면 부족합니다.
- 조작 가능한 최소 컨트롤을 둡니다. 컨트롤이 없고 패키지 맥락 안내가 필요할 때만 `CommonNote`를 씁니다.
- **맥락이 다른** 기능을 탭·섹션으로 한 route에 묶지 않습니다. **옵션·반환 토글**은 한 route에 둘 수 있습니다.
- `CommonExampleStatePanel`에는 **조작으로 체감되는** 공개 API·옵션·반환값·이벤트만 표시합니다. 체감 없는 옵션 필드는 넣지 않습니다.
- playground 전용 패턴(리마운트 버튼, `key`로 훅 재실행)은 쓰지 않습니다. **반환 메서드·옵션 토글**로 같은 효과를 먼저 시도합니다.
- 예제의 props·옵션 이름은 `src/index.ts`·타입 정의의 **공개 API 이름**과 일치하게 씁니다.
- 더미 데이터는 예제 파일 또는 `_shared/`에 작게 둡니다.
- 임시 mock, `console.log`, 디버그 텍스트는 남기지 않습니다.

## E2E·인터랙션 구현 요건

기획 표 **E2E 확인 단계** 열의 작성 기준과, 예제가 **실제로 조작 가능**하게 만드는 규칙입니다.  
E2E **실행** 절차(dev 서버 확인·URL·생략 시 완료 보고 문장)는 **스킬**을 봅니다.

### 기획 표 E2E 열

- 조작 2~4단계 (예: `{입력}` → `{대상}` 조작 → StatePanel `{field}`가 `{기대값}`으로 변경)
- 각 단계 후 **StatePanel·시각 변화** 기대값
- 한 문장 차별점을 **재현 가능한 시나리오**로 쓸 수 없으면 route 설계를 다시 봅니다.

### 구현 요건

- E2E 단계는 **기획 표**에만 둡니다. `CommonNote`에 조작 순서·번호 목록을 넣지 않습니다.
- `CommonExampleStatePanel`은 조작·컨트롤 변경에 **즉시 또는 훅 lifecycle 후** 반영되어야 합니다.
- 입력 장치·접근성 속성이 필요한 예제: 대상 API·E2E 시나리오에서 요구될 때만 `tabIndex`·`aria-label` 등을 둡니다.
- 컨트롤 `button`에는 `type="button"`을 씁니다.
- 훅 `options`·반환 API는 **§ 옵션·lifecycle API 노출**을 따릅니다. deps·호출 시점 없이 StatePanel만 바뀌는 컨트롤은 **금지** (`key` 리마운트·`instanceKey` 우회도 금지).

## 검증

작업 후 저장소 루트에서 playground 검증을 실행합니다.

```bash
pnpm exec turbo run test lint build typecheck --filter=playground
```

패키지 **소스**도 함께 수정했다면 대상 패키지도 검증합니다.

```bash
pnpm validate --filter=@watcha-authentic/<name>
```

인터랙션·E2E **실행**은 스킬 절차를 따릅니다. 배포 base는 `/web-packages` (`apps/playground/vite.config.ts`).

## 규칙 변경 시

| 변경 대상 | 수정할 문서 |
| --------- | ----------- |
| 블록 순서·기획 표·route·CommonNote·옵션 노출·E2E 구현 요건·품질 기준 | **이 문서** |
| 작업 절차·E2E 실행·stage 비주얼·자가점검·완료 보고 | **스킬** |
