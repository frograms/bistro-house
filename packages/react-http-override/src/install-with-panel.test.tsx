// @vitest-environment happy-dom
import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMemoryStorage, uninstallHttpOverride } from "./core";
import { installHttpOverride } from "./install-with-panel";

const containers = () =>
  document.querySelectorAll("[data-http-override]").length;

const flush = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 50);
  });

describe("installHttpOverride (패널 자동 마운트)", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    window.fetch = async () => new Response("{}");
  });

  afterEach(() => {
    uninstallHttpOverride();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("설치하면 페이지가 안정된 뒤 런처를 body에 띄운다", async () => {
    installHttpOverride({ storage: createMemoryStorage() });
    expect(containers()).toBe(0);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "API devtools" })).toBeTruthy();
    });
    expect(containers()).toBe(1);
  });

  it("autoMount=false면 패널을 띄우지 않는다", async () => {
    installHttpOverride({ autoMount: false, storage: createMemoryStorage() });
    await flush();
    expect(containers()).toBe(0);
  });

  it("중복 설치해도 패널은 하나만 띄운다", async () => {
    installHttpOverride({ storage: createMemoryStorage() });
    installHttpOverride({ storage: createMemoryStorage() });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "API devtools" })).toBeTruthy();
    });
    await flush();
    expect(containers()).toBe(1);
  });

  it("uninstall하면 띄운 패널도 걷어낸다", async () => {
    installHttpOverride({ storage: createMemoryStorage() });
    await waitFor(() => {
      expect(containers()).toBe(1);
    });
    uninstallHttpOverride();
    expect(containers()).toBe(0);
    expect(screen.queryByRole("button", { name: "API devtools" })).toBeNull();
  });

  it("패널이 뜨기 전에 uninstall하면 끝까지 띄우지 않는다", async () => {
    installHttpOverride({ storage: createMemoryStorage() });
    uninstallHttpOverride();
    await flush();
    expect(containers()).toBe(0);
  });
});
