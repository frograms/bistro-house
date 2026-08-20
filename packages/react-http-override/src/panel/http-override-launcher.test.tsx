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

import { createMemoryStorage, installHttpOverride } from "../core";
import { HttpOverrideLauncher } from "./http-override-launcher";
import { HttpOverridePanel } from "./http-override-panel";

const install = (baseFetch?: typeof fetch) => {
  const api = installHttpOverride({
    baseFetch:
      baseFetch ?? (async () => new Response("{}", { status: 200 })),
    enabled: true,
    storage: createMemoryStorage(),
  });
  if (api === null) throw new Error("install 실패");
  return api;
};

describe("HttpOverrideLauncher", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    delete window.__HTTP_OVERRIDE__;
    try {
      window.localStorage.clear();
    } catch {
      // Node 22 내장 localStorage는 플래그 없이 throw — safe-storage가 폴백하므로 비울 것도 없다
    }
  });

  it("HttpOverridePanel(임베드)은 버튼·닫기 없이 부모 안에 렌더된다", async () => {
    const api = install();
    render(<HttpOverridePanel />);
    expect(screen.queryByRole("button", { name: "API devtools" })).toBeNull();
    expect(screen.queryByRole("button", { name: "패널 닫기" })).toBeNull();
    expect(screen.getByText("아직 기록된 요청이 없습니다")).toBeTruthy();
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    expect(screen.getByRole("button", { name: /settings/ })).toBeTruthy();
  });

  it("HttpOverridePanel은 전역 미설치면 null", () => {
    const { container } = render(<HttpOverridePanel />);
    expect(container.innerHTML).toBe("");
  });

  it("enabled=false면 아무것도 그리지 않는다", () => {
    install();
    render(<HttpOverrideLauncher enabled={false} />);
    expect(screen.queryByRole("button", { name: "API devtools" })).toBeNull();
  });

  it("전역이 설치돼 있지 않으면 아무것도 그리지 않는다", () => {
    render(<HttpOverrideLauncher enabled />);
    expect(screen.queryByRole("button", { name: "API devtools" })).toBeNull();
  });

  it("런처 버튼을 그리고, hide()에 반응해 숨긴다", () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
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
    render(<HttpOverrideLauncher enabled />);
    const button = screen.getByRole("button", { name: "API devtools" });
    expect(button.textContent).toContain("1");
    act(() => {
      api.rules.clear();
    });
    expect(button.textContent).not.toContain("1");
  });

  it("활성 룰이 매칭되는 행은 좌측 스트라이프가 켜진다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
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
    render(<HttpOverrideLauncher enabled />);
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
    render(<HttpOverrideLauncher enabled />);
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
    render(<HttpOverrideLauncher enabled />);
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
    render(<HttpOverrideLauncher enabled />);
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
    render(<HttpOverrideLauncher enabled onRevalidate={onRevalidate} />);
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
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));
    expect(screen.queryByRole("button", { name: "재요청" })).toBeNull();
  });

  it("에러 적용은 URL을 이스케이프한 룰을 만들어 다음 요청부터 목킹한다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/posts?userId=1");
    });
    fireEvent.click(screen.getByRole("button", { name: /posts/ }));

    fireEvent.click(screen.getByRole("button", { name: /Error 트리거/ }));
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

  it("트리 비우기 버튼이 패치 룰을 만들고 재요청부터 적용된다", async () => {
    const api = install(
      async () => new Response('{"items":[1,2],"total":2}', { status: 200 })
    );
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/list");
    });
    fireEvent.click(screen.getByRole("button", { name: /list/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "items 비우기" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "items 비우기" }));
    expect(api.rules.getSnapshot()[0]?.patch).toEqual([
      { path: "items", value: [] },
    ]);

    const patched = await act(async () => api.fetch("https://api.test/list"));
    await expect(patched.json()).resolves.toEqual({ items: [], total: 2 });
  });

  it("트리 편집으로 임의 값 패치 룰을 만들고 바로 재요청한다", async () => {
    const api = install(
      async () => new Response('{"items":[1,2],"total":2}', { status: 200 })
    );
    const onRevalidate = vi.fn();
    render(<HttpOverrideLauncher enabled onRevalidate={onRevalidate} />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/list");
    });
    fireEvent.click(screen.getByRole("button", { name: /list/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "total 편집" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "total 편집" }));
    const input = screen.getByRole("textbox", {
      name: "패치 값",
    }) as HTMLTextAreaElement;
    expect(input.value).toBe("2");
    fireEvent.change(input, { target: { value: "undefined" } });
    expect(screen.getByText(/필드 자체를 제거/)).toBeTruthy();
    fireEvent.change(input, { target: { value: "긴 텍스트 테스트" } });
    fireEvent.click(screen.getByRole("button", { name: "바꾸고 재요청" }));
    expect(api.rules.getSnapshot()[0]?.patch).toEqual([
      { path: "total", value: "긴 텍스트 테스트" },
    ]);
    expect(onRevalidate).toHaveBeenCalledExactlyOnceWith(
      "https://api.test/list"
    );
  });

  it("룰 바에서 목록 펼치기·개별/전체 해제가 동작한다", () => {
    const api = install();
    api.rules.add({ pattern: "settings", status: 500 });
    api.rules.add({ delayMs: 3000, pattern: "posts" });
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));

    fireEvent.click(screen.getByRole("button", { name: /룰 2개/ }));
    expect(screen.getByText("settings")).toBeTruthy();
    expect(screen.getByText("지연 3000ms")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "해제" })[0]!);
    expect(api.rules.getSnapshot()).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "전체 해제" }));
    expect(api.rules.getSnapshot()).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /룰 \d+개/ })).toBeNull();
  });

  it("cacheAdapter가 있으면 Cache 탭이 생기고 엔트리를 보여준다", () => {
    install();
    const cacheAdapter = {
      getEntries: () => [
        { data: { ok: true }, key: "/settings" },
        { error: "boom", key: "/fail" },
      ],
    };
    render(<HttpOverrideLauncher cacheAdapter={cacheAdapter} enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    fireEvent.click(screen.getByRole("button", { name: "Cache" }));
    expect(screen.getByText("/settings")).toBeTruthy();
    expect(screen.getByText("error")).toBeTruthy();
  });

  it("Cache 탭에서 행을 고르면 API 탭처럼 패널이 확장된다", () => {
    install();
    const cacheAdapter = {
      getEntries: () => [{ data: { ok: true }, key: "/settings" }],
    };
    render(<HttpOverrideLauncher cacheAdapter={cacheAdapter} enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    fireEvent.click(screen.getByRole("button", { name: "Cache" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("data-expanded")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "/settings" }));
    expect(dialog.getAttribute("data-expanded")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "/settings" }));
    expect(dialog.getAttribute("data-expanded")).toBe("false");
  });

  it("Cache 탭에서 엔트리를 고르면 재검증 버튼이 onRevalidate를 그 키로 호출한다", () => {
    install();
    const onRevalidate = vi.fn();
    const cacheAdapter = {
      getEntries: () => [{ data: { ok: true }, key: "/settings" }],
    };
    render(
      <HttpOverrideLauncher
        cacheAdapter={cacheAdapter}
        enabled
        onRevalidate={onRevalidate}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    fireEvent.click(screen.getByRole("button", { name: "Cache" }));
    fireEvent.click(screen.getByRole("button", { name: "/settings" }));
    fireEvent.click(screen.getByRole("button", { name: "재검증" }));
    expect(onRevalidate).toHaveBeenCalledExactlyOnceWith("/settings");
  });

  it("extraTabs가 탭으로 꽂히고 render 결과를 마운트한다", () => {
    install();
    const extraTabs = [
      {
        key: "rq",
        label: "React Query",
        render: () => <div>RQ 패널 자리</div>,
      },
    ];
    render(<HttpOverrideLauncher extraTabs={extraTabs} enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    expect(screen.queryByText("RQ 패널 자리")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "React Query" }));
    expect(screen.getByText("RQ 패널 자리")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "API" }));
    expect(screen.queryByText("RQ 패널 자리")).toBeNull();
  });

  it("cacheAdapter 미주입이면 Cache 탭이 없다", () => {
    install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    expect(screen.queryByRole("button", { name: "Cache" })).toBeNull();
  });

  it("상태 칩 필터·URL 검색·Clear가 동작한다", async () => {
    const api = install();
    api.rules.add({ pattern: "fail", status: 500 });
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
      await api.fetch("https://api.test/fail");
    });

    fireEvent.click(screen.getByRole("button", { name: /^에러 1$/ }));
    expect(screen.queryByRole("button", { name: /settings/ })).toBeNull();
    expect(screen.getByRole("button", { name: /fail/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /^전체 2$/ }));
    fireEvent.click(screen.getByRole("button", { name: "URL 검색 열기" }));
    fireEvent.change(screen.getByRole("textbox", { name: "URL 검색" }), {
      target: { value: "settings" },
    });
    expect(screen.queryByRole("button", { name: /fail/ })).toBeNull();
    expect(screen.getByRole("button", { name: /settings/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "검색 닫기" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByText("아직 기록된 요청이 없습니다")).toBeTruthy();
  });

  it("매칭 룰이 있으면 입력칸이 룰 값으로 채워진다", async () => {
    const api = install();
    api.rules.add({
      body: '{"message":"없음"}',
      pattern: "settings",
      status: 404,
    });
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));
    expect(
      (screen.getByRole("textbox", { name: "status" }) as HTMLInputElement)
        .value
    ).toBe("404");
    expect(
      (
        screen.getByRole("textbox", {
          name: "에러 메시지",
        }) as HTMLTextAreaElement
      ).value
    ).toBe("없음");
  });

  it("지연 룰이 앞에 있어도 뒤의 에러 룰을 찾아 표시·프리필한다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    api.rules.add({ delayMs: 1500, pattern: "settings" });
    api.rules.add({
      body: '{"message":"점검 중"}',
      pattern: "api\\.test",
      status: 503,
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));

    expect(
      screen.getByRole("button", { name: "Error 트리거 중" })
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Loading 트리거 중" })
    ).toBeDefined();
    expect(
      (screen.getByRole("textbox", { name: "status" }) as HTMLInputElement)
        .value
    ).toBe("503");
    fireEvent.click(screen.getByRole("button", { name: "Loading 트리거 중" }));
    expect(
      (screen.getByRole("textbox", { name: "지연 ms" }) as HTMLInputElement)
        .value
    ).toBe("1500");
  });

  it("메시지에 JSON 객체를 넣으면 그대로 body로 쓴다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));
    fireEvent.click(screen.getByRole("button", { name: /Error 트리거/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "에러 메시지" }), {
      target: { value: '{"code":"E401","detail":null}' },
    });
    fireEvent.click(screen.getByRole("button", { name: "적용 → 룰 생성" }));
    expect(api.rules.getSnapshot()[0]?.body).toBe(
      '{"code":"E401","detail":null}'
    );
  });

  it("같은 종류 트리거는 교체되고, 지연·에러 룰은 공존한다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));

    fireEvent.click(screen.getByRole("button", { name: /Error 트리거/ }));
    fireEvent.click(screen.getByRole("button", { name: "적용 → 룰 생성" }));
    fireEvent.click(screen.getByRole("button", { name: "적용 → 룰 생성" }));
    expect(api.rules.getSnapshot()).toHaveLength(1);
    expect(api.rules.getSnapshot()[0]?.status).toBe(500);

    fireEvent.click(screen.getByRole("button", { name: /Loading 트리거/ }));
    fireEvent.click(screen.getByRole("button", { name: "지연 적용" }));
    fireEvent.click(screen.getByRole("button", { name: "지연 적용" }));

    const rules = api.rules.getSnapshot();
    expect(rules).toHaveLength(2);
    expect(rules.some((rule) => rule.status === 500)).toBe(true);
    expect(rules.some((rule) => rule.delayMs === 3000)).toBe(true);
  });

  it("행에서 만든 룰은 정확히 그 URL만 매칭한다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));
    fireEvent.click(screen.getByRole("button", { name: /Error 트리거/ }));
    fireEvent.click(screen.getByRole("button", { name: "적용 → 룰 생성" }));

    await act(async () => {
      await api.fetch("https://api.test/settings/theme");
      await api.fetch("https://api.test/settings");
    });
    const records = api.records.getSnapshot();
    const child = records.find(
      (item) => item.url === "https://api.test/settings/theme"
    );
    const exact = records.filter(
      (item) => item.url === "https://api.test/settings"
    );
    expect(child?.mocked).toBe(false);
    expect(exact[exact.length - 1]?.mocked).toBe(true);
  });

  it("트리거 교체는 패치 룰을 지우지 않는다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    api.rules.add({
      patch: [{ path: "title", value: "편집값" }],
      pattern: "settings",
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));

    fireEvent.click(screen.getByRole("button", { name: /Loading 트리거/ }));
    fireEvent.click(screen.getByRole("button", { name: "지연 적용" }));

    const rules = api.rules.getSnapshot();
    expect(rules).toHaveLength(2);
    expect(rules.some((rule) => rule.patch !== undefined)).toBe(true);
    expect(rules.some((rule) => rule.delayMs === 3000)).toBe(true);
  });

  it("행이 열려 있는 동안 생긴 룰 값으로 입력칸이 동기화된다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));
    fireEvent.click(screen.getByRole("button", { name: /Error 트리거/ }));

    act(() => {
      api.rules.add({
        body: '{"message":"점검 중"}',
        pattern: "settings",
        status: 503,
      });
    });
    expect(
      (screen.getByRole("textbox", { name: "status" }) as HTMLInputElement)
        .value
    ).toBe("503");
    expect(
      (
        screen.getByRole("textbox", {
          name: "에러 메시지",
        }) as HTMLTextAreaElement
      ).value
    ).toBe("점검 중");
  });

  it("status 목 룰이 켜져 있으면 Data Explorer에 패치 대기 힌트를 띄운다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));
    expect(
      screen.queryByText(/패치는 Error 룰 해제 후 적용/)
    ).toBeNull();

    act(() => {
      api.rules.add({ id: "mock", pattern: "settings", status: 500 });
    });
    expect(
      screen.getByText(/패치는 Error 룰 해제 후 적용/)
    ).toBeTruthy();

    act(() => {
      api.rules.remove("mock");
    });
    expect(
      screen.queryByText(/패치는 Error 룰 해제 후 적용/)
    ).toBeNull();
  });

  it("복합 룰에 지연을 적용하면 delayMs만 갱신되고 status는 보존된다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    api.rules.add({ delayMs: 2000, pattern: "settings", status: 500 });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));

    fireEvent.click(screen.getByRole("button", { name: "Loading 트리거 중" }));
    fireEvent.change(screen.getByRole("textbox", { name: "지연 ms" }), {
      target: { value: "5000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "지연 적용" }));

    const rules = api.rules.getSnapshot();
    expect(rules).toHaveLength(1);
    expect(rules[0]?.delayMs).toBe(5000);
    expect(rules[0]?.status).toBe(500);
  });

  it("지연 버튼은 delayMs 룰을 만들고, 룰 해제는 매칭 룰을 지운다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    await act(async () => {
      await api.fetch("https://api.test/settings");
    });
    fireEvent.click(screen.getByRole("button", { name: /settings/ }));

    fireEvent.click(screen.getByRole("button", { name: /Loading 트리거/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "지연 ms" }), {
      target: { value: "1500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "지연 적용" }));
    expect(api.rules.getSnapshot()[0]?.delayMs).toBe(1500);

    fireEvent.click(screen.getByRole("button", { name: /룰 해제/ }));
    expect(api.rules.getSnapshot()).toHaveLength(0);
  });

  it("패널의 버튼 숨기기는 런처 스토어를 갱신하고 패널도 닫는다", async () => {
    const api = install();
    render(<HttpOverrideLauncher enabled />);
    fireEvent.click(screen.getByRole("button", { name: "API devtools" }));
    fireEvent.click(screen.getByRole("button", { name: "버튼 숨기기" }));
    expect(api.launcher.getSnapshot()).toBe(false);
    expect(screen.queryByRole("button", { name: "API devtools" })).toBeNull();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
