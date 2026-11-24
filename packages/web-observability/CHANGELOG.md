# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.0.0 (2026-11-24)

### Bug Fixes

* **web-observability:** SPA 이동 뒤의 브라우저 로그를 첫 문서의 SSR trace 에 잇지 않는다 ([6773ae0](https://github.com/frograms/bistro-house/commit/6773ae0597b59882f4b0b47b65978a97e6f19eb3))
* **web-observability:** 브라우저 로그 전송이 keepalive 64KiB 한도를 넘지 않게 한다 ([dee5279](https://github.com/frograms/bistro-house/commit/dee52799ad88e5875bfd8f25447a74344926be34))
* **web-observability:** 액세스 로그 메시지를 고정 문장으로 남긴다 ([0baaff4](https://github.com/frograms/bistro-house/commit/0baaff44f834df123a7c7fbb4558e47e2a46b6fa))
* **web-observability:** 앱이 남긴 예외로 서버 스팬을 ERROR 로 바꾸지 않는다 ([7c24053](https://github.com/frograms/bistro-house/commit/7c24053ad869e4ab65f9482643dbf2dec2319381))

### Features

* **web-observability:** init 옵션을 실행 환경 키로 나눠 한쪽만 받는다 ([6a3700b](https://github.com/frograms/bistro-house/commit/6a3700b0f2df615bb88b6f521dd63695c28b5c3c))
* **web-observability:** OpenTelemetry·HyperDX 관측을 Sentry 처럼 쓰는 패키지 추가 ([67c4abf](https://github.com/frograms/bistro-house/commit/67c4abf4aa90046c762af304b9f0f538e87fb8c2))
* **web-observability:** 로그 컨텍스트 객체를 JSON 문자열 대신 점 표기 키로 펼친다 ([31c9f40](https://github.com/frograms/bistro-house/commit/31c9f40667cc4a1e7e6d747764b96bf81b65093d))
* **web-observability:** 브라우저 세션 ID 와 사용자를 서버·브라우저 기록에 남긴다 ([cdadeef](https://github.com/frograms/bistro-house/commit/cdadeef0814a7b49dd5abf9e8c70f440e7f8837c))
* **web-observability:** 브라우저 처리 안 된 오류 수집을 끌 수 있게 한다 ([b8f9227](https://github.com/frograms/bistro-house/commit/b8f922775bbe1cb70d5793373309c5d43364db1f))

### BREAKING CHANGES

* **web-observability:** 로그·스팬의 세션 속성 이름이 o11y.session_id 에서 session.id 로 바뀐다

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
* **web-observability:** init({ service, ... }) 형식은 더 이상 받지 않는다

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
