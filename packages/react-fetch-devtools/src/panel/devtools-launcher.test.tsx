// @vitest-environment happy-dom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMemoryStorage, installFetchDevtools } from "../core";
import { DevtoolsLauncher } from "./devtools-launcher";

const install = (baseFetch?: typeof fetch) => {
  const api = installFetchDevtools({
    baseFetch:
      baseFetch ?? (async () => new Response("{}", { status: 200 })),
    enabled: true,
    storage: createMemoryStorage(),
  });
  if (api === null) throw new Error("install 실패");
  return api;
};

describe("DevtoolsLauncher", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    delete window.__API_DEVTOOLS__;
    try {
      window.localStorage.clear();
    } catch {
      // Node 22 내장 localStorage는 플래그 없이 throw — safe-storage가 폴백하므로 비울 것도 없다
    }
  });

  it("enabled=false면 아무것도 그리지 않는다", () => {
    install();
    render(<DevtoolsLauncher enabled={false} />);
    expect(screen.queryByRole("button", { name: "API devtools" })).toBeNull();
  });

  it("전역이 설치돼 있지 않으면 아무것도 그리지 않는다", () => {
    render(<DevtoolsLauncher enabled />);
    expect(screen.queryByRole("button", { name: "API devtools" })).toBeNull();
  });

  it("런처 버튼을 그리고, hide()에 반응해 숨긴다", () => {
    const api = install();
    render(<DevtoolsLauncher enabled />);
    expect(screen.getByRole("button", { name: "API devtools" })).toBeTruthy();
    act(() => {
      api.hide();
    });
    expect(screen.queryByRole("button", { name: "API devtools" })).toBeNull();
    act(() => {
      api.show();
    });
    expect(screen.getByRole("button", { name: "API devtools" })).toBeTruthy();
  });

  it("버튼 클릭으로 패널이 열리고, Esc로 닫힌다", async () => {
    install();
    render(<DevtoolsLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("아직 기록된 요청이 없습니다")).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("기록된 요청이 테이블 행으로 나타난다 (목이면 MOCK 뱃지)", async () => {
    const api = install();
    api.rules.add({
      body: '{"message":"boom"}',
      pattern: "friend_ratings",
      status: 500,
    });
    render(<DevtoolsLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));

    await act(async () => {
      await api.fetch("https://api.test/friend_ratings");
      await api.fetch("https://api.test/settings");
    });

    expect(screen.getByText("https://api.test/friend_ratings")).toBeTruthy();
    expect(screen.getByText("500")).toBeTruthy();
    expect(screen.getByText("MOCK")).toBeTruthy();
    expect(screen.getByText("200")).toBeTruthy();
  });

  it("행을 클릭하면 JSON 뷰어에 응답 본문이 보인다", async () => {
    const api = install();
    api.rules.add({
      body: '{"message":"boom"}',
      pattern: "friend_ratings",
      status: 500,
    });
    render(<DevtoolsLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/friend_ratings");
    });

    fireEvent.click(
      screen.getByRole("button", { name: /friend_ratings/ })
    );
    expect(screen.getByText(/"message": "boom"/)).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: /friend_ratings/ })
    );
    expect(screen.queryByText(/"message": "boom"/)).toBeNull();
  });

  it("패널의 버튼 숨기기는 런처 스토어를 갱신하고 패널도 닫는다", async () => {
    const api = install();
    render(<DevtoolsLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    fireEvent.click(screen.getByRole("button", { name: "버튼 숨기기" }));
    expect(api.launcher.getSnapshot()).toBe(false);
    expect(screen.queryByRole("button", { name: "API devtools" })).toBeNull();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
