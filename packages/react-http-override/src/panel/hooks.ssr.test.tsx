// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { HttpOverrideApi } from "../core";
import { createMemoryStorage } from "../core";
import { createLauncherVisibility } from "../core/launcher-visibility";
import { createPresetNameStore } from "../core/preset-names";
import { createRecordBuffer } from "../core/record-buffer";
import { createRuleStore } from "../core/rule-store";
import {
  useLauncherVisible,
  usePresetNames,
  useRecords,
  useRules,
} from "./hooks";

const createApi = (): HttpOverrideApi => {
  const launcher = createLauncherVisibility(createMemoryStorage());
  return {
    launcher: {
      getSnapshot: launcher.getSnapshot,
      subscribe: launcher.subscribe,
    },
    presetNames: createPresetNameStore(createMemoryStorage()),
    records: createRecordBuffer(),
    rules: createRuleStore(createMemoryStorage()),
  } as unknown as HttpOverrideApi;
};

const Probe = ({ api }: { api: HttpOverrideApi }) => {
  const records = useRecords(api);
  const rules = useRules(api);
  const visible = useLauncherVisible(api);
  const names = usePresetNames(api);
  return (
    <span>
      {`${records.length}-${rules.length}-${String(visible)}-${Object.keys(names).length}`}
    </span>
  );
};

describe("hooks SSR", () => {
  it("getServerSnapshot 덕에 서버 렌더에서 throw하지 않는다", () => {
    const html = renderToString(<Probe api={createApi()} />);
    expect(html).toContain("0-0-true-0");
  });
});
