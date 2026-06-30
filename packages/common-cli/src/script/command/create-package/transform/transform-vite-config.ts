import fs from "fs-extra";
import path from "path";
import ts from "typescript";

import {
  type CreatePackageType,
  isVitePackageType,
  type PackageStyle,
} from "../../../constant/create-package";

const VANILLA_EXTRACT_VITE_MODULE = "@vanilla-extract/vite-plugin";

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
    ts.factory.createStringLiteral(VANILLA_EXTRACT_VITE_MODULE)
  );

const hasVanillaExtractImport = (sourceFile: ts.SourceFile): boolean =>
  sourceFile.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === VANILLA_EXTRACT_VITE_MODULE
  );

const patchPluginsProperty = (
  property: ts.PropertyAssignment
): ts.PropertyAssignment => {
  if (
    !ts.isIdentifier(property.name) ||
    property.name.text !== "plugins" ||
    !ts.isArrayLiteralExpression(property.initializer)
  ) {
    return property;
  }

  const hasVanillaExtractPlugin = property.initializer.elements.some(
    (element) =>
      ts.isCallExpression(element) &&
      ts.isIdentifier(element.expression) &&
      element.expression.text === "vanillaExtractPlugin"
  );

  if (hasVanillaExtractPlugin) {
    return property;
  }

  const vanillaExtractCall = ts.factory.createCallExpression(
    ts.factory.createIdentifier("vanillaExtractPlugin"),
    undefined,
    []
  );

  const [firstElement, ...restElements] = property.initializer.elements;
  const newElements =
    firstElement === undefined
      ? [vanillaExtractCall]
      : [firstElement, vanillaExtractCall, ...restElements];

  return ts.factory.updatePropertyAssignment(
    property,
    property.name,
    ts.factory.updateArrayLiteralExpression(property.initializer, newElements)
  );
};

export const patchViteConfigVanillaExtract = (sourceText: string): string => {
  const sourceFile = ts.createSourceFile(
    "vite.config.ts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  let foundPlugins = false;
  let didPatch = false;

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visit: ts.Visitor = (node) => {
      if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
        if (node.name.text === "plugins") {
          foundPlugins = true;
        }

        const patchedNode = patchPluginsProperty(node);
        if (patchedNode !== node) {
          didPatch = true;
        }
        return patchedNode;
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (sourceFile) => {
      let transformedFile = ts.visitNode(sourceFile, visit) as ts.SourceFile;

      if (!hasVanillaExtractImport(transformedFile) && didPatch) {
        transformedFile = ts.factory.updateSourceFile(transformedFile, [
          createVanillaExtractImport(),
          ...transformedFile.statements,
        ]);
      }

      return transformedFile;
    };
  };

  const { transformed } = ts.transform(sourceFile, [transformer]);
  const transformedFile = transformed[0];

  if (!transformedFile || !ts.isSourceFile(transformedFile)) {
    throw new Error("vite config AST 변환에 실패했습니다.");
  }

  if (!foundPlugins) {
    throw new Error("vite config 에 plugins 배열을 찾을 수 없습니다.");
  }

  if (!didPatch && hasVanillaExtractImport(transformedFile)) {
    return sourceText;
  }

  if (!didPatch) {
    return sourceText;
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return printer.printFile(transformedFile);
};

/**
 * - type 및 style 값에 따라 vite config 를 패치 합니다.
 */
export const applyTransformViteConfig = ({
  outputDir,
  packageType,
  style,
}: {
  outputDir: string;
  packageType: CreatePackageType;
  style: PackageStyle | undefined;
}) => {
  if (!isVitePackageType(packageType) || style !== "vanilla-extract") {
    return;
  }

  const configPath = path.join(outputDir, "vite.config.ts");

  if (!fs.existsSync(configPath)) {
    throw new Error(`vite.config.ts 를 찾을 수 없습니다: ${configPath}`);
  }

  const sourceText = fs.readFileSync(configPath, "utf8");
  fs.writeFileSync(configPath, patchViteConfigVanillaExtract(sourceText));
};
