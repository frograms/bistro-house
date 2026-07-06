import { commonContainerCss } from "@playground/component/view/_common/common-container.css";
import type { ReactNode } from "react";

type CommonContainerProps = {
  children: ReactNode;
};

export const CommonContainer = ({ children }: CommonContainerProps) => {
  return <main className={commonContainerCss.container}>{children}</main>;
};
