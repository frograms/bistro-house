# @watcha-authentic/eslint-config

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/eslint-config)](https://www.npmjs.com/package/@watcha-authentic/eslint-config)

Watcha 공통 ESLint(flat config) 패키지입니다. 환경별 **preset** subpath와 조합용 **config** subpath를 제공합니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=eslint-config)

## Table of contents

- [Subpath exports](#subpath-exports)
- [Installation](#installation)
- [Peer dependencies](#peer-dependencies)
- [프리셋별 종속성 가이드](#프리셋별-종속성-가이드)
- [config block별 종속성 가이드](#config-block별-종속성-가이드)
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

## Installation

사용할 preset 또는 config block을 [Subpath exports](#subpath-exports)에서 고른 뒤, 아래 [프리셋별 종속성 가이드](#프리셋별-종속성-가이드) 또는 [config block별 종속성 가이드](#config-block별-종속성-가이드)에서 해당 명령을 복사해 설치하세요.

각 명령에는 `@watcha-authentic/eslint-config`와 필요한 peer가 모두 포함되어 있습니다.

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

## 프리셋별 종속성 가이드

preset subpath는 **해당 preset 구성에 포함된 config peer의 합집합**입니다. 아래 명령을 복사해 peer를 한 번에 설치하세요.

| preset | subpath | 구성 |
| ------ | ------- | ---- |
| `nodePreset` | `/node` | base + typescript |
| `reactPreset` | `/react` | base + typescript + react |
| `vitePreset` | `/vite` | base + typescript + react + vite |
| `nextPreset` | `/next` | base + typescript + react + next |
| `remixPreset` | `/remix` | base + typescript + react + remix |
| `rsbuildPreset` | `/rsbuild` | base + typescript + react + rsbuild |

### `/node` — `nodePreset`

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

### `/react` — `reactPreset`

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

### `/vite` — `vitePreset`

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

### `/next` — `nextPreset`

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
  @next/eslint-plugin-next@^15.0.0
```

### `/remix` — `remixPreset`

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
  eslint-plugin-react-refresh@^0.4.0
```

### `/rsbuild` — `rsbuildPreset`

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

## config block별 종속성 가이드

config block은 preset처럼 **조합**해서 씁니다. import하는 block peer의 **합집합**을 설치하세요.

아래 명령은 block을 **권장 순서대로 누적**했을 때(`base` → `typescript` → `react` → 환경별 block) 필요한 peer 전체입니다.

| export | subpath | 누적 구성 |
| ------ | ------- | --------- |
| `baseConfigs` | `/configs/base` | base |
| `typescriptConfigs` | `/configs/typescript` | base + typescript |
| `reactConfigs` | `/configs/react` | base + typescript + react |
| `viteConfigs` | `/configs/vite` | base + typescript + react + vite |
| `nextConfigs` | `/configs/next` | base + typescript + react + next |
| `remixConfigs` | `/configs/remix` | base + typescript + react + remix |
| `rsbuildConfigs` | `/configs/rsbuild` | base + typescript + react + rsbuild |

### `/configs/base` — `baseConfigs`

```bash
pnpm add -D @watcha-authentic/eslint-config@^2.0.0 \
  eslint@^9.0.0 \
  eslint-plugin-import@^2.0.0 \
  eslint-plugin-perfectionist@^5.0.0 \
  eslint-plugin-simple-import-sort@^12.0.0 \
  eslint-import-resolver-typescript@^3.6.0
```

### `/configs/typescript` — `typescriptConfigs`

`baseConfigs` + `typescriptConfigs` 조합 기준

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

### `/configs/react` — `reactConfigs`

`baseConfigs` + `typescriptConfigs` + `reactConfigs` 조합 기준

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

### `/configs/vite` — `viteConfigs`

`baseConfigs` + `typescriptConfigs` + `reactConfigs` + `viteConfigs` 조합 기준

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

### `/configs/next` — `nextConfigs`

`baseConfigs` + `typescriptConfigs` + `reactConfigs` + `nextConfigs` 조합 기준

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
  @next/eslint-plugin-next@^15.0.0
```

### `/configs/remix` — `remixConfigs`

`baseConfigs` + `typescriptConfigs` + `reactConfigs` + `remixConfigs` 조합 기준

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
  eslint-plugin-react-refresh@^0.4.0
```

### `/configs/rsbuild` — `rsbuildConfigs`

`baseConfigs` + `typescriptConfigs` + `reactConfigs` + `rsbuildConfigs` 조합 기준

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
