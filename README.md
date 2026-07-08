# bistro-house

Watcha 웹 개발에서 사용하는 `@watcha-authentic/*` npm 패키지 모노레포입니다. ESLint·Prettier 설정과 React UI·유틸 라이브러리를 `packages/`에서 관리하고 [npm @watcha-authentic org](https://www.npmjs.com/org/watcha-authentic)으로 배포합니다.

> [!TIP]
> [WATCHA Packages](https://services.watcha.com/web-packages)에서 패키지의 실제 동작 예시를 확인할 수 있습니다.

## Packages

| Package                                                                 | Description                    |
| ----------------------------------------------------------------------- | ------------------------------ |
| [@watcha-authentic/eslint-config](packages/eslint-config)               | 공통 ESLint flat config        |
| [@watcha-authentic/prettier-config](packages/prettier-config)           | 공통 Prettier 설정             |
| [@watcha-authentic/react-event-callback](packages/react-event-callback) | 이벤트 콜백 디펜던시 유지 hook |
| [@watcha-authentic/react-a11y](packages/react-a11y)                     | 접근성 유틸                    |
| [@watcha-authentic/react-motion](packages/react-motion)                 | 포인터·제스처 모션             |
| [@watcha-authentic/react-slider](packages/react-slider)                 | 슬라이더 컴포넌트              |

설치·사용법·API는 **각 패키지 README**를 참고하세요.

```bash
pnpm add @watcha-authentic/react-slider
# 예시 — peer·서브패스(CSS) 등은 packages/<name>/README.md 참고
```

릴리즈·변경 이력은 [GitHub Releases](https://github.com/frograms/bistro-house/releases)와 패키지별 `CHANGELOG.md`에서 확인할 수 있습니다.

## Repository layout

```
bistro-house/
├── packages/          # npm 배포 대상 (@watcha-authentic/*)
├── apps/playground/   # 패키지 통합 확인용 앱
└── docs/              # 유지보수 가이드 (MAINTAINER_GUIDE.md 등)
```

## Contributing (monorepo)

저장소를 clone해 패키지를 수정·검증할 때:

**Requirements:** Node.js `^24`, pnpm `^9.9.0`

```bash
pnpm install
pnpm build:packages   # @watcha-authentic/* 빌드
pnpm dev              # packages 빌드 후 playground dev server
pnpm validate         # test · lint · build · typecheck
```

PR은 [validate-pr.yml](.github/workflows/validate-pr.yml)으로 전체 워크스페이스를 검증합니다.

## Maintainers

레지스트리 등록, CI 배포, 패키지 스캐폴딩, README·종속성 규칙 등 **운영·유지보수** 절차는 [docs/MAINTAINER_GUIDE.md](docs/MAINTAINER_GUIDE.md)를 참고하세요.
