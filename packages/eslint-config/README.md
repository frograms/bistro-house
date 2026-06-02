# @watcha-authentic/eslint-config

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/eslint-config)](https://www.npmjs.com/package/@watcha-authentic/eslint-config)

Watcha 공통 ESLint(flat config) 패키지입니다. TypeScript, React, Remix, Vite, Rsbuild, Next.js 등 환경별 규칙 블록과 프리셋을 조합해 사용할 수 있습니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=eslint-config)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [Exported symbols](#exported-symbols)

## Dependencies

### Runtime dependencies

**없습니다.** ESLint 플러그인·파서는 모두 소비자 프로젝트의 `peerDependencies`로 설치합니다.

### Peer dependencies

**사용하는 프리셋·규칙 블록에 맞게 호스트 프로젝트에 설치**해야 합니다. 누락 시 ESLint가 플러그인/파서를 불러오지 못합니다.

| 구분 | 패키지 |
|------|--------|
| 공통 | `eslint`, `eslint-plugin-import`, `eslint-plugin-perfectionist`, `eslint-plugin-simple-import-sort`, `eslint-import-resolver-typescript` |
| TypeScript | `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` |
| React | `eslint-plugin-react`, `eslint-plugin-react-hooks` |
| React Refresh (Vite / Rsbuild / Remix 등) | `eslint-plugin-react-refresh` |
| Next.js | `@next/eslint-plugin-next` |

아래 설치 예시는 자주 쓰는 조합입니다.

#### Example: TypeScript, React, and Vite preset

```bash
pnpm add -D @watcha-authentic/eslint-config \
  eslint@^9.0.0 \
  eslint-plugin-import@^2.0.0 \
  eslint-plugin-perfectionist@^5.0.0 \
  eslint-plugin-simple-import-sort@^12.0.0 \
  eslint-import-resolver-typescript@^3.6.0 \
  @typescript-eslint/parser@^8.0.0 \
  @typescript-eslint/eslint-plugin@^8.0.0 \
  eslint-plugin-react@^7.0.0 \
  eslint-plugin-react-hooks@^7.0.0 \
  eslint-plugin-react-refresh@^0.4.0
```

#### Example: Next.js and full plugin set

```bash
pnpm add -D @watcha-authentic/eslint-config \
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
pnpm add -D @watcha-authentic/eslint-config
```

위 [Peer dependencies](#peer-dependencies)에 맞춰 플러그인·파서를 추가로 설치하세요.

## Usage

`src/index.ts`는 규칙 배열(`*Configs`)과 프리셋(`*Preset`)을 노출합니다. Flat config는 **배열을 펼쳐서** export 합니다.

### Presets (recommended)

#### React (`reactPreset`)

```javascript
// eslint.config.js
import { reactPreset } from "@watcha-authentic/eslint-config";

export default [...reactPreset];
```

#### Remix (`remixPreset`)

```javascript
// eslint.config.js
import { remixPreset } from "@watcha-authentic/eslint-config";

export default [...remixPreset];
```

#### Vite (`vitePreset`)

```javascript
// eslint.config.js
import { vitePreset } from "@watcha-authentic/eslint-config";

export default [...vitePreset];
```

#### Rsbuild (`rsbuildPreset`)

```javascript
// eslint.config.js
import { rsbuildPreset } from "@watcha-authentic/eslint-config";

export default [...rsbuildPreset];
```

#### Next.js (`nextPreset`)

```javascript
// eslint.config.js
import { nextPreset } from "@watcha-authentic/eslint-config";

export default [...nextPreset];
```

### Composing rule blocks

```javascript
// eslint.config.js
import {
  baseConfigs,
  typescriptConfigs,
  reactConfigs,
} from "@watcha-authentic/eslint-config";

export default [
  ...baseConfigs,
  ...typescriptConfigs,
  ...reactConfigs,
];
```

### Extending a preset

```javascript
// eslint.config.js
import { vitePreset } from "@watcha-authentic/eslint-config";

export default [
  ...vitePreset,
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
const { vitePreset } = require("@watcha-authentic/eslint-config");

module.exports = [...vitePreset];
```

## Exported symbols

소스 `src/script/config` 기준 export 이름입니다.

### Rule blocks

- `baseConfigs`
- `typescriptConfigs`
- `reactConfigs`
- `remixConfigs`
- `viteConfigs`
- `rsbuildConfigs`
- `nextConfigs`

### Preset exports

- `reactPreset` — base + typescript + react  
- `remixPreset` — base + typescript + react + remix  
- `vitePreset` — base + typescript + react + vite  
- `rsbuildPreset` — base + typescript + react + rsbuild  
- `nextPreset` — base + typescript + react + next  
