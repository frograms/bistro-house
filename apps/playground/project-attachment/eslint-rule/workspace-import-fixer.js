import fs from "fs";
import path from "path";
import ts from "typescript";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, "../../../..");
const PACKAGES_DIR = path.resolve(WORKSPACE_ROOT, "packages");
const PACKAGE_NAME_PREFIX = "@watcha-authentic/";
const DIRECT_IMPORT_PREFIX = "@packages/";

const exportCache = new Map();

/** @watcha-authentic/<package> 형식에서 workspace 디렉터리 이름만 추출한다. */
const getPackageDirectoryName = (packageName) => {
  return packageName.replace(PACKAGE_NAME_PREFIX, "");
};

/** playground에서 직접 접근 대상으로 보는 workspace 패키지명인지 확인한다. */
const isWorkspacePackageName = (packageName) => {
  const packageDirectoryName = packageName.slice(PACKAGE_NAME_PREFIX.length);

  return (
    packageName.startsWith(PACKAGE_NAME_PREFIX) &&
    packageDirectoryName.length > 0 &&
    !packageDirectoryName.includes("/")
  );
};

/** fixer 대상 import source를 workspace 패키지 디렉터리 정보로 변환한다. */
const parseImportSource = (source) => {
  if (isWorkspacePackageName(source)) {
    return {
      packageDirectoryName: getPackageDirectoryName(source),
    };
  }

  const directImportMatch = source.match(/^@packages\/([^/]+)(?:\/src)?$/);

  if (directImportMatch?.[1]) {
    return {
      packageDirectoryName: directImportMatch[1],
    };
  }

  return null;
};

/** 확장자가 생략된 source 경로를 실제 파일 경로로 해석한다. */
const resolveSourceFilePath = (filePathWithoutExtension) => {
  const possibleExtensions = ["", ".ts", ".tsx", ".js", ".jsx"];

  for (const extension of possibleExtensions) {
    const filePath = `${filePathWithoutExtension}${extension}`;

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  }

  return null;
};

/** src 디렉터리 기준 직접 import에 사용할 확장자 없는 경로로 정규화한다. */
const getNormalizedSourcePath = (sourceDirectory, filePath) => {
  return path
    .relative(sourceDirectory, filePath)
    .replace(/\\/g, "/")
    .replace(/\.(ts|tsx|js|jsx)$/, "");
};

/** export * from "./foo"가 가리키는 파일에서 named export 목록을 추출한다. */
const extractExportsFromFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const exportNames = [];
  const exportPatterns = [
    /export\s+const\s+([A-Za-z_$][\w$]*)\b/g,
    /export\s+function\s+([A-Za-z_$][\w$]*)\b/g,
    /export\s+class\s+([A-Za-z_$][\w$]*)\b/g,
    /export\s+(?:interface|type|enum)\s+([A-Za-z_$][\w$]*)\b/g,
  ];

  for (const exportPattern of exportPatterns) {
    let match;

    while ((match = exportPattern.exec(content)) !== null) {
      exportNames.push(match[1]);
    }
  }

  const namedExportPattern = /export\s*\{([^}]+)\}/g;
  let namedExportMatch;

  while ((namedExportMatch = namedExportPattern.exec(content)) !== null) {
    const names = namedExportMatch[1]
      .split(",")
      .map((name) =>
        name
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0]
          .trim()
      )
      .filter(Boolean);

    exportNames.push(...names);
  }

  return exportNames.filter((exportName) => exportName !== "default");
};

/** src/index.ts의 source 있는 public re-export를 export 이름별 직접 경로 정보로 수집한다. */
const parseIndexExports = (indexPath) => {
  if (!fs.existsSync(indexPath)) {
    return new Map();
  }

  const indexContent = fs.readFileSync(indexPath, "utf-8");
  const indexDirectory = path.dirname(indexPath);
  const sourceFile = ts.createSourceFile(
    indexPath,
    indexContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const exports = new Map();

  for (const statement of sourceFile.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      statement.moduleSpecifier == null ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      continue;
    }

    const reExportSource = statement.moduleSpecifier.text;
    const sourceFilePath = resolveSourceFilePath(
      path.resolve(indexDirectory, reExportSource)
    );

    if (sourceFilePath == null) {
      continue;
    }

    const sourcePath = getNormalizedSourcePath(indexDirectory, sourceFilePath);
    const { exportClause } = statement;

    if (exportClause == null) {
      const exportNames = extractExportsFromFile(sourceFilePath);

      for (const exportName of exportNames) {
        exports.set(exportName, {
          importedName: exportName,
          isTypeOnly: false,
          kind: "named",
          sourcePath,
        });
      }

      continue;
    }

    if (ts.isNamedExports(exportClause)) {
      for (const exportSpecifier of exportClause.elements) {
        const exportedName = exportSpecifier.name.text;
        const importedName =
          exportSpecifier.propertyName?.text ?? exportedName;

        exports.set(exportedName, {
          importedName,
          isTypeOnly: statement.isTypeOnly || exportSpecifier.isTypeOnly,
          kind: "named",
          sourcePath,
        });
      }

      continue;
    }

    if (ts.isNamespaceExport(exportClause)) {
      const exportedName = exportClause.name.text;

      exports.set(exportedName, {
        importedName: exportedName,
        isTypeOnly: statement.isTypeOnly,
        kind: "namespace",
        sourcePath,
      });
    }
  }

  return exports;
};

/** 패키지의 public export 이름을 직접 import 생성에 필요한 정보로 찾는다. */
const findExportInfo = (packageDirectoryName, exportName) => {
  const cacheKey = `${packageDirectoryName}:${exportName}`;

  if (exportCache.has(cacheKey)) {
    return exportCache.get(cacheKey);
  }

  const packagePath = path.resolve(PACKAGES_DIR, packageDirectoryName);
  const indexPath = path.resolve(packagePath, "src/index.ts");
  const exports = parseIndexExports(indexPath);
  const exportInfo = exports.get(exportName) ?? null;

  exportCache.set(cacheKey, exportInfo);

  return exportInfo;
};

/** ImportSpecifier의 imported 이름을 원본 코드 텍스트 기준으로 읽는다. */
const getSpecifierImportName = (sourceCode, specifier) => {
  return sourceCode.getText(specifier.imported);
};

/** import type 선언 또는 type specifier인지 확인한다. */
const isTypeSpecifier = (node, specifier) => {
  return node.importKind === "type" || specifier.importKind === "type";
};

/** 하나의 named import specifier를 직접 import에서 사용할 텍스트로 만든다. */
const createImportSpecifierText = (sourceCode, node, specifier, exportInfo) => {
  const { importedName } = exportInfo;
  const localName = sourceCode.getText(specifier.local);
  const typePrefix =
    isTypeSpecifier(node, specifier) || exportInfo.isTypeOnly ? "type " : "";

  if (importedName === localName) {
    return `${typePrefix}${importedName}`;
  }

  return `${typePrefix}${importedName} as ${localName}`;
};

/** 같은 source로 묶인 specifier 그룹을 import declaration 텍스트로 만든다. */
const createDirectImportText = (group) => {
  if (group.kind === "namespace") {
    const typePrefix = group.isTypeOnly ? "type " : "";

    return `import ${typePrefix}* as ${group.localName} from "${group.source}";`;
  }

  const hasOnlyTypeSpecifiers = group.specifiers.every((specifier) =>
    specifier.startsWith("type ")
  );

  if (hasOnlyTypeSpecifiers) {
    const specifiers = group.specifiers.map((specifier) =>
      specifier.replace(/^type\s+/, "")
    );

    return `import type { ${specifiers.join(", ")} } from "${group.source}";`;
  }

  return `import { ${group.specifiers.join(", ")} } from "${group.source}";`;
};

/** 기존 import declaration의 specifier들을 직접 경로 import 그룹으로 재구성한다. */
const createDirectImportGroups = (sourceCode, node, packageDirectoryName) => {
  const groups = new Map();

  for (const specifier of node.specifiers) {
    if (specifier.type !== "ImportSpecifier") {
      return null;
    }

    const exportName = getSpecifierImportName(sourceCode, specifier);
    const exportInfo = findExportInfo(packageDirectoryName, exportName);

    if (exportInfo == null) {
      return null;
    }

    const directSource = `${DIRECT_IMPORT_PREFIX}${packageDirectoryName}/src/${exportInfo.sourcePath}`;

    if (exportInfo.kind === "namespace") {
      const localName = sourceCode.getText(specifier.local);
      const isTypeOnly = isTypeSpecifier(node, specifier);
      const groupKey = `namespace:${directSource}:${localName}:${isTypeOnly}`;

      groups.set(groupKey, {
        isTypeOnly,
        kind: "namespace",
        localName,
        source: directSource,
      });

      continue;
    }

    const groupKey = `named:${directSource}`;
    const group = groups.get(groupKey) ?? {
      kind: "named",
      source: directSource,
      specifiers: [],
    };

    group.specifiers.push(
      createImportSpecifierText(sourceCode, node, specifier, exportInfo)
    );
    groups.set(groupKey, group);
  }

  return [...groups.values()];
};

const rule = {
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      ImportDeclaration(node) {
        const source = node.source.value;

        if (typeof source !== "string") {
          return;
        }

        const importSourceInfo = parseImportSource(source);

        if (importSourceInfo == null) {
          return;
        }

        const directImportGroups = createDirectImportGroups(
          sourceCode,
          node,
          importSourceInfo.packageDirectoryName
        );

        context.report({
          data: {
            source,
          },
          fix:
            directImportGroups == null
              ? null
              : (fixer) => {
                  const directImportText = directImportGroups
                    .map(createDirectImportText)
                    .join("\n");

                  return fixer.replaceText(node, directImportText);
                },
          messageId:
            directImportGroups == null
              ? "useDirectPathWithoutFix"
              : "useDirectPath",
          node: node.source,
        });
      },
    };
  },
  meta: {
    fixable: "code",
    messages: {
      useDirectPath:
        "{{source}} import는 @packages/<package>/src/<file> 직접 경로로 작성해야 합니다.",
      useDirectPathWithoutFix:
        "{{source}} import는 직접 경로로 작성해야 합니다. 자동 수정할 export 경로를 찾지 못했습니다.",
    },
    type: "problem",
  },
};

/**
 * src/index.ts의 source 있는 public re-export만 직접 경로 변환 대상으로 삼는다.
 *
 * 지원:
 * - export * from "./foo"
 * - export { Foo } from "./foo"
 * - export type { Foo } from "./foo"
 * - export { Foo as Bar } from "./foo"
 * - export * as Foo from "./foo"
 */
export default {
  rules: {
    "use-direct-path": rule,
  },
};
