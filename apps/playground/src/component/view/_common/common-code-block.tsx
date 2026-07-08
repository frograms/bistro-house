import { commonCodeBlockCss } from "@playground/component/view/_common/common-code-block.css";

type CommonCodeBlockProps = {
  code: string;
};

export const CommonCodeBlock = ({ code }: CommonCodeBlockProps) => {
  return (
    <pre className={commonCodeBlockCss.wrap}>
      <code>{code}</code>
    </pre>
  );
};
