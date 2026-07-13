---
name: resolve-create-vite-for-vite
description: >-
  Resolve which create-vite package version scaffolds a given Vite core version
  by inspecting create-vite release template package.json vite ranges. Use when
  the user asks for the create-vite version for a Vite version, when
  npm create vite@X fails with ETARGET, or before scaffolding/comparing
  templates for a specific Vite core version.
---

# Vite → create-vite 버전 해석

`npm create vite@X`의 `X`는 **Vite 코어가 아니라 `create-vite` 패키지 버전**이다.  
버전 숫자가 같아도 1:1이 아니다.

사용자가 Vite 버전을 주고 create-vite를 물으면, **스크립트 없이** 아래 방식으로 직접 조회한 뒤 **결과만** 짧게 알려준다.

## 절차

1. `npm view create-vite versions --json`으로 릴리스 목록을 받는다 (프리릴리스 제외).
2. 최신부터 후보 태그의 템플릿 `package.json`에서 `vite` range를 읽는다.
   - 권장: GitHub raw  
     `https://raw.githubusercontent.com/vitejs/vite/create-vite@<ver>/packages/create-vite/template-react-ts/package.json`
   - 대안: `npm pack` 후 `template-react-ts/package.json`
3. 목표 Vite가 그 range를 만족하면 매칭. **가장 최신 매칭**을 best로 고른다.
4. 사용자에게 **결과만** 짧게 보고:
   - best `create-vite` 버전
   - 템플릿 `vite` range
   - 스캐폴드 한 줄
   - Exact 패치가 필요하면 생성 후 `vite` 핀 한 줄

매칭이 여러 개면 best만 강조하고, 필요 시 상위 몇 개만 덧붙인다.

## 규칙

- Vite 코어 버전만 주면 `npm create vite@그숫자`를 그대로 실행·추천하지 말고 이 절차로 해석한다.
- 사용자가 create-vite 버전을 명시하면 그걸 우선한다.
- `create-vite@8.1.0` ≡ Vite `8.1.0`이라고 가정하지 않는다.
- 답변은 결과 중심. 매핑 원리 장황 설명은 사용자가 물을 때만.

## 관련

- Vite 구간 템플릿 diff → common-cli 마이그레이션 분석: `common-cli-react-vite-migrate-analyze`
