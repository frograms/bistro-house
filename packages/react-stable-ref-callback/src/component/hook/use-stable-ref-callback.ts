import { useRef } from "react";

/** 안정적인 callback ref. `ref` prop에 넘기고 `.current`로 노드를 읽는다. */
export type StableRefCallback<T> = ((instance: T | null) => void) & {
  current: T | null;
};

/**
 * - callback ref 참조를 고정하고, 콜백 본문만 최신으로 유지한다.
 * - 노드가 그대로인데 콜백만 바뀌면 다시 호출하지 않는다.
 * - 리렌더마다 null→element 재호출되며 observe/타이머 등이 리셋되는 것을 막기 위함
 * - 반환: `StableRefCallback` (`ref={...}` + `.current`)
 */
export const useStableRefCallback = <T>(
  callback: ((instance: T | null) => void) | undefined
): StableRefCallback<T> => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const stableRef = useRef<StableRefCallback<T> | null>(null);

  if (stableRef.current === null) {
    const refCallback = ((node: T | null) => {
      refCallback.current = node;
      callbackRef.current?.(node);
    }) as StableRefCallback<T>;

    refCallback.current = null;
    stableRef.current = refCallback;
  }

  return stableRef.current;
};
