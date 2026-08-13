import { useState } from "react";

import type { FetchDevtoolsApi, FetchDevtoolsRule } from "../core";
import { useRules } from "./hooks";
import {
  chipErrorStyle,
  chipOkStyle,
  ghostButtonStyle,
  panelClassNames,
  ruleBarHeaderStyle,
  ruleBarStyle,
  rulePatternStyle,
  ruleRowStyle,
} from "./styles";

const summarize = (rule: FetchDevtoolsRule): string => {
  if (rule.status !== undefined) return String(rule.status);
  if (rule.patch !== undefined) return `패치 ${rule.patch.length}`;
  if (rule.delayMs !== undefined) return `지연 ${rule.delayMs / 1000}s`;
  return "-";
};

export const RuleBar = ({ api }: { api: FetchDevtoolsApi }) => {
  const rules = useRules(api);
  const [expanded, setExpanded] = useState(false);

  if (rules.length === 0) return null;

  return (
    <div style={ruleBarStyle}>
      <div style={ruleBarHeaderStyle}>
        <button
          className={panelClassNames.actionButton}
          style={ghostButtonStyle}
          type="button"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "▼" : "▶"} 룰 {rules.length}개
        </button>
        <button
          className={panelClassNames.actionButton}
          style={ghostButtonStyle}
          type="button"
          onClick={api.rules.clear}
        >
          전체 해제
        </button>
      </div>
      {expanded &&
        rules.map((rule) => (
          <div key={rule.id} style={ruleRowStyle}>
            <span style={rulePatternStyle}>{rule.pattern}</span>
            <span
              style={rule.status !== undefined ? chipErrorStyle : chipOkStyle}
            >
              {summarize(rule)}
            </span>
            <button
              className={panelClassNames.actionButton}
              style={ghostButtonStyle}
              type="button"
              onClick={() => api.rules.remove(rule.id)}
            >
              해제
            </button>
          </div>
        ))}
    </div>
  );
};
