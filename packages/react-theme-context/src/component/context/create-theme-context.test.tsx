import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import type {
  SystemAppearance,
  SystemAppearanceName,
} from "../../script/type/appearance-type";
import type { Theme } from "../../script/type/theme-type";
import { createThemeContext } from "./create-theme-context";

type ThemeName = "dark" | "light";

const lightTheme: Theme<string, "light"> = {
  name: "light",
  value: "light-token",
};
const darkTheme: Theme<string, "dark"> = {
  name: "dark",
  value: "dark-token",
};
const themes = [lightTheme, darkTheme];
const ThemeContext = createThemeContext<string, ThemeName>();
const roots: Array<Root> = [];

/**
 * OS 어피어런스를 목록 테마 이름으로 바꾼다.
 * 아직 모르면 `light`이다.
 */
const resolveSystemTheme = (
  appearance: SystemAppearance | undefined
): ThemeName => {
  return appearance ?? "light";
};

/**
 * matchMedia 결과를 바꾸고 change를 보낼 수 있는 목.
 */
const installMatchMedia = (initialMatches: boolean) => {
  const listeners = new Set<() => void>();
  let matches = initialMatches;

  const mediaQueryList = {
    addEventListener: (_type: string, listener: EventListener) => {
      listeners.add(listener as () => void);
    },
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    removeEventListener: (_type: string, listener: EventListener) => {
      listeners.delete(listener as () => void);
    },
    setMatches: (nextMatches: boolean) => {
      matches = nextMatches;
      listeners.forEach((listener) => {
        listener();
      });
    },
  };

  window.matchMedia = () => {
    return mediaQueryList as unknown as MediaQueryList;
  };

  return mediaQueryList;
};

/**
 * 현재 테마 상태를 버튼으로 바꿀 수 있게 렌더한다.
 */
const Probe = (): ReactNode => {
  const { setTheme, theme } = ThemeContext.use();

  return (
    <div data-probe="" data-theme={theme.name}>
      <button type="button" onClick={() => setTheme("light")}>
        light
      </button>
      <button type="button" onClick={() => setTheme("dark")}>
        dark
      </button>
      <button type="button" onClick={() => setTheme("system-appearance")}>
        system-appearance
      </button>
      <button type="button" onClick={() => setTheme("missing" as ThemeName)}>
        missing
      </button>
      <button
        type="button"
        onClick={() => {
          setTheme((prevThemeName) => {
            return prevThemeName === "light" ? "dark" : "light";
          });
        }}>
        toggle
      </button>
    </div>
  );
};

/**
 * Provider를 클라이언트에 렌더한다.
 */
const renderProvider = (node: ReactNode): HTMLElement => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  roots.push(root);
  act(() => {
    root.render(node);
  });

  return container;
};

/**
 * Provider를 렌더한다.
 */
const renderTheme = (
  defaultTheme: SystemAppearanceName | ThemeName = "light"
): HTMLElement => {
  return renderProvider(
    <ThemeContext.Provider
      defaultTheme={defaultTheme}
      themes={themes}
      onResolveSystemTheme={resolveSystemTheme}>
      <Probe />
    </ThemeContext.Provider>
  );
};

/**
 * 프로브 엘리먼트의 테마 이름을 읽는다.
 */
const readTheme = (container: HTMLElement): string => {
  const probe = container.querySelector("[data-probe]");

  if (probe === null) {
    throw new Error("프로브를 찾지 못했습니다.");
  }

  const theme = probe.getAttribute("data-theme");

  if (theme === null) {
    throw new Error("프로브 속성이 없습니다.");
  }

  return theme;
};

/**
 * 라벨이 같은 버튼을 누른다.
 */
const clickButton = (params: {
  container: HTMLElement;
  label: string;
}): void => {
  const button = Array.from(params.container.querySelectorAll("button")).find(
    (item) => {
      return item.textContent === params.label;
    }
  );

  if (button === undefined) {
    throw new Error(`${params.label} 버튼을 찾지 못했습니다.`);
  }

  act(() => {
    button.click();
  });
};

describe("createThemeContext", () => {
  afterEach(() => {
    act(() => {
      roots.forEach((root) => {
        root.unmount();
      });
    });
    roots.length = 0;
    document.body.replaceChildren();
  });

  it("처음에는 defaultTheme 이름의 테마를 쓴다", () => {
    const container = renderTheme("light");

    expect(readTheme(container)).toBe("light");
  });

  it("setTheme으로 테마를 바꾼다", () => {
    const container = renderTheme();

    clickButton({ container, label: "dark" });

    expect(readTheme(container)).toBe("dark");
  });

  it("없는 테마 이름은 바꾸지 않는다", () => {
    const container = renderTheme();

    clickButton({ container, label: "dark" });
    clickButton({ container, label: "missing" });

    expect(readTheme(container)).toBe("dark");
  });

  it("setTheme에 함수를 넘기면 이전 이름으로 다음 이름을 정한다", () => {
    const container = renderTheme();

    clickButton({ container, label: "toggle" });

    expect(readTheme(container)).toBe("dark");

    clickButton({ container, label: "toggle" });

    expect(readTheme(container)).toBe("light");
  });

  it("서버 렌더에서는 defaultTheme 이름의 테마를 쓴다", () => {
    const html = renderToString(
      <ThemeContext.Provider
        defaultTheme="light"
        themes={themes}
        onResolveSystemTheme={resolveSystemTheme}>
        <Probe />
      </ThemeContext.Provider>
    );

    expect(html).toContain('data-theme="light"');
  });

  it("defaultTheme이 system-appearance이면 OS 어피어런스를 쓴다", () => {
    installMatchMedia(true);
    const container = renderTheme("system-appearance");

    expect(readTheme(container)).toBe("dark");
  });

  it("system-appearance일 때 OS 어피어런스가 바뀌면 따라간다", () => {
    const mediaQueryList = installMatchMedia(false);
    const container = renderTheme("light");

    clickButton({ container, label: "system-appearance" });

    expect(readTheme(container)).toBe("light");

    act(() => {
      mediaQueryList.setMatches(true);
    });

    expect(readTheme(container)).toBe("dark");
  });

  it("처음부터 system-appearance이면 OS 어피어런스가 바뀌면 따라간다", () => {
    const mediaQueryList = installMatchMedia(false);
    const container = renderTheme("system-appearance");

    expect(readTheme(container)).toBe("light");

    act(() => {
      mediaQueryList.setMatches(true);
    });

    expect(readTheme(container)).toBe("dark");
  });

  it("이름을 고르면 OS 어피어런스가 바뀌어도 유지한다", () => {
    const mediaQueryList = installMatchMedia(false);
    const container = renderTheme("system-appearance");

    clickButton({ container, label: "dark" });

    act(() => {
      mediaQueryList.setMatches(false);
    });

    expect(readTheme(container)).toBe("dark");
  });

  it("서버에서 system-appearance이면 onResolveSystemTheme 결과를 쓴다", () => {
    installMatchMedia(true);

    const html = renderToString(
      <ThemeContext.Provider
        defaultTheme="system-appearance"
        themes={themes}
        onResolveSystemTheme={() => {
          return "dark";
        }}>
        <Probe />
      </ThemeContext.Provider>
    );

    expect(html).toContain('data-theme="dark"');
  });
});
