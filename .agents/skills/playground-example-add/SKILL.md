---
name: playground-example-add
description: >-
  Add or update interactive examples in apps/playground following
  docs/PLAYGROUND_EXAMPLE_GUIDE.md. Use when adding playground examples,
  registering package routes/menus, creating documentation containers, or
  wiring menu-info-config and playground-routes.
---

# Playground Example Add

`apps/playground`에 패키지 문서·동작 예제를 추가·갱신할 때 사용한다.

### 가이드 vs 이 스킬

| | **`docs/PLAYGROUND_EXAMPLE_GUIDE.md`** | **이 스킬** |
| --- | --- | --- |
| 담는 것 | 형식·규칙·기획 표·§1~5·옵션 노출·E2E 구현 요건 | 작업 절차·E2E 실행·stage 비주얼·자가점검·완료 보고 |
| 자가점검 | 규칙 자체 (옵션 노출, CommonNote, slug 등) | 가이드 준수 여부 + stage 비주얼 + E2E 실행 |

형식·블록 규칙은 **가이드만** 읽고 따른다. 아래는 가이드에 없는 **절차·stage 비주얼**만 정의한다.

## 작업 전 필수 읽기

1. **`docs/PLAYGROUND_EXAMPLE_GUIDE.md`** — 시나리오 선정·기획 표·§1~§5·옵션 노출·E2E 구현 요건
2. `packages/<name>/package.json`
3. `packages/<name>/src/index.ts` — 공개 export
4. 타입·hook·props 정의 파일 — **특히 훅 `useEffect` deps** (옵션 변경 반영 여부)
5. `apps/playground/src/script/config/menu-info-config.ts`, `playground-routes.tsx`
6. `apps/playground/src/component/view/package/<package-name>/` — **대상 패키지에 기존 예제가 있을 때만** route·네이밍 일관성

### 먼저 확인할 것

가이드 **시나리오 선정·예제 기획 표** 절차를 따른다.

1. 공개 API·옵션·반환·동작 중 무엇을 예시화할지 정한다.
2. route마다 **이 route만 보여 주는 것** 한 문장이 있는지 본다.
3. 문서 route만 필요한지, **복잡한 변형** 예제 route가 필요한지 본다 (가이드 § 예제 route 추가 기준 — 기본·단일 동작만이면 예제 **추가하지 않음**).

### 이 스킬에서만 지키는 것 (가이드 밖)

- `packages/<name>/README.md`를 **예제 기획 입력·수정**하지 않는다.
- 다른 패키지 예제를 **API·블록 구조 참고**로 쓰지 않는다. 가이드 **§1~§5 블록·템플릿**만 따른다.

형식·금지 패턴(slug·CommonNote·`_common`·옵션 노출 등)은 **가이드**를 따른다.

## Stage 비주얼·레이아웃 (구현 절차)

`CommonExampleStagePanel`(`stagePanel`)은 이미 핑크 그라데이션·점선 테두리 배경이다. 예제 stage는 **그 위에 데모 UI만** 올린다. 레이아웃·색·구성은 예제 `*.css.ts`·container에서만 맞춘다.

### 하지 않을 것

- stagePanel과 **같은 톤**(핑크 그라데이션·핑크 테두리)의 **바깥 카드를 안에 또** 둔다 → 이중 프레임·여백 낭비.
- 안내·상태 pill·타겟·readout을 **세로로 작은 블록 여러 개**로 쪼개 쌓는다 → 비율 깨짐.
- 영문 ALL CAPS 라벨만으로 구역을 나눈다.

### 권장 구조

1. **`stage`** (`CommonExampleStagePanel` `className`) — `display: flex`, `flexDirection: column`, `alignItems: center`, `gap`, `padding` 32~36px. 안내 → 데모 UI를 **위에서 아래로** 세로 스택.
2. **`stageGuide`** (선택) — 조작 한 줄 안내. 상단 **가운데** 정렬, `#9f1239`, 14px bold. 넓은 stage에서 단일 대상만 둘 때는 `position: absolute` 좌상단도 가능.
3. **데모 카드 1개** (`target` 등) — `background: #ffffff`, `border: 2px solid #ff8ab2`, `borderRadius` 16~20, 은은한 shadow. 포커스·클릭 대상이면 `:focus-visible`에 `rgb(255 5 88)` 링.
4. **카드 안** — 상태·제목·힌트·피드백(readout)을 **한 카드**에 통합. readout은 라벨 위·값 아래 **세로** 정렬.
5. **여러 대상**이 필요하면 흰 카드를 `stage`에서 `flex` + `gap`으로 나란히. 각 카드도 핑크 중첩 프레임 없이.

### 색 (기본 추천)

stage·데모 UI 색은 **playground Watcha 프리미티브**를 기본으로 쓴다. `_common` 패널·다른 예제와 톤이 맞고, `stagePanel` 핑크 배경 위에도 자연스럽다.

- **기본**: 아래 표 조합(핑크 포인트 + 흰 카드 + 중립 텍스트·보더).
- **보조색**이 필요하면 강조 **1~2곳** 정도만 — 전체 팔레트를 갈아엎기보다 포인트로 쓴다.
- orange 등 **완전히 다른 계열**로 stage 전체를 꾸미면 `stagePanel`·인접 예제와 어색해지기 쉽다. 특별한 이유 없으면 아래 표를 우선한다.

| 용도            | 기본값 (예)                                          |
| --------------- | ---------------------------------------------------- |
| 포인트·포커스   | `rgb(255 5 88)`, `#ff0558`                           |
| 보더·강조       | `#ff8ab2`, `rgb(255 5 88 / 0.18)`                    |
| 텍스트 강조     | `#c90045`, `#9f1239`                                 |
| 틴트 배경       | `#fff1f5`, `rgb(255 5 88 / 0.08)`                    |
| 중립            | `#ffffff`, `#6b7280`, `#e5e7eb`, `#111827`           |
| 포커스 링(soft) | `rgb(255 5 88 / 0.1)` ~ `0.28`                       |

### 구현 후 눈으로 확인

- stagePanel 배경 위에 **흰 데모 카드 1~2개**만 보이는가 (핑크 안에 핑크 없음).
- 안내 → 카드가 **세로**로 읽히는가.
- 키·상태 readout이 카드 **하단에 세로**로 정리됐는가.
- ControlPanel·StatePanel과 **정보 중복**이 과하지 않은가 (readout은 stage, API 값은 StatePanel).

## 작업 체크리스트

```
- [ ] PLAYGROUND_EXAMPLE_GUIDE.md (가이드 준수 — 자가점검 표 상단)
- [ ] 예제 기획 표 (타이틀·slug·E2E 확인 단계·Y route)
- [ ] 가이드 권장 작성 순서: menu → container → routes
- [ ] MENU_INFO path ↔ playgroundRoutes path 일치
- [ ] stage 비주얼·레이아웃 (위 §)
- [ ] 구현 자가점검 (아래 표)
- [ ] E2E 동작 확인 (dev 켜져 있을 때만)
- [ ] turbo 검증
```

## 작업 절차

1. 가이드를 읽는다 (시나리오 선정·기획 표·route·메뉴 표기·§1~§5·E2E 구현 요건).
2. `package.json` + `src/index.ts` + 타입·훅 소스에서 공개 API·옵션·반환·**훅 deps**를 파악한다.
3. **예제 기획 표**를 채우고 Y route를 확정한다 (타이틀·slug·E2E 확인 단계 포함).
4. 가이드 **권장 작성 순서**대로 §1 menu → §2·§3 container → §4 routes를 반영한다.
5. `MENU_INFO` ↔ `playgroundRoutes` path를 대조한다.
6. **Stage 비주얼·레이아웃** §대로 `*.css.ts`·container stage를 맞춘다.
7. **구현 자가점검** 표를 점검한다. 미충족 시 예제 코드를 수정한다.
8. **E2E 동작 확인** 절차를 수행한다 (dev가 **이미** 켜져 있을 때만). 불일치 시 예제 코드를 수정하고 7~8을 반복한다.
9. turbo 검증을 실행한다.

## E2E 동작 확인

turbo만으로는 조작·StatePanel 반영이 보장되지 않는다. **사용자·환경에 playground dev가 이미 켜져 있을 때만** 수행한다. 에이전트가 dev를 **직접 기동하지 않는다**.

### dev 서버 여부

1. playground dev가 **Vite 기본 포트 `5173`**에서 응답하는지 확인한다 (터미널·`http://localhost:5173/web-packages/` 등).
2. **켜져 있음** → 아래 E2E 절차 진행. base URL: `http://localhost:5173/web-packages`
3. **꺼져 있음** → `pnpm dev` 등으로 **기동하지 않는다**. E2E는 **진행하지 않는다**. 완료 보고 E2E 항목에 아래 문장을 그대로 적는다:

   > 개발서버가 꺼져있어 e2e 테스트는 진행하지 않았습니다.

### E2E 절차 (dev 켜져 있을 때만)

1. `http://localhost:5173/web-packages{route-path}` 로 각 Y route에 접속한다.
2. 기획 표 **E2E 확인 단계**를 순서대로 수행한다.
3. StatePanel·포커스·시각 변화가 기대와 일치하는지 기록한다.
4. 불일치 시 예제 코드를 수정하고 2~3을 반복한다.

브라우저 자동화 가능 시 Chrome DevTools MCP 등으로 동일 URL·시나리오를 실행해도 된다.

**금지**: dev가 꺼져 있는데 `pnpm dev`로 기동 · E2E 생략 시 완료 보고 누락

## 구현 자가점검

E2E 전·후 점검. 미충족 시 **예제 코드를 수정**한다 (가이드만 고치고 끝내지 않음).

**가이드 준수** — 아래는 가이드 해당 절을 통과했는지 확인한다.

| 점검 | 가이드 절 |
| ---- | --------- |
| 타이틀·slug·path | route·메뉴 표기, route 분할 vs 통합 금지 |
| JSX 블록 순서·생략 | §3 예제 container |
| CommonNote | CommonNote — 조작 순서·E2E 없음 |
| CommonCodeBlock | CommonCodeBlock — 맨 마지막 |
| 옵션·lifecycle | 옵션·lifecycle API 노출 (체감 / cleanup A·B) |
| E2E 구현 요건 | E2E·인터랙션 구현 요건 — 기획 표 단계·StatePanel 반영 |
| 금지 패턴 | `key` 리마운트, `instanceKey`, cleanup만 listener |

**스킬 점검** — 가이드에 없는 항목.

| 점검 | 내용 |
| ---- | ---- |
| 이벤트 리스너 | `addEventListener` / `removeEventListener` **쌍** |
| 반환 메서드·enabled | 훅이 반환하는 `{methodName}(boolean)` 등 — `useEffect`로 컨트롤 상태와 **동기화**. 필드명은 대상 훅 소스에서 확인 |
| stage | 가이드 § stage 구조 + 아래 § stage 비주얼 (이중 프레임 없음, 세로 스택, 색 기본 추천, `_common` 미수정) |
| E2E 실행 (수행 시) | `http://localhost:5173/web-packages{route-path}` |
| E2E 실행 (미수행 시) | 완료 보고에 고정 문장 포함 |

## 검증

```bash
pnpm exec turbo run test lint build typecheck --filter=playground
```

패키지 소스도 수정했다면:

```bash
pnpm validate --filter=@watcha-authentic/<package-name>
```

## 완료 보고

- 예제 기획 표 (타이틀·slug·한 문장·E2E 확인 단계)
- 예제화한 공개 API·옵션·반환 목록
- 추가·수정 route path·`exampleLabel`
- 생성·수정 파일 목록
- `MENU_INFO` ↔ `playground-routes` path 일치 여부
- 구현 자가점검 결과
- **E2E 결과** — 수행 시: dev URL·route별 단계 → 기대/실제·수정 내역 / **미수행 시**: `개발서버가 꺼져있어 e2e 테스트는 진행하지 않았습니다.`
- 검증 명령과 결과

## 규칙 변경 시

| 변경 대상 | 수정할 문서 |
| --------- | ----------- |
| 블록 순서·기획 표·route·CommonNote·옵션 노출·E2E 구현 요건 | `docs/PLAYGROUND_EXAMPLE_GUIDE.md` |
| 작업 절차·E2E 실행·stage 비주얼·자가점검·완료 보고 | 이 스킬 |
