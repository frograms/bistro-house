# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/frograms/bistro-house/compare/@watcha-authentic/eslint-config@1.2.3...@watcha-authentic/eslint-config@2.0.0) (2026-06-12)

* Feature/eslint config subpath exports (#31) ([e693e35](https://github.com/frograms/bistro-house/commit/e693e35737eed6defdf31ffc8dba3f3737278920)), closes [#31](https://github.com/frograms/bistro-house/issues/31)

### BREAKING CHANGES

* root export(`.`) is removed in v2.0.0.
Import presets from subpaths such as `@watcha-authentic/eslint-config/vite`
and config blocks from `@watcha-authentic/eslint-config/configs/base`.
Each entry is built separately so optional peers like
`@next/eslint-plugin-next` are only required for the matching subpath.

* fix(eslint-config): align rsbuild globals and expand install guides

Add globals.browser to rsbuild config for parity with vite, and document
copy-paste peer install commands for all presets and config blocks.

* chore: eslint-config 만 publish

## [1.2.3](https://github.com/frograms/bistro-house/compare/@watcha-authentic/eslint-config@1.2.2...@watcha-authentic/eslint-config@1.2.3) (2026-06-11)

**Note:** Version bump only for package @watcha-authentic/eslint-config

## [1.2.2](https://github.com/frograms/bistro-house/compare/@watcha-authentic/eslint-config@1.2.1...@watcha-authentic/eslint-config@1.2.2) (2026-06-11)

**Note:** Version bump only for package @watcha-authentic/eslint-config

## [1.2.1](https://github.com/frograms/bistro-house/compare/@watcha-authentic/eslint-config@1.2.0...@watcha-authentic/eslint-config@1.2.1) (2026-06-11)

### Bug Fixes

- **eslint-config:** align globals peer with Vite 8 scaffold ([6554675](https://github.com/frograms/bistro-house/commit/6554675933d620959e54bc745245d68f2906b85d))

# 1.2.0 (2026-06-11)

### Bug Fixes

- **eslint-config:** add globals.browser to vite preset ([#26](https://github.com/frograms/bistro-house/issues/26)) ([9261e9c](https://github.com/frograms/bistro-house/commit/9261e9cc9f1b72ba8ff83131200e720d58c66c29))
- optional deps to eslint config ([349fa5b](https://github.com/frograms/bistro-house/commit/349fa5b7df0d1f682b55dbecc850cefc0d115171))
- package repository URL에 .git 접미사 추가 ([9e3d298](https://github.com/frograms/bistro-house/commit/9e3d298a001ca69ac2d62b1b02f7fcb298dd7267))
- 주석 개행 변경 ([7052519](https://github.com/frograms/bistro-house/commit/70525195058fade2f1ebfbc73e668e1840e61dbd))

### Features

- add perfectionist object key sort rules ([#17](https://github.com/frograms/bistro-house/issues/17)) ([30b31d9](https://github.com/frograms/bistro-house/commit/30b31d9c3f8ce8964bd9980e762928109a69a5a7))
- format all ([f19b57a](https://github.com/frograms/bistro-house/commit/f19b57aee3e3f774b325666d3f354c8de066b44a))
- lint perfectionist ([cc841da](https://github.com/frograms/bistro-house/commit/cc841dae6c98cfa2543befe2544f6fa3abd33ec6))
- lint 세팅 ([4470b17](https://github.com/frograms/bistro-house/commit/4470b17ad14fbd9fb72588bd610efb7627a77216))
- migrate swc to tsdown ([9dbbb17](https://github.com/frograms/bistro-house/commit/9dbbb1781d75761db7b9be40b8b4f6f4cd2dac2e))
- prettier ([d0ba719](https://github.com/frograms/bistro-house/commit/d0ba71994a6423dc25685faa77adce0af3c160a8))
- readme update ([b8327dd](https://github.com/frograms/bistro-house/commit/b8327ddeaff19891b460da3bae3bca14a6d03e86))
- temporary setting ([770d11c](https://github.com/frograms/bistro-house/commit/770d11c515c197ec9ce53fb0fb302d079a8f78b2))
- vitest to packages ([#23](https://github.com/frograms/bistro-house/issues/23)) [skip ci] ([fbc8917](https://github.com/frograms/bistro-house/commit/fbc8917972f559ba367dca9a311c5b5632a2122d))
- 기타 작업 ([ab9bb4f](https://github.com/frograms/bistro-house/commit/ab9bb4f032ab59a30d99c73e9481b92ad604c267))

## [1.1.1](https://github.com/frograms/bistro-house/compare/@watcha-authentic/eslint-config@1.1.0...@watcha-authentic/eslint-config@1.1.1) (2026-06-04)

**Note:** Version bump only for package @watcha-authentic/eslint-config

# [1.1.0](https://github.com/frograms/bistro-house/compare/@watcha-authentic/eslint-config@1.0.0...@watcha-authentic/eslint-config@1.1.0) (2026-06-04)

### Features

- add perfectionist object key sort rules ([#17](https://github.com/frograms/bistro-house/issues/17)) ([f29640e](https://github.com/frograms/bistro-house/commit/f29640e40502335d1a397048dcf199687574229d))

# [1.0.0](https://github.com/frograms/bistro-house/compare/@watcha-authentic/eslint-config@0.2.3...@watcha-authentic/eslint-config@1.0.0) (2026-06-02)

**Note:** Version bump only for package @watcha-authentic/eslint-config

## [0.2.3](https://github.com/frograms/bistro-house/compare/@watcha-authentic/eslint-config@0.2.2...@watcha-authentic/eslint-config@0.2.3) (2026-06-02)

**Note:** Version bump only for package @watcha-authentic/eslint-config

## [0.2.2](https://github.com/frograms/bistro-house/compare/@watcha-authentic/eslint-config@0.2.1...@watcha-authentic/eslint-config@0.2.2) (2026-06-02)

**Note:** Version bump only for package @watcha-authentic/eslint-config

## [0.2.1](https://github.com/frograms/bistro-house/compare/@watcha-authentic/eslint-config@0.2.0...@watcha-authentic/eslint-config@0.2.1) (2026-06-02)

**Note:** Version bump only for package @watcha-authentic/eslint-config

# 0.2.0 (2026-05-26)

### Bug Fixes

- optional deps to eslint config ([349fa5b](https://github.com/frograms/bistro-house/commit/349fa5b7df0d1f682b55dbecc850cefc0d115171))
- package repository URL에 .git 접미사 추가 ([71d8e4b](https://github.com/frograms/bistro-house/commit/71d8e4b6b30adf2733a387c911e17c483a73a7be))
- 주석 개행 변경 ([7052519](https://github.com/frograms/bistro-house/commit/70525195058fade2f1ebfbc73e668e1840e61dbd))

### Features

- format all ([f19b57a](https://github.com/frograms/bistro-house/commit/f19b57aee3e3f774b325666d3f354c8de066b44a))
- lint perfectionist ([cc841da](https://github.com/frograms/bistro-house/commit/cc841dae6c98cfa2543befe2544f6fa3abd33ec6))
- lint 세팅 ([4470b17](https://github.com/frograms/bistro-house/commit/4470b17ad14fbd9fb72588bd610efb7627a77216))
- migrate swc to tsdown ([9dbbb17](https://github.com/frograms/bistro-house/commit/9dbbb1781d75761db7b9be40b8b4f6f4cd2dac2e))
- prettier ([d0ba719](https://github.com/frograms/bistro-house/commit/d0ba71994a6423dc25685faa77adce0af3c160a8))
- readme update ([b8327dd](https://github.com/frograms/bistro-house/commit/b8327ddeaff19891b460da3bae3bca14a6d03e86))
- temporary setting ([770d11c](https://github.com/frograms/bistro-house/commit/770d11c515c197ec9ce53fb0fb302d079a8f78b2))
- 기타 작업 ([ab9bb4f](https://github.com/frograms/bistro-house/commit/ab9bb4f032ab59a30d99c73e9481b92ad604c267))
