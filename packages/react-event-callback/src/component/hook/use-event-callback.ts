import { useCallback, useRef } from "react";

type AnyFunction = (...args: never[]) => unknown;

/**
 * 최신 callback을 호출하는 안정된 함수를 반환한다.
 * callback이 있으면 반환 타입은 callback과 같다. 없으면 호출 결과는 undefined이다.
 */
export function useEventCallback<Callback extends AnyFunction>(
  callback: Callback
): Callback;
export function useEventCallback<Callback extends AnyFunction>(
  callback: Callback | undefined
): (...args: Parameters<Callback>) => ReturnType<Callback> | undefined;
export function useEventCallback<Callback extends AnyFunction>(
  callback: Callback | undefined
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Parameters<Callback>) => {
    return callbackRef.current?.(...args);
  }, []);
}
