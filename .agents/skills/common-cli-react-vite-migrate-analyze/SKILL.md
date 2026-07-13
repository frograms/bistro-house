---
name: common-cli-react-vite-migrate-analyze
description: >-
  Analyze create-vite React+TS template diffs across Vite versions for
  common-cli react-vite, produce an actionable upgrade plan, ask whether to
  upgrade, apply on confirmation, smoke-test the scaffolded package, then
  delete temp folders. Resolves create-vite via resolve-create-vite-for-vite.
  Use when analyzing or applying Vite upgrades for common-cli, comparing
  create-vite templates, or when the user mentions react-vite migrate analyze.
---

# common-cli react-vite 마이그레이션 분석·업그레이드

`npm create vite` 공식 React+TS 보일러를 Vite 버전 구간으로 비교하고,  
`packages/common-cli` react-vite에 **바로 적용 가능한 업그레이드 요약**을 만든 뒤  
**「업그레이드할까요?」**로 확인한다. 동의하면 반영하고, **스모크 테스트로 검증**한 다음 임시 폴더를 삭제한다.

## 사전 확인

1. **from / to Vite 코어 버전**을 확정한다. 예: `8.0.16` → `8.1.4`.  
   사용자가 안 주면 워크스페이스 `vite` 락 버전을 from, npm 최신을 to로 제안한 뒤 확인한다.
2. 워크스페이스 루트(`{workspace-root}`)를 기준으로 작업한다.
3. 비교 대상은 **앱 스타터**(`create-vite`의 `react-ts`)이고, common-cli react-vite는 **라이브러리 + 선택 sandbox**다. 1:1 복붙하지 않는다.
4. 공식 create-vite diff에 **없는** 우리 전용 파일(`vitest.config.mts`, `vite-plugin-dts`, sandbox 등)과의 충돌은 diff만으로 안 보인다. 업그레이드 계획·스모크에서 반드시 잡는다.

## 체크리스트

```
- [ ] 1. Vite → create-vite 버전 해석
- [ ] 2. 임시 폴더 준비
- [ ] 3. from / to 스캐폴드
- [ ] 4. 파일별 diff 요약 (+ 우리 전용 파일 영향)
- [ ] 5. 업그레이드 가능 수준 요약 + 「업그레이드할까요?」
- [ ] 6. (예) common-cli 반영
- [ ] 7. (예) react-vite 스모크 테스트
- [ ] 8. 임시 폴더 삭제
```

## 1. Vite → create-vite 버전 해석

from / to **Vite 코어** 각각에 대해 `resolve-create-vite-for-vite` 스킬을 따른다.

- 입력: Vite 코어 버전
- 출력: best `create-vite` 버전 + 스캐폴드 한 줄
- `npm create vite@<vite코어>`를 그대로 쓰지 않는다.

사용자가 `create-vite` 버전을 이미 명시하면 그걸 우선한다.

## 2. 임시 폴더 준비

`{workspace-root}/react-vite-upgrade`를 만든다. 이미 있으면 비우거나 삭제 후 다시 만든다.

```bash
mkdir -p "{workspace-root}/react-vite-upgrade"
```

하위 폴더 이름 (Vite 코어 버전 기준):

- from: `vite-from-<vite-version>` (예: `vite-from-8.0.16`)
- to: `vite-to-<vite-version>` (예: `vite-to-8.1.4`)

## 3. create-vite 스캐폴드

1단계에서 얻은 **create-vite 버전**으로 비대화형 React+TS 템플릿을 생성한다.

```bash
cd "{workspace-root}/react-vite-upgrade"

# from — <create-vite-from> 은 resolve-create-vite-for-vite 결과
npm create vite@<create-vite-from> vite-from-<vite-from> -- --template react-ts

# to
npm create vite@<create-vite-to> vite-to-<vite-to> -- --template react-ts
```

- `node_modules` 설치는 비교에 필수가 아니면 생략한다.
- 생성 후 각 `package.json`의 `vite` range가 목표 Vite 구간에 맞는지 확인한다.

## 4. 파일별 비교·요약

두 트리의 텍스트 파일을 비교한다 (`diff -ru`, `git diff --no-index` 등). `node_modules`는 제외.

```markdown
## Diff 요약 (vite-from-<from> → vite-to-<to>)

### <상대경로>
- 변경: …
- 의미: …

### …
```

반드시 볼 파일:

- `package.json` (특히 `vite`, `@vitejs/plugin-react`, lint/TS 관련)
- `vite.config.ts`
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`
- `index.html`
- `src/main.tsx` 및 엔트리 주변
- eslint / oxlint 등 린트 설정 추가·삭제

바이너리·에셋 차이는 한 줄로만 적는다.

추가로, create-vite에 없어도 common-cli react-vite에 있는 파일을 **현재 템플릿과 대조**한다.

- 예: `vitest.config.mts`가 `vite.config`를 import하는데 `tsconfig.node`가 `nodenext`로 바뀌면 확장자 없는 상대 import가 깨질 수 있음
- 이런 항목은 업그레이드 계획의 **적용 예정 / 선택 / 리스크**에 명시한다

## 5. 업그레이드 요약 + 확인

diff를 분류한 뒤, **에이전트가 바로 적용할 수 있는 수준**으로 요약을 쓴다.  
경로·바꿀 값·스킵 이유를 구체적으로 적는다.

common-cli 반영 후보:

| 영역 | 경로 |
|------|------|
| 라이브러리 Vite 설정 | `packages/common-cli/project-resource/package-template/react-vite/` |
| sandbox | `packages/common-cli/project-resource/package-variant/react-vite/sandbox/` |
| 의존성 버전 | `packages/common-cli/src/script/config/type-dependency-configs.ts` |
| 스타일/빌드 부가 | `style-dependency-configs.ts`, `build-system-config.ts`, `transform-vite-config.ts` |
| CLI 자체 devDeps | `packages/common-cli/package.json` |

분류:

- **적용 예정**: 파일 경로 + 현재 값 → 변경 값 (예: `type-dependency-configs.ts`의 `vite` `^8.0.12` → `^8.1.4`)
- **스킵**: 이유 한 줄 (Oxlint, 앱 UI, lib 전용과 무관 등)
- **선택**: 기본은 스킵. 사용자가 포함하라고 하면 적용 목록에 넣음

요약 형식:

```markdown
## 업그레이드 계획 (common-cli react-vite)

from Vite <from> → to Vite <to>  
create-vite: <from-cv> → <to-cv>

### 적용 예정
1. `packages/common-cli/package.json` — `vite`: `^A` → `^B`, …
2. `…/type-dependency-configs.ts` — …
3. …

### 스킵
- … — 이유

### 선택 (기본 제외)
- … — 포함하려면 알려 주세요

업그레이드할까요?
```

**반드시** 마지막에 「업그레이드할까요?」를 묻고, 사용자 확인 전에는 common-cli를 수정하지 않는다.

## 6. 업그레이드 반영 (사용자가 동의한 경우만)

「응 / 해줘 / 업그레이드」 등 동의가 있으면 **적용 예정** 항목만 수정한다.

- 의존성 문자열은 `type-dependency-configs.ts` / `style-dependency-configs.ts` / `package.json`을 우선 갱신한다.
- 템플릿/`sandbox`는 create-vite를 그대로 덮어쓰지 않는다. 기존 lib/sandbox 구조를 유지한 채 필요한 옵션·버전·파일만 패치한다.
- 관련 단위 테스트가 있으면 통과를 확인한다.
- 이 레포 규칙이 있으면 변경 파일 범위에 lint/format을 적용한다.

거부하거나 보류면 코드는 건드리지 않고 8로 간다 (스모크 생략).

## 7. react-vite 스모크 테스트 (반영한 경우 필수)

공식 diff에 없는 회귀(예: `nodenext` × `vitest.config` import)를 잡기 위해, **반영 직후** common-cli로 실제 패키지를 생성해 검증한다.

1. common-cli 빌드: `pnpm --filter @watcha-authentic/common-cli build`
2. 워크스페이스 루트에서 **상대** `--dest-dir`로 스캐폴드 (절대 경로는 `executeDir`에 join되어 중첩될 수 있음):

```bash
cd "{workspace-root}"
node packages/common-cli/dist/bin/main.cjs create-package \
  --type react-vite \
  --react-vite-mode sandbox \
  --project-name react-vite-smoke \
  --project-description "migrate smoke" \
  --dest-dir react-vite-scaffold-smoke \
  --package-manager pnpm \
  --without-install \
  --yes
```

3. 생성물에서 적용한 설정이 들어갔는지 확인 (버전, tsconfig 옵션, vitest import 등).
4. `cd react-vite-scaffold-smoke && pnpm install --ignore-workspace`
5. `pnpm typecheck` (또는 `tsc -b`), `pnpm build`, `pnpm test` — exit code 기록.
6. 실패 시: 원인 수정 → 다시 스모크. 사용자에게 실패 내용과 수정안을 보고한다.
7. 스모크 폴더는 8단계에서 삭제한다. 사용자가 남겨 달라고 하면 유지한다.

## 8. 임시 폴더 삭제

분석·확인·(선택) 반영·스모크가 끝나면 **반드시** 삭제한다. 묻지 않는다.  
(사용자가 스모크 폴더 유지를 명시한 경우 `react-vite-scaffold-smoke`만 예외.)

```bash
rm -rf "{workspace-root}/react-vite-upgrade"
rm -rf "{workspace-root}/react-vite-scaffold-smoke"
```

중단·실패로 더 이상 진행하지 않을 때도 `react-vite-upgrade`가 남아 있으면 삭제한다.

## 완료 보고

1. from → to Vite 코어 / 사용한 create-vite 버전
2. 파일별 diff 요약 (짧게) + 우리 전용 파일 리스크
3. 업그레이드 계획 (적용·스킵·선택)
4. 업그레이드 여부 / 실제 수정 경로 (했으면)
5. 스모크 결과 (scaffold / typecheck / build / test)
6. 임시 폴더 삭제 완료
