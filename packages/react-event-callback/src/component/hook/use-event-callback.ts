import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * - 항상 최신 callback을 참조하고 dependecy 변경으로 인한 재실행을 방지 하는 후크
 * - example
 *   ```tsx
 *   const handleClick = useEventCallback((count) => {
 *     console.log(count); // 항상 최신 count 가 참조됨
 *   });
 *   // count 종속성을 가진 useEffect
 *   useEffect(() => {
 *     someLib.on('event', handleClick);
 *   }, [handleClick]); // 디펜던시 변경으로 인한 effect 재실행이 방지됨
 *   ```
 */
export const useEventCallback = <Args extends unknown[], Return>(
  callback: ((...args: Args) => Return) | undefined
): ((...args: Args) => Return | undefined) => {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: Args) => {
    return callbackRef.current?.(...args);
  }, []);
};
