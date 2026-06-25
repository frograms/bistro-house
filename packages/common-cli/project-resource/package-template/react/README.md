# {project-name}

{project-description}

Created by [@watcha-authentic/common-cli](https://www.npmjs.com/package/@watcha-authentic/common-cli) create-package command.

## Development

This package is built with **tsdown** for a React library (`platform: neutral`, `pnpm build`).

## How to provide styles?

This scaffold supports **CSS-based styling** via stylesheet imports (CSS, CSS Modules, SCSS, etc.). Prefer that path unless your use case clearly needs something else.

### 1) Stylesheet (CSS, CSS Modules, SCSS, etc.)

Import styles from library source; tsdown emits a CSS file in `dist` on build (default: `style.css`). Expose it from `package.json` when publishing:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/style.css"
  }
}
```

Consumers can import:

```javascript
import { Component } from "{package-name}";
import "{package-name}/style.css";
```

### 2) CSS-in-JS

If stylesheet-based styling does not fit your requirements, consider CSS-in-JS as an alternative. Bundle externals may need tuning for your CSS-in-JS library.
