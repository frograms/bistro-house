// @vitest-environment happy-dom

import { useLayoutEffect } from "react";
import { describe, expect, it } from "vitest";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

describe("useIsomorphicLayoutEffect (browser)", () => {
  it("window가 있으면 useLayoutEffect이다", () => {
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });
});
