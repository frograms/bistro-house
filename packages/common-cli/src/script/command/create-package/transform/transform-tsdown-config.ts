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

const createCssProperty = (): ts.PropertyAssignment =>
  ts.factory.createPropertyAssignment(
    "css",
    ts.factory.createObjectLiteralExpression(
      [ts.factory.createPropertyAssignment("minify", ts.factory.createTrue())],
      false
    )
  );

const hasCssProperty = (objectLiteral: ts.ObjectLiteralExpression): boolean =>
  objectLiteral.properties.some(
    (property) =>
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === "css"
  );

const patchSharedConfigVariable = (
  node: ts.VariableDeclaration
): ts.VariableDeclaration => {
  if (
    !ts.isIdentifier(node.name) ||
    node.name.text !== SHARED_CONFIG_NAME ||
    !node.initializer ||
    !ts.isObjectLiteralExpression(node.initializer) ||
    hasCssProperty(node.initializer)
  ) {
    return node;
  }

  const cssProperty = createCssProperty();
  const newInitializer = ts.factory.updateObjectLiteralExpression(
    node.initializer,
    [cssProperty, ...node.initializer.properties]
  );

  return ts.factory.updateVariableDeclaration(
    node,
    node.name,
    node.exclamationToken,
    node.type,
    newInitializer
  );
};

export const patchSharedConfigCss = (sourceText: string): string => {
  const sourceFile = ts.createSourceFile(
    "tsdown.config.mts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  let foundSharedConfig = false;
  let didPatch = false;

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

        const patchedNode = patchSharedConfigVariable(node);
        if (patchedNode !== node) {
          didPatch = true;
        }
        return patchedNode;
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (sourceFile) => ts.visitNode(sourceFile, visit) as ts.SourceFile;
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

  if (!didPatch) {
    return sourceText;
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return printer.printFile(transformedFile);
};

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
  fs.writeFileSync(configPath, patchSharedConfigCss(sourceText));
};
