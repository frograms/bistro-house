import {
  type ComponentProps,
  isValidElement,
  type ReactNode,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";

import { commonPlaygroundExampleCss } from "./common-playground-example.css";

type CommonPlaygroundReadmeProps = {
  markdown: string;
};

type MarkdownPreProps = ComponentProps<"pre"> & {
  node?: unknown;
};

const TABLE_OF_CONTENTS_TITLE = "Table of contents";

const getNodeText = (node: ReactNode): string => {
  if (typeof node === "number" || typeof node === "string") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => getNodeText(child)).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }

  return "";
};

const getTocDataAttributes = (children: ReactNode, depth: 3 | 4) => {
  const title = getNodeText(children);

  if (title === TABLE_OF_CONTENTS_TITLE) {
    return {};
  }

  return {
    "data-playground-toc": "true",
    "data-playground-toc-depth": depth,
    "data-playground-toc-title": title,
  };
};

const CommonPlaygroundReadmePre = ({
  children,
  node: _node,
  ...props
}: MarkdownPreProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const code = getNodeText(children);

  const handleCopyClick = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    window.setTimeout(() => {
      setIsCopied(false);
    }, 1400);
  };

  return (
    <div className={commonPlaygroundExampleCss.readmeCodeBlock}>
      <button
        data-copied={isCopied ? "true" : "false"}
        type="button"
        onClick={handleCopyClick}>
        {isCopied ? "복사 완료" : "복사"}
      </button>
      <pre {...props}>{children}</pre>
    </div>
  );
};

export const CommonPlaygroundReadme = ({
  markdown,
}: CommonPlaygroundReadmeProps) => {
  return (
    <section
      className={commonPlaygroundExampleCss.readmeDocument}
      data-playground-toc="true"
      data-playground-toc-depth="2"
      data-playground-toc-title="Documentation"
      id="documentation">
      <div className={commonPlaygroundExampleCss.readmeHeader}>
        <p className={commonPlaygroundExampleCss.exampleLabel}>Documentation</p>
      </div>

      <div className={commonPlaygroundExampleCss.readmeBody}>
        <ReactMarkdown
          components={{
            h2: ({ children, node: _node, ...props }) => (
              <h2 {...props} {...getTocDataAttributes(children, 3)}>
                {children}
              </h2>
            ),
            h3: ({ children, node: _node, ...props }) => (
              <h3 {...props} {...getTocDataAttributes(children, 4)}>
                {children}
              </h3>
            ),
            pre: CommonPlaygroundReadmePre,
          }}
          rehypePlugins={[rehypeSlug]}>
          {markdown}
        </ReactMarkdown>
      </div>
    </section>
  );
};
