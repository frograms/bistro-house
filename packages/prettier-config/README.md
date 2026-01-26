# @watcha-authentic/prettier-config

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/prettier-config)](https://www.npmjs.com/package/@watcha-authentic/prettier-config)

Watcha 공통 Prettier 설정 패키지입니다.

## 피어 종속성

이 패키지는 다음 패키지를 피어 종속성으로 요구합니다.

```bash
pnpm add -D prettier@^3.0.0
```

## 설치

```bash
pnpm add -D @watcha-authentic/prettier-config prettier@^3.0.0
```

## 사용 예

### 기본 설정

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

### package.json

```json
{
  "prettier": "@watcha-authentic/prettier-config"
}
```
