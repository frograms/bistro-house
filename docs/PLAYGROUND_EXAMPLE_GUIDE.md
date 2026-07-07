# Playground 예제 추가 가이드

`apps/playground`에 패키지의 특정 기능을 보여주는 동작 예제를 추가할 때 따르는 작업 기준입니다.  
패키지 소스 변경은 예제 추가와 별개이므로, 필요한 경우 범위를 분리해 진행합니다.

## 먼저 확인할 것

1. 대상 기능: 어떤 prop, hook, 옵션, 상태, 접근성 동작을 예시화할지 정합니다.
2. 예제 단위: 패키지별로 예제는 여러 개 등록할 수 있지만, 예제 하나에는 하나의 기능 또는 상황만 담습니다.
3. 추가 범위: 문서 route만 필요한지, 동작 예제 route를 새로 추가해야 하는지 확인합니다.
4. 기존 구현: 같은 패키지나 유사 패키지의 playground 예제가 있으면 구조와 네이밍을 맞춥니다.

## 수정 위치

- `apps/playground/src/script/config/menu-info-config.ts`
  - `MENU_INFO`에 패키지 카드와 예제 메뉴를 추가합니다.
  - `PAGE_INFOS`는 `MENU_INFO`에서 파생되므로 직접 수정하지 않습니다.
- `apps/playground/src/script/route/playground-routes.tsx`
  - `withRouteComponent({ AppContent: PackageAppContent, routes })` 그룹을 패키지 단위로 추가합니다.
  - 문서 route는 README raw import가 들어가는 documentation container로 연결합니다.
- `apps/playground/src/component/view/package/<package-name>/`
  - 문서 container: `_react-foo-documentation-container.tsx`
  - 예제 container: `_react-foo-basic-container.tsx`처럼 예제 의도가 드러나게 작성합니다.
  - 스타일·fixture가 필요하면 같은 패키지 폴더 아래 `_shared/` 또는 `*.css.ts`로 colocate합니다.

## 구현 규칙

- playground 공통 UI를 우선 재사용합니다.
  - 레이아웃: `CommonContainer`
  - README 렌더링: `CommonReadme`
  - 안내 문구: `CommonNote`
  - 예제 패널: `CommonExampleControlPanel`, `CommonExampleStagePanel`, `CommonExampleStatePanel`
  - 폼 컨트롤 스타일: `commonExampleControlsCss`
- 패키지 코드는 실제 소비자가 쓰는 공개 API 중심으로 import합니다.
  - 패키지 내부 검증이 목적일 때만 `@packages/<name>/src/...` 경로를 사용합니다.
  - CSS side effect가 필요한 패키지는 예제 container 최상단에서 CSS를 import합니다.
- route path는 패키지 폴더명과 맞춥니다.
  - 문서: `/<package-name>`
  - 예제: `/<package-name>/<example-name>`
- `MENU_INFO.items`와 `playgroundRoutes.routes`의 path가 반드시 일치해야 합니다.
- 여러 기능을 보여줘야 하면 한 화면에 섞지 말고 예제 route를 기능 단위로 나눕니다.
- 홈·사이드바의 no-content 처리는 `MENU_INFO`와 `sections` 길이에서 자동 파생되므로 별도 분기를 추가하지 않습니다.

## 예제 품질 기준

- 예제는 “보이는 화면”만 만들지 말고 사용자가 조작할 수 있는 최소 컨트롤을 둡니다.
- 하나의 예제에서 서로 다른 기능을 병렬로 설명하거나 여러 예제를 탭·섹션으로 묶지 않습니다.
- 상태 변화가 중요한 API는 `CommonExampleStatePanel`로 현재 값을 보여줍니다.
- README의 사용 예와 충돌하지 않게 props·옵션 이름을 확인합니다.
- 더미 데이터는 예제 파일 또는 같은 폴더의 `_shared/`에 작게 둡니다.
- 임시 mock, console 로그, 디버그 텍스트는 남기지 않습니다.

## 검증

작업 후 저장소 루트에서 playground 배포 워크플로와 같은 검증을 실행합니다.

```bash
pnpm exec turbo run test lint build typecheck --filter=playground
```

패키지 소스나 README까지 함께 수정했다면 대상 패키지도 검증합니다.

```bash
pnpm validate --filter=@watcha-authentic/<name>
```
