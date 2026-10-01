import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { useSystemAppearance } from "./use-system-appearance";

const roots: Array<Root> = [];

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
    get listenerCount() {
      return listeners.size;
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
 * 현재 어피어런스를 속성에 넣는다.
 */
const Probe = ({ name = "" }: { name?: string }): ReactNode => {
  const { appearance } = useSystemAppearance();

  return <div data-appearance={appearance} data-probe={name} />;
};

/**
 * 훅을 두 번 쓰는 트리.
 */
const DualProbe = (): ReactNode => {
  return (
    <>
      <Probe name="a" />
      <Probe name="b" />
    </>
  );
};

/**
 * 트리를 클라이언트에 렌더한다.
 */
const renderTree = (node: ReactNode): HTMLElement => {
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
 * 프로브를 클라이언트에 렌더한다.
 */
const renderProbe = (): HTMLElement => {
  return renderTree(<Probe />);
};

/**
 * 프로브의 어피어런스를 읽는다. 없으면 `null`이다.
 */
const readAppearance = (
  container: HTMLElement,
  probeName?: string
): string | null => {
  const probe = container.querySelector(
    probeName === undefined ? "[data-probe]" : `[data-probe="${probeName}"]`
  );

  if (probe === null) {
    throw new Error("프로브를 찾지 못했습니다.");
  }

  return probe.getAttribute("data-appearance");
};

describe("useSystemAppearance", () => {
  afterEach(() => {
    act(() => {
      roots.forEach((root) => {
        root.unmount();
      });
    });
    roots.length = 0;
    document.body.replaceChildren();
  });

  it("dark 쿼리가 맞으면 dark이다", () => {
    installMatchMedia(true);
    const container = renderProbe();

    expect(readAppearance(container)).toBe("dark");
  });

  it("dark 쿼리가 아니면 light이다", () => {
    installMatchMedia(false);
    const container = renderProbe();

    expect(readAppearance(container)).toBe("light");
  });

  it("prefers-color-scheme가 바뀌면 따라간다", () => {
    const mediaQueryList = installMatchMedia(false);
    const container = renderProbe();

    act(() => {
      mediaQueryList.setMatches(true);
    });

    expect(readAppearance(container)).toBe("dark");
  });

  it("훅을 두 번 써도 matchMedia 리스너는 하나이고 둘 다 따라간다", () => {
    const mediaQueryList = installMatchMedia(false);
    const container = renderTree(<DualProbe />);

    expect(mediaQueryList.listenerCount).toBe(1);
    expect(readAppearance(container, "a")).toBe("light");
    expect(readAppearance(container, "b")).toBe("light");

    act(() => {
      mediaQueryList.setMatches(true);
    });

    expect(mediaQueryList.listenerCount).toBe(1);
    expect(readAppearance(container, "a")).toBe("dark");
    expect(readAppearance(container, "b")).toBe("dark");
  });

  it("마지막 구독자가 언마운트되면 matchMedia 리스너를 뗀다", () => {
    const mediaQueryList = installMatchMedia(false);
    renderProbe();

    expect(mediaQueryList.listenerCount).toBe(1);

    act(() => {
      roots.forEach((root) => {
        root.unmount();
      });
    });
    roots.length = 0;

    expect(mediaQueryList.listenerCount).toBe(0);
  });

  it("matchMedia가 없으면 undefined이다", () => {
    window.matchMedia = undefined as unknown as typeof window.matchMedia;
    const container = renderProbe();

    expect(readAppearance(container)).toBeNull();
  });

  it("서버 렌더에서는 undefined이다", () => {
    installMatchMedia(true);

    const html = renderToString(<Probe />);

    expect(html).toContain("data-probe");
    expect(html).not.toContain("data-appearance");
  });
});
