// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { FetchDevtoolsPreset } from "../core";
import { createMemoryStorage, installFetchDevtools } from "../core";
import { DevtoolsLauncher } from "./devtools-launcher";

const PRESETS: FetchDevtoolsPreset[] = [
  {
    description: "정상 결제 응답",
    id: "pay-ok",
    name: "결제 정상",
    rules: [{ body: '{"state":"OK"}', pattern: "payment", status: 200 }],
  },
  {
    id: "pay-a",
    name: "결제 A",
    rules: [
      { body: '{"state":"A"}', pattern: "payment", status: 200 },
      { delayMs: 1500, pattern: "orders" },
    ],
  },
];

const install = () => {
  const api = installFetchDevtools({
    baseFetch: async () => new Response("{}", { status: 200 }),
    enabled: true,
    storage: createMemoryStorage(),
  });
  if (api === null) throw new Error("install 실패");
  return api;
};

/** 패널을 열고 해당 URL을 호출한 뒤 그 행을 펼친다 */
const openRow = async (api: ReturnType<typeof install>, url: string) => {
  fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
  await act(async () => {
    await api.fetch(url);
  });
  fireEvent.click(screen.getByRole("button", { name: new RegExp(url) }));
};

describe("PresetSection", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    delete window.__API_DEVTOOLS__;
  });

  it("매칭되는 프리셋이 없는 행에는 프리셋 섹션을 그리지 않는다", async () => {
    const api = install();
    render(<DevtoolsLauncher presets={PRESETS} enabled />);
    await openRow(api, "https://api.test/profile");
    expect(screen.getByText("Data Explorer")).toBeTruthy();
    expect(screen.queryByText("프리셋")).toBeNull();
  });

  it("프리셋을 고르면 룰이 적용되고 다시 누르면 해제된다", async () => {
    const api = install();
    render(<DevtoolsLauncher presets={PRESETS} enabled />);
    await openRow(api, "https://api.test/payment/ready");
    expect(screen.getByText("프리셋")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "결제 A" }));
    const applied = api.rules.getSnapshot();
    expect(applied).toHaveLength(2);
    expect(applied.every((rule) => rule.label === "결제 A")).toBe(true);
    expect(applied.some((rule) => rule.delayMs === 1500)).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "결제 A" }));
    expect(api.rules.getSnapshot()).toHaveLength(0);
  });

  it("다른 프리셋을 고르면 이전 프리셋 룰을 대체하고 손으로 만든 룰은 남는다", async () => {
    const api = install();
    api.rules.add({ delayMs: 300, id: "manual", pattern: "etc" });
    render(<DevtoolsLauncher presets={PRESETS} enabled />);
    await openRow(api, "https://api.test/payment/ready");

    fireEvent.click(screen.getByRole("button", { name: "결제 A" }));
    fireEvent.click(screen.getByRole("button", { name: "결제 정상" }));

    const rules = api.rules.getSnapshot();
    expect(rules.filter((rule) => rule.id.startsWith("preset:"))).toHaveLength(
      1
    );
    expect(rules.some((rule) => rule.id === "manual")).toBe(true);
    expect(rules.some((rule) => rule.body === '{"state":"OK"}')).toBe(true);
  });

  it("이름을 바꾸면 저장되고 적용된 룰 label도 따라간다", async () => {
    const api = install();
    render(<DevtoolsLauncher presets={PRESETS} enabled />);
    await openRow(api, "https://api.test/payment/ready");
    fireEvent.click(screen.getByRole("button", { name: "결제 A" }));

    fireEvent.click(screen.getByRole("button", { name: "결제 A 이름 변경" }));
    fireEvent.change(screen.getByRole("textbox", { name: "결제 A 이름" }), {
      target: { value: "결제 실패 케이스" },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "결제 A 이름" }), {
      key: "Enter",
    });

    expect(api.presetNames.getSnapshot()["pay-a"]).toBe("결제 실패 케이스");
    expect(
      screen.getByRole("button", { name: "결제 실패 케이스" })
    ).toBeTruthy();
    expect(
      api.rules.getSnapshot().every((rule) => rule.label === "결제 실패 케이스")
    ).toBe(true);
  });

  it("취소하면 편집이 닫히고 이름이 그대로 남는다", async () => {
    const api = install();
    render(<DevtoolsLauncher presets={PRESETS} enabled />);
    await openRow(api, "https://api.test/payment/ready");

    fireEvent.click(screen.getByRole("button", { name: "결제 A 이름 변경" }));
    fireEvent.change(screen.getByRole("textbox", { name: "결제 A 이름" }), {
      target: { value: "쓰다 만 이름" },
    });
    fireEvent.click(screen.getByRole("button", { name: "이름 변경 취소" }));

    expect(screen.queryByRole("textbox", { name: "결제 A 이름" })).toBeNull();
    expect(api.presetNames.getSnapshot()["pay-a"]).toBeUndefined();
    expect(screen.getByRole("button", { name: "결제 A" })).toBeTruthy();
  });

  it("되돌리기 버튼은 바꾼 이름이 있을 때만 나오고 원래 이름으로 되돌린다", async () => {
    const api = install();
    render(<DevtoolsLauncher presets={PRESETS} enabled />);
    await openRow(api, "https://api.test/payment/ready");

    fireEvent.click(screen.getByRole("button", { name: "결제 A 이름 변경" }));
    expect(screen.queryByRole("button", { name: "원래 이름으로" })).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "결제 A 이름" }), {
      target: { value: "바꾼 이름" },
    });
    fireEvent.click(screen.getByRole("button", { name: "이름 저장" }));

    fireEvent.click(screen.getByRole("button", { name: "바꾼 이름 이름 변경" }));
    fireEvent.click(screen.getByRole("button", { name: "원래 이름으로" }));

    expect(api.presetNames.getSnapshot()["pay-a"]).toBeUndefined();
    expect(screen.getByRole("button", { name: "결제 A" })).toBeTruthy();
  });

  it("빈 값으로 저장하면 원래 이름으로 돌아온다", async () => {
    const api = install();
    act(() => {
      api.presetNames.set("pay-a", "바꾼 이름");
    });
    render(<DevtoolsLauncher presets={PRESETS} enabled />);
    await openRow(api, "https://api.test/payment/ready");
    expect(screen.getByRole("button", { name: "바꾼 이름" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "바꾼 이름 이름 변경" }));
    fireEvent.change(screen.getByRole("textbox", { name: "결제 A 이름" }), {
      target: { value: "  " },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "결제 A 이름" }), {
      key: "Enter",
    });

    expect(api.presetNames.getSnapshot()["pay-a"]).toBeUndefined();
    expect(screen.getByRole("button", { name: "결제 A" })).toBeTruthy();
  });

  it("프리셋 적용 시 매칭되는 기록의 URL로 재요청한다", async () => {
    const api = install();
    const onRevalidate = vi.fn();
    render(
      <DevtoolsLauncher presets={PRESETS} enabled onRevalidate={onRevalidate} />
    );
    await openRow(api, "https://api.test/payment/ready");
    await act(async () => {
      await api.fetch("https://api.test/profile");
    });

    fireEvent.click(screen.getByRole("button", { name: "결제 정상" }));
    expect(onRevalidate).toHaveBeenCalledExactlyOnceWith(
      "https://api.test/payment/ready"
    );
  });
});
