// @vitest-environment happy-dom

import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, expect, expectTypeOf, test } from "vitest";

import { useEventCallback } from "./use-event-callback";

const roots: Array<Root> = [];

afterEach(() => {
  for (const root of roots) {
    act(() => {
      root.unmount();
    });
  }
  roots.length = 0;
});

/**
 * 훅을 마운트하고 다시 그릴 수 있게 한다.
 */
const render = (node: ReactNode) => {
  const root = createRoot(document.createElement("div"));
  roots.push(root);
  act(() => {
    root.render(node);
  });

  return {
    rerender: (next: ReactNode) => {
      act(() => {
        root.render(next);
      });
    },
  };
};

test("함수를 넘기면 같은 타입이다", () => {
  const Demo = () => {
    const fn = useEventCallback((value: number) => {
      return value;
    });
    expectTypeOf(fn).toEqualTypeOf<(value: number) => number>();
    return null;
  };

  void Demo;
});

test("optional이면 호출 결과에 undefined가 붙는다", () => {
  const Demo = () => {
    const callback: ((value: number) => number) | undefined = undefined;
    const fn = useEventCallback(callback);
    expectTypeOf(fn).toEqualTypeOf<(value: number) => number | undefined>();
    return null;
  };

  void Demo;
});

test("callback이 없으면 호출해도 던지지 않는다", () => {
  let result: unknown = "unset";

  const Demo = (): ReactNode => {
    const fn = useEventCallback(undefined);
    result = fn();
    return null;
  };

  renderToString(createElement(Demo));
  expect(result).toBeUndefined();
});

test("callback이 있으면 그 함수를 호출한다", () => {
  let result: unknown;

  const Demo = (): ReactNode => {
    const fn = useEventCallback((value: number) => {
      return value + 1;
    });
    result = fn(1);
    return null;
  };

  renderToString(createElement(Demo));
  expect(result).toBe(2);
});

test("리렌더해도 함수 참조는 같다", () => {
  let stable: ((value: number) => number) | undefined;

  const Host = ({ callback }: { callback: (value: number) => number }) => {
    stable = useEventCallback(callback);
    return null;
  };

  const { rerender } = render(
    createElement(Host, {
      callback: (value: number) => {
        return value;
      },
    })
  );
  const before = stable;
  rerender(
    createElement(Host, {
      callback: (value: number) => {
        return value + 1;
      },
    })
  );

  expect(stable).toBe(before);
});

test("같은 참조로 최신 callback을 호출한다", () => {
  let stable: ((value: number) => number) | undefined;

  const Host = ({ callback }: { callback: (value: number) => number }) => {
    stable = useEventCallback(callback);
    return null;
  };

  const { rerender } = render(
    createElement(Host, {
      callback: (value: number) => {
        return value;
      },
    })
  );
  expect(stable?.(1)).toBe(1);

  rerender(
    createElement(Host, {
      callback: (value: number) => {
        return value + 10;
      },
    })
  );
  expect(stable?.(1)).toBe(11);
});
