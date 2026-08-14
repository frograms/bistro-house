// @vitest-environment happy-dom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { JsonTree } from "./json-tree";

describe("JsonTree", () => {
  afterEach(() => {
    cleanup();
  });

  it("깊이 2까지 기본 펼침이고, 그 아래는 토글로 연다", () => {
    render(<JsonTree value={{ a: { b: [1, 2] } }} />);
    expect(screen.getByText("a")).toBeTruthy();
    expect(screen.getByText("b")).toBeTruthy();
    expect(screen.queryByText("1")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /b 2 items/ }));
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /b 2 items/ }));
    expect(screen.queryByText("1")).toBeNull();
  });

  it("프리미티브는 타입별로 표시하고 문자열은 따옴표를 유지한다", () => {
    render(<JsonTree value={{ n: 1, ok: true, s: "안녕", z: null }} />);
    expect(screen.getByText('"안녕"')).toBeTruthy();
    expect(screen.getByText("true")).toBeTruthy();
    expect(screen.getByText("null")).toBeTruthy();
  });

  it("100개 초과 배열은 잘라 표시한다", () => {
    render(
      <JsonTree value={Array.from({ length: 120 }, (_, index) => index)} />
    );
    expect(screen.getByText("120 items")).toBeTruthy();
    expect(screen.getByText("…나머지 20개")).toBeTruthy();
  });

  it("복사 버튼이 그 노드의 JSON을 클립보드에 쓰고 성공 시 ✓를 띄운다", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<JsonTree value={{ a: 1 }} />);
    const button = screen.getByRole("button", { name: "body 복사" });
    fireEvent.click(button);
    expect(writeText).toHaveBeenCalledExactlyOnceWith(
      JSON.stringify({ a: 1 }, null, 2)
    );
    await waitFor(() => {
      expect(button.textContent).toBe("✓");
    });
  });

  it("복사가 실패하면 ✓ 피드백을 띄우지 않는다", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<JsonTree value={{ a: 1 }} />);
    const button = screen.getByRole("button", { name: "body 복사" });
    fireEvent.click(button);
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });
    expect(button.textContent).toBe("⧉");
  });
});
