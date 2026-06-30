import fs from "fs-extra";
import path from "path";
import ts from "typescript";

import {
  type CreatePackageType,
  isPackageStyle,
  isTsdownPackageType,
  type PackageStyle,
} from "../../../constant/create-package";

const SHARED_CONFIG_NAME = "sharedConfig";
const VANILLA_EXTRACT_ROLLUP_MODULE = "@vanilla-extract/rollup-plugin";

const createCssProperty = (): ts.PropertyAssignment =>
  ts.factory.createPropertyAssignment(
    "css",
    ts.factory.createObjectLiteralExpression(
      [ts.factory.createPropertyAssignment("minify", ts.factory.createTrue())],
      false
    )
  );

const createVanillaExtractPluginsProperty = (): ts.PropertyAssignment =>
  ts.factory.createPropertyAssignment(
    "plugins",
    ts.factory.createArrayLiteralExpression([
      ts.factory.createCallExpression(
        ts.factory.createIdentifier("vanillaExtractPlugin"),
        undefined,
        []
      ),
    ])
  );

const getPropertyNameText = (name: ts.PropertyName): string | undefined => {
  if (ts.isIdentifier(name)) {
    return name.text;
  }

  if (ts.isStringLiteral(name)) {
    return name.text;
  }

  return undefined;
};

const hasProperty = (
  objectLiteral: ts.ObjectLiteralExpression,
  name: string
): boolean =>
  objectLiteral.properties.some(
    (property) =>
      ts.isPropertyAssignment(property) &&
      getPropertyNameText(property.name) === name
  );

const patchSharedConfigProperty = ({
  node,
  property,
}: {
  node: ts.VariableDeclaration;
  property: ts.PropertyAssignment;
}): ts.VariableDeclaration => {
  if (
    !ts.isIdentifier(node.name) ||
    node.name.text !== SHARED_CONFIG_NAME ||
    !node.initializer ||
    !ts.isObjectLiteralExpression(node.initializer) ||
    hasProperty(node.initializer, getPropertyNameText(property.name) ?? "")
  ) {
    return node;
  }

  const newInitializer = ts.factory.updateObjectLiteralExpression(
    node.initializer,
    [property, ...node.initializer.properties]
  );

  return ts.factory.updateVariableDeclaration(
    node,
    node.name,
    node.exclamationToken,
    node.type,
    newInitializer
  );
};

const createVanillaExtractImport = (): ts.ImportDeclaration =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      undefined,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier("vanillaExtractPlugin")
        ),
      ])
    ),
    ts.factory.createStringLiteral(VANILLA_EXTRACT_ROLLUP_MODULE)
  );

const hasVanillaExtractImport = (sourceFile: ts.SourceFile): boolean =>
  sourceFile.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === VANILLA_EXTRACT_ROLLUP_MODULE
  );

const transformSourceFile = ({
  addImport,
  patchProperty,
  sourceText,
}: {
  addImport?: () => ts.ImportDeclaration;
  patchProperty: ts.PropertyAssignment;
  sourceText: string;
}): string => {
  const sourceFile = ts.createSourceFile(
    "tsdown.config.mts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  let foundSharedConfig = false;
  let didPatch = false;
  let didAddImport = false;

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visit: ts.Visitor = (node) => {
      if (ts.isVariableDeclaration(node)) {
        if (
          ts.isIdentifier(node.name) &&
          node.name.text === SHARED_CONFIG_NAME &&
          node.initializer &&
          ts.isObjectLiteralExpression(node.initializer)
        ) {
          foundSharedConfig = true;
        }

        const patchedNode = patchSharedConfigProperty({
          node,
          property: patchProperty,
        });
        if (patchedNode !== node) {
          didPatch = true;
        }
        return patchedNode;
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (sourceFile) => {
      let transformedFile = ts.visitNode(sourceFile, visit) as ts.SourceFile;

      if (addImport && !hasVanillaExtractImport(transformedFile) && didPatch) {
        transformedFile = ts.factory.updateSourceFile(transformedFile, [
          addImport(),
          ...transformedFile.statements,
        ]);
        didAddImport = true;
      }

      return transformedFile;
    };
  };

  const { transformed } = ts.transform(sourceFile, [transformer]);
  const transformedFile = transformed[0];

  if (!transformedFile || !ts.isSourceFile(transformedFile)) {
    throw new Error("tsdown config AST 변환에 실패했습니다.");
  }

  if (!foundSharedConfig) {
    throw new Error(
      `tsdown config 에 ${SHARED_CONFIG_NAME} 객체를 찾을 수 없습니다.`
    );
  }

  if (!didPatch && !didAddImport) {
    return sourceText;
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return printer.printFile(transformedFile);
};

export const patchSharedConfigCss = (sourceText: string): string =>
  transformSourceFile({
    patchProperty: createCssProperty(),
    sourceText,
  });

export const patchSharedConfigVanillaExtract = (sourceText: string): string =>
  transformSourceFile({
    addImport: createVanillaExtractImport,
    patchProperty: createVanillaExtractPluginsProperty(),
    sourceText,
  });

const patchTsdownConfigByStyle = ({
  sourceText,
  style,
}: {
  sourceText: string;
  style: PackageStyle;
}): string => {
  if (style === "vanilla-extract") {
    return patchSharedConfigVanillaExtract(sourceText);
  }

  return patchSharedConfigCss(sourceText);
};

/**
 * - type 및 style 값에 따라 tsdown config 를 패치 합니다.
 */
export const applyTransformTsdownConfig = ({
  outputDir,
  packageType,
  style,
}: {
  outputDir: string;
  packageType: CreatePackageType;
  style: PackageStyle | undefined;
}) => {
  if (!isTsdownPackageType(packageType) || !isPackageStyle(style)) {
    return;
  }

  const configPath = path.join(outputDir, "tsdown.config.mts");

  if (!fs.existsSync(configPath)) {
    throw new Error(`tsdown.config.mts 를 찾을 수 없습니다: ${configPath}`);
  }

  const sourceText = fs.readFileSync(configPath, "utf8");
  fs.writeFileSync(configPath, patchTsdownConfigByStyle({ sourceText, style }));
};
