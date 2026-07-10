---
name: package-readme-guide-update
description: >-
  Create or update packages/*/README.md by following docs/PACKAGE_README_GUIDE.md.
  Use when writing package README, usage docs, dependencies/installation sections,
  API reference, or syncing docs with package.json.
---

# Package README Guide Update

`packages/*/README.md` 작성·갱신 시 **형식·톤·섹션 규칙은 `docs/PACKAGE_README_GUIDE.md` 단일 문서**를 따른다.  
이 스킬은 에이전트 작업 절차만 담는다. 규칙을 스킬에 중복 정의하지 않는다.

## 작업 전 필수 읽기

1. **`docs/PACKAGE_README_GUIDE.md`** — README 형식·템플릿 (단일 기준)
2. `packages/<name>/package.json`
3. `packages/<name>/src/index.ts` — 공개 export
4. 타입·props 정의 파일
5. (종속성 변경 시) `docs/PACKAGE_DEPS_AND_BUILD.md`

**하지 않을 것**: 다른 패키지 `README.md`를 복사·참고하지 않는다.

## 작업 체크리스트

```
- [ ] PACKAGE_README_GUIDE.md 규칙 준수
- [ ] package.json(name, description, dependencies, peerDependencies) 정합성
- [ ] API 목록 추출 후 API 초안 → Usage 순으로 작성
- [ ] Usage: 시나리오당 설명 1~2문장 + 코드, Basic usage 포함
- [ ] API: 테이블 우선. 훅은 Parameters/Returns. export options 타입은 `### {TypeName}` 별도 섹션
- [ ] Usage ↔ API 양방향 대조 (누락·미사용 API 없음)
- [ ] TOC 앵커 ↔ ## 제목 일치
- [ ] 검증 명령 실행
```

## 작업 절차

1. `docs/PACKAGE_README_GUIDE.md`를 읽는다 (특히 §5 Usage, §6 API).
2. `package.json` + `src/index.ts` + 타입 정의에서 **문서화 대상 API 목록**을 만든다.
3. 가이드 스켈레톤에 맞춰 Dependencies·Installation을 작성한다.
4. **`API` 초안**을 먼저 작성한다 (테이블 + 필요 시 불릿 보조).
5. **`Usage` 시나리오**를 작성한다 (`### Basic usage` 필수, 시나리오 1개 = 기능 1개).
6. Usage ↔ API **양방향 대조**한다.
7. playground 문서 route가 있으면 `pnpm dev`로 TOC·코드 블록을 확인한다.
8. 검증을 실행한다.

## 검증

```bash
pnpm validate --filter=@watcha-authentic/<package-name>
```

## 완료 보고

- 수정 README 경로
- 문서화한 공개 API 목록
- Usage 시나리오 목록
- Usage ↔ API 대조 결과
- `package.json` 정합성 여부
- 검증 결과

## 규칙 변경 시

README 형식을 바꿀 때는 **스킬이 아니라 `docs/PACKAGE_README_GUIDE.md`만** 수정한다.
