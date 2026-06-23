import fs from "fs-extra";
import path from "path";

export const resolvePath = (filePath: string, baseDir: string): string => {
  return path.isAbsolute(filePath) ? filePath : path.resolve(baseDir, filePath);
};

export const overwriteFile = (
  path: string,
  overwrites: { [key: string]: string }
) => {
  if (!fs.existsSync(path)) {
    console.warn(`⚠️  경로에 파일이 없습니다: ${path}`);
    return;
  }

  let fileContent = fs.readFileSync(path).toString();

  const entries = Object.entries(overwrites);
  for (const [key, value] of entries) {
    fileContent = fileContent.replace(new RegExp(`{${key}}`, "g"), value);
  }

  fs.writeFileSync(path, fileContent);
};

const PLACEHOLDER_SKIP_DIRS = new Set([
  ".git",
  ".turbo",
  "dist",
  "node_modules",
]);

/** outputDir 트리 하위 파일에 overwriteFile 적용 */
export const overwritePlaceholdersInDir = (
  dir: string,
  overwrites: Record<string, string>
) => {
  if (!fs.existsSync(dir) || Object.keys(overwrites).length === 0) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isSymbolicLink()) continue;

    if (entry.isDirectory()) {
      if (PLACEHOLDER_SKIP_DIRS.has(entry.name)) continue;
      overwritePlaceholdersInDir(fullPath, overwrites);
      continue;
    }

    if (!entry.isFile()) continue;

    overwriteFile(fullPath, overwrites);
  }
};

export const loadJsonFromFile = <T = Record<string, unknown>>(
  path: string
): T => {
  const fileContent = fs.readFileSync(path).toString();
  return JSON.parse(fileContent);
};

export const createFolder = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};
