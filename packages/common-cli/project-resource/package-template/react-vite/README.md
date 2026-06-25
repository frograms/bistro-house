# {project-name}

{project-description}

Created by [@watcha-authentic/common-cli](https://www.npmjs.com/package/@watcha-authentic/common-cli) create-package command.

## Development

This package is built as a **Vite library** (`vite build` with `build.lib`).

With the default `sandbox` scaffold (`--react-vite-mode sandbox`), `index.html` and `pnpm dev` are included for local preview. They are not published to npm (`files: ["dist"]`).

Use `--react-vite-mode library-only` when you only need library build output (no in-package dev app).

## How to provide styles?

This scaffold is set up for **CSS-based styling by default** (stylesheet imports). Prefer that path unless your use case clearly needs something else.

### 1) Stylesheet (CSS, CSS Modules, SCSS, etc.)

Import styles from library source; Vite emits a CSS file in `dist` on build. Expose it from `package.json` when publishing:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
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
