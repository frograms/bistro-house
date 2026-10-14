import { useState } from "react";

import type { HttpOverrideApi, HttpOverrideRule } from "../core";
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

const summarize = (rule: HttpOverrideRule): string => {
  const facets: string[] = [];
  if (rule.status !== undefined) facets.push(String(rule.status));
  if (rule.patch !== undefined) facets.push(`패치 ${rule.patch.length}`);
  if (rule.delayMs !== undefined) facets.push(`지연 ${rule.delayMs}ms`);
  return facets.length > 0 ? facets.join(" · ") : "-";
};

export const RuleBar = ({ api }: { api: HttpOverrideApi }) => {
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
            <span style={rulePatternStyle} title={rule.pattern}>
              {rule.label ?? rule.pattern}
            </span>
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
