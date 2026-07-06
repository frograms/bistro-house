import { commonExampleCss } from "@playground/component/view/_common/common-example.css";
import type { ReactNode } from "react";

type CommonExampleControlPanelProps = {
  children: ReactNode;
};

type CommonExampleStagePanelProps = {
  children: ReactNode;
  className?: string;
};

type CommonExampleStatePanelItem = {
  label: ReactNode;
  value: ReactNode;
};

type CommonExampleStatePanelProps = {
  items: Array<CommonExampleStatePanelItem>;
};

export const CommonExampleControlPanel = ({
  children,
}: CommonExampleControlPanelProps) => {
  return (
    <div className={commonExampleCss.controlPanel}>
      <p className={commonExampleCss.controlPanelTitle}>컨트롤</p>
      {children}
    </div>
  );
};

export const CommonExampleStagePanel = ({
  children,
  className,
}: CommonExampleStagePanelProps) => {
  return (
    <div
      className={[commonExampleCss.exampleStagePanel, className]
        .filter(Boolean)
        .join(" ")}>
      {children}
    </div>
  );
};

export const CommonExampleStatePanel = ({
  items,
}: CommonExampleStatePanelProps) => {
  return (
    <dl className={commonExampleCss.statePanel}>
      <div className={commonExampleCss.statePanelTitle}>
        <dt>현재 상태</dt>
      </div>

      {items.map((item) => (
        <div key={String(item.label)}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};
