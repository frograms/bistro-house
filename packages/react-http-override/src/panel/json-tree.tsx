import { useCallback, useEffect, useRef, useState } from "react";

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
const COPY_FEEDBACK_MS = 1200;

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

const suggestedEmptyOf = (value: unknown): unknown => {
  if (Array.isArray(value)) return [];
  if (isContainer(value)) return {};
  if (typeof value === "string") return "";
  return null;
};

const CopyButton = ({ name, value }: { name: string; value: unknown }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const handleCopy = useCallback(() => {
    try {
      // 문자열은 따옴표 없는 원문으로 (긴 텍스트 복사 용도)
      void navigator.clipboard
        ?.writeText(
          typeof value === "string" ? value : JSON.stringify(value, null, 2)
        )
        .then(() => {
          setCopied(true);
          if (timerRef.current !== null) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setCopied(false);
          }, COPY_FEEDBACK_MS);
        })
        .catch(() => {
          // 클립보드 쓰기 실패 — 성공 피드백을 띄우지 않는다
        });
    } catch {
      // 클립보드 미지원 환경 무시
    }
  }, [value]);

  return (
    <button
      aria-label={`${name} 복사`}
      className={panelClassNames.actionButton}
      style={treeCopyButtonStyle}
      title="복사"
      type="button"
      onClick={handleCopy}
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
};

type NodeActionsProps = {
  name: string;
  onEditPath?: (path: string, current: unknown) => void;
  onEmptyPath?: (path: string, suggested: unknown) => void;
  path: string;
  showCopy: boolean;
  value: unknown;
};

/** 호버(또는 포커스) 시에만 나타나는 아이콘 액션 묶음 */
const NodeActions = ({
  name,
  onEditPath,
  onEmptyPath,
  path,
  showCopy,
  value,
}: NodeActionsProps) => (
  <span className={panelClassNames.treeActions}>
    {showCopy && <CopyButton name={name} value={value} />}
    {onEmptyPath !== undefined && path !== "" && (
      <button
        aria-label={`${name} 비우기`}
        className={panelClassNames.actionButton}
        style={treeCopyButtonStyle}
        title="비우기"
        type="button"
        onClick={() => onEmptyPath(path, suggestedEmptyOf(value))}
      >
        ∅
      </button>
    )}
    {onEditPath !== undefined && path !== "" && (
      <button
        aria-label={`${name} 편집`}
        className={panelClassNames.actionButton}
        style={treeCopyButtonStyle}
        title="편집"
        type="button"
        onClick={() => onEditPath(path, value)}
      >
        ✎
      </button>
    )}
  </span>
);

type TreeNodeProps = {
  depth: number;
  name: string;
  onEditPath?: (path: string, current: unknown) => void;
  onEmptyPath?: (path: string, suggested: unknown) => void;
  onToggle: (path: string) => void;
  path: string;
  toggledPaths: ReadonlySet<string>;
  value: unknown;
};

const TreeNode = ({
  depth,
  name,
  onEditPath,
  onEmptyPath,
  onToggle,
  path,
  toggledPaths,
  value,
}: TreeNodeProps) => {
  if (!isContainer(value)) {
    return (
      <li className={panelClassNames.treeRow} style={treeRowStyle}>
        <span style={treeKeyStyle}>{name}:</span>
        <span style={valueStyleOf(value)}>
          {JSON.stringify(value) ?? "undefined"}
        </span>
        <NodeActions
          name={name}
          path={path}
          value={value}
          showCopy
          onEditPath={onEditPath}
          onEmptyPath={onEmptyPath}
        />
      </li>
    );
  }

  const entries = entriesOf(value);
  // 기본 펼침(depth < 2)을 토글이 반전시키는 XOR
  const expanded = depth < DEFAULT_EXPAND_DEPTH !== toggledPaths.has(path);
  const shownEntries = entries.slice(0, MAX_ENTRIES);

  return (
    <li>
      <div className={panelClassNames.treeRow} style={treeRowStyle}>
        <button
          style={treeToggleButtonStyle}
          type="button"
          onClick={() => onToggle(path)}
        >
          <span style={treeToggleArrowStyle}>{expanded ? "▼" : "▶"}</span>
          <span style={treeKeyStyle}>{name}</span>
          <span style={treeCountStyle}>{entries.length} items</span>
        </button>
        <NodeActions
          name={name}
          path={path}
          value={value}
          showCopy
          onEditPath={onEditPath}
          onEmptyPath={onEmptyPath}
        />
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
              onEditPath={onEditPath}
              onEmptyPath={onEmptyPath}
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

export const JsonTree = ({
  onEditPath,
  onEmptyPath,
  value,
}: {
  onEditPath?: (path: string, current: unknown) => void;
  onEmptyPath?: (path: string, suggested: unknown) => void;
  value: unknown;
}) => {
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
        onEditPath={onEditPath}
        onEmptyPath={onEmptyPath}
        onToggle={handleToggle}
      />
    </ul>
  );
};
