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

  it("활성 룰이 있으면 런처 버튼에 개수 뱃지가 보인다", () => {
    const api = install();
    api.rules.add({ pattern: "settings", status: 500 });
    render(<DevtoolsLauncher enabled />);
    const button = screen.getByRole("button", { name: "API devtools" });
    expect(button.textContent).toContain("1");
    act(() => {
      api.rules.clear();
    });
    expect(button.textContent).not.toContain("1");
  });

  it("활성 룰이 매칭되는 행은 좌측 스트라이프가 켜진다", async () => {
    const api = install();
    render(<DevtoolsLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    const row = screen.getByRole("button", { name: /settings/ });
    expect(row.getAttribute("style") ?? "").toMatch(/transparent/);
    act(() => {
      api.rules.add({ pattern: "settings", status: 500 });
    });
    expect(row.getAttribute("style") ?? "").toMatch(
      /#e8935c|rgb\(232, 147, 92\)/
    );
    expect(row.textContent).toContain("룰");
    expect(screen.getByText("룰 1")).toBeTruthy();
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
    expect(screen.getByText('"boom"')).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: /friend_ratings/ })
    );
    expect(screen.queryByText('"boom"')).toBeNull();
  });

  it("같은 method+URL은 한 행으로 묶이고 왼쪽 카운트가 올라간다", async () => {
    const api = install();
    render(<DevtoolsLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
      await api.fetch("https://api.test/settings");
      await api.fetch("https://api.test/others");
    });
    const rows = screen.getAllByRole("button", { name: /api\.test/ });
    expect(rows).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /settings/ }).textContent
    ).toContain("2");
  });

  it("재요청 버튼은 onRevalidate가 있을 때만 보이고, 행의 URL로 호출한다", async () => {
    const api = install();
    const onRevalidate = vi.fn();
    render(<DevtoolsLauncher enabled onRevalidate={onRevalidate} />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));
    fireEvent.click(screen.getByRole("button", { name: "재요청" }));
    expect(onRevalidate).toHaveBeenCalledExactlyOnceWith(
      "https://api.test/settings"
    );
  });

  it("onRevalidate 미주입이면 재요청 버튼이 없다", async () => {
    const api = install();
    render(<DevtoolsLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));
    expect(screen.queryByRole("button", { name: "재요청" })).toBeNull();
  });

  it("에러 적용은 URL을 이스케이프한 룰을 만들어 다음 요청부터 목킹한다", async () => {
    const api = install();
    render(<DevtoolsLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/posts?userId=1");
    });
    fireEvent.click(screen.getByRole("button", { name: /posts/ }));

    fireEvent.change(screen.getByRole("textbox", { name: "status" }), {
      target: { value: "404" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "에러 메시지" }), {
      target: { value: "없어요" },
    });
    fireEvent.click(screen.getByRole("button", { name: "적용 → 룰 생성" }));

    expect(api.rules.getSnapshot()).toHaveLength(1);
    const mocked = await act(async () =>
      api.fetch("https://api.test/posts?userId=1")
    );
    expect(mocked.status).toBe(404);
    await expect(mocked.text()).resolves.toBe('{"message":"없어요"}');
  });

  it("지연 버튼은 delayMs 룰을 만들고, 룰 해제는 매칭 룰을 지운다", async () => {
    const api = install();
    render(<DevtoolsLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));

    fireEvent.click(screen.getByRole("button", { name: /지연/ }));
    expect(api.rules.getSnapshot()[0]?.delayMs).toBe(3000);

    fireEvent.click(screen.getByRole("button", { name: /룰 해제/ }));
    expect(api.rules.getSnapshot()).toHaveLength(0);
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
