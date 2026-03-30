# @watcha-authentic/prettier-config

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/prettier-config)](https://www.npmjs.com/package/@watcha-authentic/prettier-config)

Watcha 공통 Prettier 설정 패키지입니다.

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

## Dependencies

### Runtime dependencies

**없습니다.** 설정 객체만 제공합니다.

### Peer dependencies

**호스트 프로젝트에 Prettier를 반드시 설치**해야 합니다. 이 패키지는 Prettier 실행기를 포함하지 않습니다.

- `prettier` `^3.0.0`

## Installation

```bash
pnpm add -D @watcha-authentic/prettier-config prettier@^3.0.0
```

## Usage

`src/index.ts`는 `rule-base-config`의 **`baseConfig`** 만 재수출합니다.

### ESM (prettier.config)

```javascript
// prettier.config.js
import { baseConfig } from "@watcha-authentic/prettier-config";

export default baseConfig;
```

### CommonJS

```javascript
// prettier.config.cjs
const { baseConfig } = require("@watcha-authentic/prettier-config");

module.exports = baseConfig;
```

### package.json prettier field

```json
{
  "prettier": "@watcha-authentic/prettier-config"
}
```
