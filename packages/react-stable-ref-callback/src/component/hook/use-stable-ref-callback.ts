import { useRef } from "react";

export type StableRefCleanup = () => void;

export type StableRefCallbackFn<T> = (
  instance: T | null
) => void | StableRefCleanup;

/** 안정적인 callback ref. `ref` prop에 넘기고 `.current`로 노드를 읽는다. */
export type StableRefCallback<T> = StableRefCallbackFn<T> & {
  current: T | null;
};

/**
 * - callback ref 참조를 고정하고, 콜백 본문만 최신으로 유지한다.
 * - 노드가 그대로인데 콜백만 바뀌면 다시 호출하지 않는다.
 * - 리렌더마다 null→element 재호출되며 observe/타이머 등이 리셋되는 것을 막기 위함
 * - React 19: callback이 cleanup을 반환하면 unmount 시 그 cleanup을 실행한다 (null 재호출 없음)
 * - 반환: `StableRefCallback` (`ref={...}` + `.current`)
 */
export const useStableRefCallback = <T>(
  callback: StableRefCallbackFn<T> | undefined
): StableRefCallback<T> => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const stableRef = useRef<StableRefCallback<T> | null>(null);

  if (stableRef.current === null) {
    const refCallback = ((node: T | null) => {
      refCallback.current = node;
      const result = callbackRef.current?.(node);

      if (typeof result === "function") {
        return () => {
          result();
          if (refCallback.current === node) {
            refCallback.current = null;
          }
        };
      }
    }) as StableRefCallback<T>;

    refCallback.current = null;
    stableRef.current = refCallback;
  }

  return stableRef.current;
};
