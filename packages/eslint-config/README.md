# @watcha-authentic/eslint-config

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/eslint-config)](https://www.npmjs.com/package/@watcha-authentic/eslint-config)

Watcha 공통 ESLint(flat config) 패키지입니다. 환경별 **preset** subpath와 조합용 **config** subpath를 제공합니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=eslint-config)

## Table of contents

- [Subpath exports](#subpath-exports)
- [Peer dependencies](#peer-dependencies)
- [Installation](#installation)
- [Usage](#usage)

## Subpath exports

v2부터 root export(`.`)는 없습니다. preset 또는 config subpath를 import 하세요.

### Presets (recommended)

| subpath | export | 구성 |
| ------- | ------ | ---- |
| `@watcha-authentic/eslint-config/node` | `nodePreset` | base + typescript |
| `@watcha-authentic/eslint-config/react` | `reactPreset` | base + typescript + react |
| `@watcha-authentic/eslint-config/vite` | `vitePreset` | base + typescript + react + vite |
| `@watcha-authentic/eslint-config/next` | `nextPreset` | base + typescript + react + next |
| `@watcha-authentic/eslint-config/remix` | `remixPreset` | base + typescript + react + remix |
| `@watcha-authentic/eslint-config/rsbuild` | `rsbuildPreset` | base + typescript + react + rsbuild |

### Config blocks (custom composition)

| subpath | export |
| ------- | ------ |
| `@watcha-authentic/eslint-config/configs/base` | `baseConfigs` |
| `@watcha-authentic/eslint-config/configs/typescript` | `typescriptConfigs` |
| `@watcha-authentic/eslint-config/configs/react` | `reactConfigs` |
| `@watcha-authentic/eslint-config/configs/vite` | `viteConfigs` |
| `@watcha-authentic/eslint-config/configs/next` | `nextConfigs` |
| `@watcha-authentic/eslint-config/configs/remix` | `remixConfigs` |
| `@watcha-authentic/eslint-config/configs/rsbuild` | `rsbuildConfigs` |

## Peer dependencies

**Runtime dependencies는 없습니다.** ESLint 플러그인·파서는 소비자 프로젝트에서 설치합니다.

npm은 subpath별 peer를 선언할 수 없으므로, `package.json`의 peer는 모두 optional입니다. **사용하는 subpath에 맞는 패키지만** 설치하세요.

### 공통 (모든 preset / config)

| 패키지 |
| ------ |
| `eslint` |
| `eslint-plugin-import` |
| `eslint-plugin-perfectionist` |
| `eslint-plugin-simple-import-sort` |
| `eslint-import-resolver-typescript` |

### preset / config별 추가 peer

| subpath | 추가로 설치할 peer |
| ------- | ------------------ |
| `/node`, `/configs/base`, `/configs/typescript` | `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` |
| `/react`, `/configs/react` | + `eslint-plugin-react`, `eslint-plugin-react-hooks` |
| `/vite`, `/configs/vite` | + `eslint-plugin-react-refresh`, `globals` |
| `/rsbuild`, `/configs/rsbuild` | + `eslint-plugin-react-refresh`, `globals` |
| `/remix`, `/configs/remix` | + `eslint-plugin-react-refresh` |
| `/next`, `/configs/next` | + `@next/eslint-plugin-next` |

preset subpath는 위 표에서 **해당 preset 구성에 포함된 config peer의 합집합**입니다.

예: `/vite` → 공통 + TypeScript + React + react-refresh + globals

### 설치 예시

#### Node / TypeScript (`/node`)

```bash
pnpm add -D @watcha-authentic/eslint-config@^2.0.0 \
  eslint@^9.0.0 \
  eslint-plugin-import@^2.0.0 \
  eslint-plugin-perfectionist@^5.0.0 \
  eslint-plugin-simple-import-sort@^12.0.0 \
  eslint-import-resolver-typescript@^3.6.0 \
  @typescript-eslint/parser@^8.0.0 \
  @typescript-eslint/eslint-plugin@^8.0.0
```

#### React library (`/react`)

```bash
pnpm add -D @watcha-authentic/eslint-config@^2.0.0 \
  eslint@^9.0.0 \
  eslint-plugin-import@^2.0.0 \
  eslint-plugin-perfectionist@^5.0.0 \
  eslint-plugin-simple-import-sort@^12.0.0 \
  eslint-import-resolver-typescript@^3.6.0 \
  @typescript-eslint/parser@^8.0.0 \
  @typescript-eslint/eslint-plugin@^8.0.0 \
  eslint-plugin-react@^7.0.0 \
  eslint-plugin-react-hooks@^7.0.0
```

#### Vite + React (`/vite`)

```bash
pnpm add -D @watcha-authentic/eslint-config@^2.0.0 \
  eslint@^9.0.0 \
  eslint-plugin-import@^2.0.0 \
  eslint-plugin-perfectionist@^5.0.0 \
  eslint-plugin-simple-import-sort@^12.0.0 \
  eslint-import-resolver-typescript@^3.6.0 \
  @typescript-eslint/parser@^8.0.0 \
  @typescript-eslint/eslint-plugin@^8.0.0 \
  eslint-plugin-react@^7.0.0 \
  eslint-plugin-react-hooks@^7.0.0 \
  eslint-plugin-react-refresh@^0.4.0 \
  globals@^17.6.0
```

#### Next.js (`/next`)

```bash
pnpm add -D @watcha-authentic/eslint-config@^2.0.0 \
  eslint@^9.0.0 \
  eslint-plugin-import@^2.0.0 \
  eslint-plugin-perfectionist@^5.0.0 \
  eslint-plugin-simple-import-sort@^12.0.0 \
  eslint-import-resolver-typescript@^3.6.0 \
  @typescript-eslint/parser@^8.0.0 \
  @typescript-eslint/eslint-plugin@^8.0.0 \
  eslint-plugin-react@^7.0.0 \
  eslint-plugin-react-hooks@^7.0.0 \
  eslint-plugin-react-refresh@^0.4.0 \
  @next/eslint-plugin-next@^15.0.0
```

## Installation

```bash
pnpm add -D @watcha-authentic/eslint-config@^2.0.0
```

위 [Peer dependencies](#peer-dependencies)에 맞춰 플러그인·파서를 추가로 설치하세요.

## Usage

Flat config는 **배열을 펼쳐서** export 합니다.

### Preset

```javascript
// eslint.config.js
import { vitePreset } from "@watcha-authentic/eslint-config/vite";

export default [...vitePreset];
```

### Config blocks

```javascript
// eslint.config.js
import { baseConfigs } from "@watcha-authentic/eslint-config/configs/base";
import { typescriptConfigs } from "@watcha-authentic/eslint-config/configs/typescript";

export default [...baseConfigs, ...typescriptConfigs];
```

### Extending a preset

```javascript
// eslint.config.js
import { reactPreset } from "@watcha-authentic/eslint-config/react";

export default [
  ...reactPreset,
  {
    rules: {
      "no-console": "off",
    },
  },
];
```

### CommonJS

```javascript
// eslint.config.cjs
const { vitePreset } = require("@watcha-authentic/eslint-config/vite");

module.exports = [...vitePreset];
```

## Migration from v1

| v1 | v2 |
| -- | -- |
| `import { vitePreset } from "@watcha-authentic/eslint-config"` | `import { vitePreset } from "@watcha-authentic/eslint-config/vite"` |
| `import { baseConfigs } from "@watcha-authentic/eslint-config"` | `import { baseConfigs } from "@watcha-authentic/eslint-config/configs/base"` |
| `import lint from "@watcha-authentic/eslint-config"` | subpath import로 전환 (root export 없음) |

v2는 **2.0.0 major**입니다. 사용하는 preset에 맞는 peer만 설치하면 `@next/eslint-plugin-next` 등 불필요한 플러그인을 설치하지 않아도 됩니다.
