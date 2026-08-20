import { useCallback, useMemo, useState } from "react";

import type {
  HttpOverrideApi,
  HttpOverridePreset,
  HttpOverrideRecord,
} from "../core";
import { presetIdOf, presetRuleId, ruleMatchesUrl } from "../core";
import { usePresetNames, useRules } from "./hooks";
import {
  detailSectionBodyStyle,
  detailSectionHeaderStyle,
  panelClassNames,
  presetChipActiveStyle,
  presetChipStyle,
  presetEditRowStyle,
  presetGroupStyle,
  presetItemStyle,
  presetNameInputStyle,
  treeCopyButtonStyle,
} from "./styles";

const matchesAny = (patterns: string[], url: string): boolean =>
  patterns.some((pattern) => ruleMatchesUrl(pattern, url));

export type PresetSectionProps = {
  api: HttpOverrideApi;
  onRevalidate?: (key: string) => void;
  presets: HttpOverridePreset[];
  record: HttpOverrideRecord;
};

export const PresetSection = ({
  api,
  onRevalidate,
  presets,
  record,
}: PresetSectionProps) => {
  const rules = useRules(api);
  const names = usePresetNames(api);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const matchedPresets = useMemo(
    () =>
      presets.filter((preset) =>
        matchesAny(
          preset.rules.map((rule) => rule.pattern),
          record.url
        )
      ),
    [presets, record.url]
  );

  const activeId = useMemo(() => {
    for (const rule of rules) {
      const id = presetIdOf(rule.id);
      if (id !== null) return id;
    }
    return null;
  }, [rules]);

  const revalidateMatching = useCallback(
    (patterns: string[]) => {
      if (onRevalidate === undefined || patterns.length === 0) return;
      const urls = new Set<string>();
      for (const item of api.records.getSnapshot()) {
        if (matchesAny(patterns, item.url)) urls.add(item.url);
      }
      urls.forEach((url) => onRevalidate(url));
    },
    [api, onRevalidate]
  );

  const handleSelect = useCallback(
    (preset: HttpOverridePreset) => {
      const clearedPatterns: string[] = [];
      for (const rule of api.rules.getSnapshot()) {
        if (presetIdOf(rule.id) === null) continue;
        clearedPatterns.push(rule.pattern);
        api.rules.remove(rule.id);
      }
      if (activeId === preset.id) {
        revalidateMatching(clearedPatterns);
        return;
      }
      const label = names[preset.id] ?? preset.name;
      preset.rules.forEach((rule, index) => {
        api.rules.add({ ...rule, id: presetRuleId(preset.id, index), label });
      });
      revalidateMatching([
        ...clearedPatterns,
        ...preset.rules.map((rule) => rule.pattern),
      ]);
    },
    [activeId, api, names, revalidateMatching]
  );

  const applyName = useCallback(
    (preset: HttpOverridePreset, name: string | null) => {
      if (name === null) api.presetNames.reset(preset.id);
      else api.presetNames.set(preset.id, name);

      const label = name ?? preset.name;
      for (const rule of api.rules.getSnapshot()) {
        if (presetIdOf(rule.id) === preset.id) {
          api.rules.update(rule.id, { label });
        }
      }
      setEditingId(null);
    },
    [api]
  );

  const handleRenameCommit = useCallback(
    (preset: HttpOverridePreset) => {
      const next = editValue.trim();
      applyName(preset, next === "" || next === preset.name ? null : next);
    },
    [applyName, editValue]
  );

  if (matchedPresets.length === 0) return null;

  const editing = matchedPresets.find((preset) => preset.id === editingId);

  return (
    <>
      <div style={detailSectionHeaderStyle}>프리셋</div>
      <div style={detailSectionBodyStyle}>
        {editing !== undefined && (
          <div style={presetEditRowStyle}>
            <input
              aria-label={`${editing.name} 이름`}
              style={presetNameInputStyle}
              value={editValue}
              autoFocus
              onChange={(event) => setEditValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleRenameCommit(editing);
                if (event.key === "Escape") {
                  event.stopPropagation();
                  setEditingId(null);
                }
              }}
            />
            <button
              aria-label="이름 저장"
              className={panelClassNames.actionButton}
              style={treeCopyButtonStyle}
              title="저장 (Enter)"
              type="button"
              onClick={() => handleRenameCommit(editing)}>
              ✓
            </button>
            {names[editing.id] !== undefined && (
              <button
                aria-label="원래 이름으로"
                className={panelClassNames.actionButton}
                style={treeCopyButtonStyle}
                title={`원래 이름으로 (${editing.name})`}
                type="button"
                onClick={() => applyName(editing, null)}>
                ↺
              </button>
            )}
            <button
              aria-label="이름 변경 취소"
              className={panelClassNames.actionButton}
              style={treeCopyButtonStyle}
              title="취소 (Esc)"
              type="button"
              onClick={() => setEditingId(null)}>
              ✕
            </button>
          </div>
        )}
        <div style={presetGroupStyle}>
          {matchedPresets.map((preset) => {
            const displayName = names[preset.id] ?? preset.name;
            const active = activeId === preset.id;

            return (
              <span
                key={preset.id}
                className={panelClassNames.treeRow}
                style={presetItemStyle}>
                <button
                  aria-label={displayName}
                  aria-pressed={active}
                  className={panelClassNames.actionButton}
                  style={active ? presetChipActiveStyle : presetChipStyle}
                  title={
                    active
                      ? "적용 중 — 다시 누르면 해제"
                      : (preset.description ?? "적용")
                  }
                  type="button"
                  onClick={() => handleSelect(preset)}>
                  {displayName}
                </button>
                <span className={panelClassNames.treeActions}>
                  <button
                    aria-label={`${displayName} 이름 변경`}
                    className={panelClassNames.actionButton}
                    style={treeCopyButtonStyle}
                    title="이름 변경"
                    type="button"
                    onClick={() => {
                      setEditingId(preset.id);
                      setEditValue(displayName);
                    }}>
                    ✎
                  </button>
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};