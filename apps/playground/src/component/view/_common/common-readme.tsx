import {
  type ComponentProps,
  isValidElement,
  type ReactNode,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";

import { commonExampleCss } from "./common-example.css";

type CommonReadmeProps = {
  markdown: string;
};

type MarkdownPreProps = ComponentProps<"pre"> & {
  node?: unknown;
};

type TocHeadingDepth = 1 | 2 | 3 | 4;

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

const getTocDataAttributes = (children: ReactNode, depth: TocHeadingDepth) => {
  const title = getNodeText(children);

  return {
    "data-playground-toc": "true",
    "data-playground-toc-depth": depth,
    "data-playground-toc-title": title,
  };
};

const CommonReadmePre = ({
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
    <div className={commonExampleCss.readmeCodeBlock}>
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

export const CommonReadme = ({ markdown }: CommonReadmeProps) => {
  return (
    <section className={commonExampleCss.readmeDocument}>
      <div className={commonExampleCss.readmeBody}>
        <ReactMarkdown
          components={{
            h1: ({ children, node: _node, ...props }) => (
              <h1 {...props} {...getTocDataAttributes(children, 1)}>
                {children}
              </h1>
            ),
            h2: ({ children, node: _node, ...props }) => (
              <h2 {...props} {...getTocDataAttributes(children, 2)}>
                {children}
              </h2>
            ),
            h3: ({ children, node: _node, ...props }) => (
              <h3 {...props} {...getTocDataAttributes(children, 3)}>
                {children}
              </h3>
            ),
            h4: ({ children, node: _node, ...props }) => (
              <h4 {...props} {...getTocDataAttributes(children, 4)}>
                {children}
              </h4>
            ),
            pre: CommonReadmePre,
          }}
          rehypePlugins={[rehypeSlug]}>
          {markdown}
        </ReactMarkdown>
      </div>
    </section>
  );
};
