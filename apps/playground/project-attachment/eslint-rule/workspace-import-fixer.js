/**
 * ESLint rule to fix workspace package imports to use direct paths
 * Dynamically finds export paths by scanning package source files
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get workspace root (3 levels up from this file: project-attachment/eslint-rule/ -> apps/playground/ -> apps/ -> root)
const WORKSPACE_ROOT = path.resolve(__dirname, "../../../..");
const PACKAGES_DIR = path.resolve(WORKSPACE_ROOT, "packages");

// Cache for export mappings
const exportCache = new Map();

/**
 * Check if a package is an internal workspace package (excluding eslint-config, prettier-config)
 */
function isInternalWorkspacePackage(packageName) {
  if (!packageName.startsWith("@watcha-authentic/")) {
    return false;
  }

  // Exclude lint/prettier config packages
  if (
    packageName.includes("eslint-config") ||
    packageName.includes("prettier-config")
  ) {
    return false;
  }

  return true;
}

/**
 * Get package directory path from package name
 */
function getPackagePath(packageName) {
  const packageDirName = packageName.replace("@watcha-authentic/", "");
  return path.resolve(PACKAGES_DIR, packageDirName);
}

/**
 * Parse index.ts to find export * from statements
 */
function parseIndexExports(indexPath) {
  if (!fs.existsSync(indexPath)) {
    return null;
  }

  const content = fs.readFileSync(indexPath, "utf-8");
  const exports = new Map();

  // Match: export * from "./path/to/file"
  const exportRegex = /export\s+\*\s+from\s+["']([^"']+)["']/g;
  let match;

  while ((match = exportRegex.exec(content)) !== null) {
    const exportPath = match[1];
    // Resolve relative path from index.ts directory
    const indexDir = path.dirname(indexPath);
    const fullPath = path.resolve(indexDir, exportPath);

    // Try to find the actual file
    const possibleExtensions = ["", ".ts", ".tsx", ".js", ".jsx"];
    let filePath = null;

    for (const ext of possibleExtensions) {
      const testPath = fullPath + ext;
      if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
        filePath = testPath;
        break;
      }
    }

    if (filePath) {
      // Get relative path from src directory (indexPath is in src/)
      const srcDir = path.dirname(indexPath);
      const relativePath = path.relative(srcDir, filePath);
      const normalizedPath = relativePath
        .replace(/\\/g, "/")
        .replace(/\.(ts|tsx|js|jsx)$/, "");

      // Extract export names from the file
      const fileExports = extractExportsFromFile(filePath);
      fileExports.forEach((exportName) => {
        if (exportName && exportName !== "default") {
          exports.set(exportName, normalizedPath);
        }
      });
    } else {
      // If file not found, try to use the export path directly as a directory path
      // This handles cases where the path points to a directory with an index file
      const dirPath = fullPath;
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        const indexFiles = ["index.ts", "index.tsx", "index.js", "index.jsx"];
        for (const indexFile of indexFiles) {
          const indexPath = path.join(dirPath, indexFile);
          if (fs.existsSync(indexPath)) {
            const srcDir = path.dirname(indexPath);
            const relativePath = path.relative(srcDir, indexPath);
            const normalizedPath = relativePath
              .replace(/\\/g, "/")
              .replace(/\.(ts|tsx|js|jsx)$/, "")
              .replace(/\/index$/, "");

            const fileExports = extractExportsFromFile(indexPath);
            fileExports.forEach((exportName) => {
              if (exportName && exportName !== "default") {
                exports.set(exportName, normalizedPath);
              }
            });
            break;
          }
        }
      }
    }
  }

  return exports;
}

/**
 * Extract export names from a TypeScript/JavaScript file
 */
function extractExportsFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const exports = [];

  // Match: export const name = ... (including multiline with forwardRef)
  const constExportRegex = /export\s+const\s+(\w+)\s*=/g;
  let match;
  while ((match = constExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Match: export function name
  const functionExportRegex = /export\s+function\s+(\w+)/g;
  while ((match = functionExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Match: export class name
  const classExportRegex = /export\s+class\s+(\w+)/g;
  while ((match = classExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Match: export interface/type/enum name
  const typeExportRegex = /export\s+(?:interface|type|enum)\s+(\w+)/g;
  while ((match = typeExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Match: export { name1, name2 } or export { name1 as alias }
  const exportObjectRegex = /export\s*\{([^}]+)\}/g;
  while ((match = exportObjectRegex.exec(content)) !== null) {
    const names = match[1]
      .split(",")
      .map((n) =>
        n
          .trim()
          .split(/\s+as\s+/)[0]
          .trim()
      )
      .filter((n) => n && !n.startsWith("type "));
    exports.push(...names);
  }

  // Match: export default
  if (/export\s+default/.test(content)) {
    exports.push("default");
  }

  return exports;
}

/**
 * Find export path for a given package and export name
 */
function findExportPath(packageName, exportName) {
  const cacheKey = `${packageName}:${exportName}`;
  if (exportCache.has(cacheKey)) {
    return exportCache.get(cacheKey);
  }

  const packagePath = getPackagePath(packageName);
  if (!fs.existsSync(packagePath)) {
    return null;
  }

  const indexPath = path.resolve(packagePath, "src/index.ts");
  if (!fs.existsSync(indexPath)) {
    return null;
  }

  const exports = parseIndexExports(indexPath);

  if (exports && exports.has(exportName)) {
    const exportPath = exports.get(exportName);
    exportCache.set(cacheKey, exportPath);
    return exportPath;
  }

  // Fallback: try to find file by name convention
  // e.g., Slider -> component/view/slider
  const srcPath = path.resolve(packagePath, "src");
  if (fs.existsSync(srcPath)) {
    const foundPath = findFileByExportName(srcPath, exportName, "");
    if (foundPath) {
      exportCache.set(cacheKey, foundPath);
      return foundPath;
    }
  }

  return null;
}

/**
 * Recursively find file that might export the given name
 */
function findFileByExportName(dir, exportName, currentPath) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      const found = findFileByExportName(
        path.join(dir, entry.name),
        exportName,
        subPath
      );
      if (found) return found;
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const filePath = path.join(dir, entry.name);
      const exports = extractExportsFromFile(filePath);

      // Check if file name matches export name (case-insensitive)
      const fileName = entry.name.replace(/\.(ts|tsx|js|jsx)$/, "");
      if (
        exports.includes(exportName) ||
        fileName.toLowerCase() === exportName.toLowerCase() ||
        fileName.toLowerCase().replace(/-/g, "") === exportName.toLowerCase()
      ) {
        const relativePath = currentPath
          ? `${currentPath}/${fileName}`
          : fileName;
        return relativePath;
      }
    }
  }

  return null;
}

const rule = {
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;

        // Check if it's an internal workspace package
        if (!isInternalWorkspacePackage(source)) {
          return;
        }

        // Skip if already using direct path (contains / after package name)
        if (source.includes("/") && source !== source.split("/")[0]) {
          return;
        }

        // Find the first named import
        const firstSpecifier = node.specifiers.find(
          (s) => s.type === "ImportSpecifier"
        );

        if (firstSpecifier) {
          const exportName = firstSpecifier.imported.name;
          const directPath = findExportPath(source, exportName);

          if (directPath) {
            const suggestedPath = `${source}/${directPath}`;

            context.report({
              data: { suggestedPath },
              fix(fixer) {
                // Replace the import source
                return fixer.replaceText(node.source, `"${suggestedPath}"`);
              },
              messageId: "useDirectPath",
              node: node.source,
            });
          } else {
            // If export not found, suggest checking the package structure
            context.report({
              data: {
                suggestedPath: `${source}/... (직접 경로를 지정해주세요)`,
              },
              messageId: "useDirectPath",
              node: node.source,
            });
          }
        }
      },
    };
  },
  meta: {
    fixable: "code",
    messages: {
      useDirectPath:
        "workspace 패키지는 직접 경로로 임포트해야 합니다. {{suggestedPath}}",
    },
    type: "problem",
  },
};

export default {
  rules: {
    "use-direct-path": rule,
  },
};
