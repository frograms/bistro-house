import { commonExampleCss } from "@playground/component/view/_common/common-example.css";
import type { ReactNode } from "react";

type CommonContainerProps = {
  children: ReactNode;
};

export const CommonContainer = ({ children }: CommonContainerProps) => {
  return <main className={commonExampleCss.packagePlayground}>{children}</main>;
};
