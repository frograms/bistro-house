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
