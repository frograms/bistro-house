import { useCallback, useState } from "react";

import {
  panelClassNames,
  treeChildListStyle,
  treeContainerStyle,
  treeCopyButtonStyle,
  treeCountStyle,
  treeKeyStyle,
  treeRowStyle,
  treeToggleArrowStyle,
  treeToggleButtonStyle,
  treeTruncatedStyle,
  treeValueNullStyle,
  treeValueNumberStyle,
  treeValueStringStyle,
} from "./styles";

const DEFAULT_EXPAND_DEPTH = 2;
const MAX_ENTRIES = 100;

const isContainer = (value: unknown): value is object =>
  typeof value === "object" && value !== null;

const entriesOf = (value: object): [string, unknown][] =>
  Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as [string, unknown])
    : Object.entries(value as Record<string, unknown>);

const valueStyleOf = (value: unknown) => {
  if (typeof value === "string") return treeValueStringStyle;
  if (typeof value === "number" || typeof value === "boolean") {
    return treeValueNumberStyle;
  }
  return treeValueNullStyle;
};

const copyNode = (value: unknown) => {
  try {
    void navigator.clipboard
      ?.writeText(JSON.stringify(value, null, 2))
      .catch(() => {
        // 클립보드 쓰기 실패 무시
      });
  } catch {
    // 클립보드 미지원 환경 무시
  }
};

type TreeNodeProps = {
  depth: number;
  name: string;
  onToggle: (path: string) => void;
  path: string;
  toggledPaths: ReadonlySet<string>;
  value: unknown;
};

const TreeNode = ({
  depth,
  name,
  onToggle,
  path,
  toggledPaths,
  value,
}: TreeNodeProps) => {
  if (!isContainer(value)) {
    return (
      <li style={treeRowStyle}>
        <span style={treeKeyStyle}>{name}:</span>
        <span style={valueStyleOf(value)}>
          {JSON.stringify(value) ?? "undefined"}
        </span>
      </li>
    );
  }

  const entries = entriesOf(value);
  const expanded = depth < DEFAULT_EXPAND_DEPTH !== toggledPaths.has(path);
  const shownEntries = entries.slice(0, MAX_ENTRIES);

  return (
    <li>
      <div style={treeRowStyle}>
        <button
          style={treeToggleButtonStyle}
          type="button"
          onClick={() => onToggle(path)}>
          <span style={treeToggleArrowStyle}>{expanded ? "▼" : "▶"}</span>
          <span style={treeKeyStyle}>{name}</span>
          <span style={treeCountStyle}>{entries.length} items</span>
        </button>
        <button
          aria-label={`${name} 복사`}
          className={panelClassNames.actionButton}
          style={treeCopyButtonStyle}
          type="button"
          onClick={() => copyNode(value)}>
          복사
        </button>
      </div>
      {expanded && (
        <ul style={treeChildListStyle}>
          {shownEntries.map(([childName, childValue]) => (
            <TreeNode
              key={childName}
              depth={depth + 1}
              name={childName}
              path={path === "" ? childName : `${path}.${childName}`}
              toggledPaths={toggledPaths}
              value={childValue}
              onToggle={onToggle}
            />
          ))}
          {entries.length > MAX_ENTRIES && (
            <li style={treeTruncatedStyle}>
              …나머지 {entries.length - MAX_ENTRIES}개
            </li>
          )}
        </ul>
      )}
    </li>
  );
};

export const JsonTree = ({ value }: { value: unknown }) => {
  const [toggledPaths, setToggledPaths] = useState<ReadonlySet<string>>(
    new Set()
  );

  const handleToggle = useCallback((path: string) => {
    setToggledPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  return (
    <ul style={treeContainerStyle}>
      <TreeNode
        depth={0}
        name="body"
        path=""
        toggledPaths={toggledPaths}
        value={value}
        onToggle={handleToggle}
      />
    </ul>
  );
};
