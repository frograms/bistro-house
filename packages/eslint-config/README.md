# @watcha-authentic/eslint-config

Watcha 공통 ESLint 설정 패키지입니다. TypeScript, React, Remix, Vite, Rsbuild, Next.js 등 다양한 환경에서 사용할 수 있으며, 필요한 설정만 조합하여 사용할 수 있습니다.

## 피어 종속성

이 패키지는 다음 패키지들을 피어 종속성으로 요구합니다. 사용하는 설정에 따라 필요한 패키지를 설치해야 합니다.

### 기본 (모든 설정에서 필요)

```bash
pnpm add -D eslint@^9.0.0 eslint-plugin-import@^2.0.0 eslint-plugin-simple-import-sort@^12.0.0
```

### TypeScript 설정 사용 시

```bash
pnpm add -D @typescript-eslint/parser@^8.0.0 @typescript-eslint/eslint-plugin@^8.0.0
```

### React 설정 사용 시

```bash
pnpm add -D eslint-plugin-react@^7.0.0 eslint-plugin-react-hooks@^7.0.0
```

### Vite/Rsbuild/Remix 설정 사용 시

```bash
pnpm add -D eslint-plugin-react-refresh@^0.4.0
```

### Next.js 설정 사용 시

```bash
pnpm add -D @next/eslint-plugin-next@^15.0.0
```

### 전체 설치 (모든 기능 사용 시)

```bash
pnpm add -D @watcha-authentic/eslint-config \
  eslint@^9.0.0 \
  eslint-plugin-import@^2.0.0 \
  eslint-plugin-simple-import-sort@^12.0.0 \
  @typescript-eslint/parser@^8.0.0 \
  @typescript-eslint/eslint-plugin@^8.0.0 \
  eslint-plugin-react@^7.0.0 \
  eslint-plugin-react-hooks@^7.0.0 \
  eslint-plugin-react-refresh@^0.4.0 \
  @next/eslint-plugin-next@^15.0.0
```

## 설치

```bash
pnpm add -D @watcha-authentic/eslint-config
```

## 사용 예

### Preset 사용 (권장)

#### React Preset

```javascript
// eslint.config.js
import { reactPreset } from "@watcha-authentic/eslint-config";

export default reactPreset;
```

#### Remix Preset

```javascript
// eslint.config.js
import { remixPreset } from "@watcha-authentic/eslint-config";

export default remixPreset;
```

#### Vite Preset

```javascript
// eslint.config.js
import { vitePreset } from "@watcha-authentic/eslint-config";

export default vitePreset;
```

#### Rsbuild Preset

```javascript
// eslint.config.js
import { rsbuildPreset } from "@watcha-authentic/eslint-config";

export default rsbuildPreset;
```

#### Next.js Preset

```javascript
// eslint.config.js
import { nextPreset } from "@watcha-authentic/eslint-config";

export default nextPreset;
```

### 개별 설정 조합

필요한 설정만 선택하여 조합할 수 있습니다:

```javascript
// eslint.config.js
import { base, typescript, react } from "@watcha-authentic/eslint-config";

export default [...base, typescript, react];
```

### 커스터마이징

각 설정은 배열로 반환되므로, 추가 규칙을 쉽게 추가할 수 있습니다:

```javascript
// eslint.config.js
import { reactPreset } from "@watcha-authentic/eslint-config";

export default [
  ...reactPreset,
  {
    rules: {
      "no-console": "off",
    },
  },
];
```

### CommonJS 사용 시

```javascript
// eslint.config.cjs
const { reactPreset } = require("@watcha-authentic/eslint-config");

module.exports = reactPreset;
```

## 사용 가능한 설정

### 개별 설정

- `base` - 기본 ESLint 규칙 (import 정렬, 코드 스타일 등 포함)
- `typescript` - TypeScript 지원
- `react` - React 지원 (`.jsx`, `.tsx` 파일에만 적용)
- `remix` - Remix 프레임워크 지원
- `vite` - Vite 빌드 도구 지원
- `rsbuild` - Rsbuild 빌드 도구 지원
- `next` - Next.js 프레임워크 지원

### Preset 설정

- `reactPreset` - base + typescript + react
- `remixPreset` - base + typescript + react + remix
- `vitePreset` - base + typescript + react + vite
- `rsbuildPreset` - base + typescript + react + rsbuild
- `nextPreset` - base + typescript + react + next
