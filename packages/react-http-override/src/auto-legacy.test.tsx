// @vitest-environment happy-dom
import { screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installHttpOverride } from "./auto-legacy";
import { createMemoryStorage, uninstallHttpOverride } from "./core";

const legacy = vi.hoisted(() => ({
  render: vi.fn(),
  unmountComponentAtNode: vi.fn(),
}));

/* 테스트 환경은 React 19라 ReactDOM.render가 없다 — createRoot로 흉내 낸다 */
vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const { createRoot } = await import("react-dom/client");
  const roots = new Map<Element, Root>();
  legacy.render.mockImplementation((element: ReactElement, container: Element) => {
    const root = createRoot(container);
    roots.set(container, root);
    root.render(element);
  });
  legacy.unmountComponentAtNode.mockImplementation((container: Element) => {
    roots.get(container)?.unmount();
    return roots.delete(container);
  });
  return { ...actual, ...legacy };
});

describe("auto-legacy 엔트리 installHttpOverride", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    window.fetch = async () => new Response("{}");
  });

  afterEach(() => {
    uninstallHttpOverride();
    document.body.innerHTML = "";
  });

  it("ReactDOM.render로 런처를 띄우고, uninstall 시 unmountComponentAtNode로 걷어낸다", async () => {
    installHttpOverride({ storage: createMemoryStorage() });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "API devtools" })).toBeTruthy();
    });
    expect(legacy.render).toHaveBeenCalledOnce();

    uninstallHttpOverride();
    await waitFor(() => {
      expect(legacy.unmountComponentAtNode).toHaveBeenCalledOnce();
    });
    expect(document.querySelectorAll("[data-http-override]")).toHaveLength(0);
  });
});
