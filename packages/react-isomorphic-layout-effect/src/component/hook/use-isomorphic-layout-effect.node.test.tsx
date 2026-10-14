// @vitest-environment node

import { type ReactNode, useEffect } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/**
 * effect를 등록하고 표시만 한다.
 */
const Probe = (): ReactNode => {
  useIsomorphicLayoutEffect(() => {
    document.body.dataset.ran = "1";
  }, []);

  return <div>ok</div>;
};

describe("useIsomorphicLayoutEffect (node)", () => {
  it("window가 없으면 useEffect이다", () => {
    expect(useIsomorphicLayoutEffect).toBe(useEffect);
  });

  it("서버 렌더에서 던지지 않는다", () => {
    expect(renderToString(<Probe />)).toContain("ok");
  });
});
