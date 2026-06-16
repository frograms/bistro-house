# @watcha-authentic/prettier-config

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/prettier-config)](https://www.npmjs.com/package/@watcha-authentic/prettier-config)

Watcha 공통 Prettier 설정입니다. `baseConfig`를 import해서 바로 쓸 수 있습니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=prettier-config)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

## Dependencies

### Runtime dependencies

**없습니다.** 설정 객체만 제공합니다.

### Peer dependencies

**Prettier는 프로젝트에 별도로 설치해야 합니다.** 이 패키지에는 Prettier 본체가 포함되어 있지 않습니다.

- `prettier` `^3.0.0`

## Installation

```bash
pnpm add -D @watcha-authentic/prettier-config prettier@^3.0.0
```

## Usage

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
