"use client";

import { useSyncExternalStore } from "react";

import type { SystemAppearance } from "../../script/type/appearance-type";

/**
 * `useSyncExternalStore`의 subscribe 시그니처.
 */
type UseSyncExternalStoreSubscribe = Parameters<typeof useSyncExternalStore>[0];

/**
 * `useSyncExternalStore` subscribe에 넘어오는 onStoreChange 콜백.
 */
type UseSyncExternalStoreOnStoreChange =
  Parameters<UseSyncExternalStoreSubscribe>[0];

/**
 * `useSystemAppearance`가 반환하는 값.
 */
export type SystemAppearanceState = {
  appearance: SystemAppearance | undefined;
};

const PREFERS_COLOR_SCHEME_DARK = "(prefers-color-scheme: dark)";

const EMPTY_SYSTEM_APPEARANCE: SystemAppearanceState = {
  appearance: undefined,
};

const listeners = new Set<UseSyncExternalStoreOnStoreChange>();

let currentSystemAppearance: SystemAppearanceState = EMPTY_SYSTEM_APPEARANCE;
let mediaQuery: MediaQueryList | undefined;

/**
 * 구독자에게 변경을 알린다.
 */
const emit = (): void => {
  for (const listener of listeners) {
    listener();
  }
};

/**
 * 현재 OS 어피어런스를 읽는다.
 * `matchMedia`를 못 읽으면 `undefined`이다.
 */
const readSystemAppearance = (): SystemAppearance | undefined => {
  if (typeof window.matchMedia !== "function") {
    return undefined;
  }

  return window.matchMedia(PREFERS_COLOR_SCHEME_DARK).matches
    ? "dark"
    : "light";
};

/**
 * OS 어피어런스 external store.
 */
const systemAppearanceStore = {
  /**
   * 서버·하이드레이션용 스냅샷을 반환한다.
   */
  getServerSnapshot(): SystemAppearanceState {
    return EMPTY_SYSTEM_APPEARANCE;
  },

  /**
   * 현재 OS 어피어런스 스냅샷을 반환한다.
   */
  getSnapshot(): SystemAppearanceState {
    const appearance = readSystemAppearance();

    if (currentSystemAppearance.appearance === appearance) {
      return currentSystemAppearance;
    }

    currentSystemAppearance =
      appearance === undefined ? EMPTY_SYSTEM_APPEARANCE : { appearance };

    return currentSystemAppearance;
  },

  /**
   * OS 어피어런스 변경을 구독한다.
   */
  subscribe: ((onStoreChange) => {
    listeners.add(onStoreChange);
    attachMediaQuery();

    return () => {
      listeners.delete(onStoreChange);

      if (listeners.size === 0) {
        detachMediaQuery();
      }
    };
  }) satisfies UseSyncExternalStoreSubscribe,
};

/**
 * matchMedia 구독을 건다.
 */
const attachMediaQuery = (): void => {
  if (mediaQuery !== undefined || typeof window.matchMedia !== "function") {
    return;
  }

  mediaQuery = window.matchMedia(PREFERS_COLOR_SCHEME_DARK);
  mediaQuery.addEventListener("change", emit);
};

/**
 * matchMedia 구독을 해제한다.
 */
const detachMediaQuery = (): void => {
  if (mediaQuery === undefined) {
    return;
  }

  mediaQuery.removeEventListener("change", emit);
  mediaQuery = undefined;
};

/**
 * OS 색 테마를 구독한다.
 * 추정할 수 없으면 `appearance`는 `undefined`이다.
 */
export const useSystemAppearance = (): SystemAppearanceState => {
  return useSyncExternalStore(
    systemAppearanceStore.subscribe,
    systemAppearanceStore.getSnapshot,
    systemAppearanceStore.getServerSnapshot
  );
};
