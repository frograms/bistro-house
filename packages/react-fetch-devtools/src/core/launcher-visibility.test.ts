import { afterEach, describe, expect, it, vi } from "vitest";

import { createLauncherVisibility, RESTORE_HINT } from "./launcher-visibility";
import { createMemoryStorage } from "./safe-storage";

describe("createLauncherVisibility", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("기본은 표시 상태다", () => {
    expect(createLauncherVisibility(createMemoryStorage()).getSnapshot()).toBe(
      true
    );
  });

  it("hide는 상태를 영속하고 복구 힌트를 출력한다", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const storage = createMemoryStorage();
    const visibility = createLauncherVisibility(storage);
    visibility.hide();
    expect(visibility.getSnapshot()).toBe(false);
    expect(info).toHaveBeenCalledWith(RESTORE_HINT);
    expect(createLauncherVisibility(storage).getSnapshot()).toBe(false);
  });

  it("show는 영속 상태를 지운다", () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const storage = createMemoryStorage();
    const visibility = createLauncherVisibility(storage);
    visibility.hide();
    visibility.show();
    expect(visibility.getSnapshot()).toBe(true);
    expect(createLauncherVisibility(storage).getSnapshot()).toBe(true);
  });

  it("toggle은 상태를 뒤집고 구독자에게 알린다", () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const visibility = createLauncherVisibility(createMemoryStorage());
    const listener = vi.fn();
    visibility.subscribe(listener);
    visibility.toggle();
    expect(visibility.getSnapshot()).toBe(false);
    visibility.toggle();
    expect(visibility.getSnapshot()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
