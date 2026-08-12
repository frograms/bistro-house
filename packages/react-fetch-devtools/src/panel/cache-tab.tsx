import { useCallback, useEffect, useState } from "react";

import type { FetchDevtoolsCacheAdapter } from "../cache-adapter";
import { JsonTree } from "./json-tree";
import {
  chipErrorStyle,
  chipOkStyle,
  detailStyle,
  panelBodyStyle,
  panelClassNames,
  rowButtonSelectedStyle,
  rowButtonStyle,
  rowListStyle,
  rowUrlStyle,
  tableEmptyStyle,
  tableWrapStyle,
} from "./styles";

const POLL_MS = 500;

export const CacheTab = ({
  cacheAdapter,
}: {
  cacheAdapter: FetchDevtoolsCacheAdapter;
}) => {
  const [entries, setEntries] = useState(() => cacheAdapter.getEntries());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // 캐시 구독 API는 라이브러리마다 달라 폴링이 최소 공통분모
  useEffect(() => {
    const id = window.setInterval(() => {
      setEntries(cacheAdapter.getEntries());
    }, POLL_MS);
    return () => {
      window.clearInterval(id);
    };
  }, [cacheAdapter]);

  const handleSelect = useCallback((key: string) => {
    setSelectedKey((current) => (current === key ? null : key));
  }, []);

  const selected =
    selectedKey === null
      ? null
      : (entries.find((entry) => entry.key === selectedKey) ?? null);

  return (
    <div style={panelBodyStyle}>
      <div style={tableWrapStyle}>
        {entries.length === 0 ? (
          <p style={tableEmptyStyle}>캐시 엔트리가 없습니다</p>
        ) : (
          <ul style={rowListStyle}>
            {entries.map((entry) => (
              <li key={entry.key}>
                <button
                  className={panelClassNames.row}
                  style={
                    entry.key === selectedKey
                      ? rowButtonSelectedStyle
                      : rowButtonStyle
                  }
                  type="button"
                  onClick={() => handleSelect(entry.key)}
                >
                  <span style={rowUrlStyle}>{entry.key}</span>
                  {entry.error !== undefined && (
                    <span style={chipErrorStyle}>error</span>
                  )}
                  {entry.isValidating === true && (
                    <span style={chipOkStyle}>…</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selected !== null && (
        <aside style={detailStyle}>
          <JsonTree
            key={selected.key}
            value={{ data: selected.data, error: selected.error }}
          />
        </aside>
      )}
    </div>
  );
};
