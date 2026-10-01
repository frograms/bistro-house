import { useEffect, useLayoutEffect } from "react";

/**
 * 브라우저에서는 `useLayoutEffect`, 서버에서는 `useEffect`를 쓴다.
 */
export const useIsomorphicLayoutEffect: typeof useLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
