import { useEffect, useSyncExternalStore } from "react";

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
 * pending vitePreloadError 소비 결과.
 */
type ConsumeVitePreloadErrorResult = "reloaded" | "give-up" | "ignored";

const RELOAD_AT_KEY = "playground:vite-preload-error-reload-at";
const RELOAD_COOLDOWN_MS = 10_000;
const EMPTY_VITE_PRELOAD_ERRORS: readonly Error[] = [];

let isRegistered = false;
let pendingVitePreloadErrors: readonly Error[] = EMPTY_VITE_PRELOAD_ERRORS;

let reloadStartedInThisDocument = false;
let giveUpHandledInThisDocument = false;

/**
 * vitePreloadErrorStore 내부 상태·헬퍼.
 */
const vitePreloadErrorStoreInternal = {
  /**
   * pending vitePreloadError 구독자에게 변경을 알린다.
   */
  emit(): void {
    for (const listener of vitePreloadErrorStoreInternal.listeners) {
      listener();
    }
  },

  listeners: new Set<UseSyncExternalStoreOnStoreChange>(),
};

/**
 * pending vitePreloadError external store.
 */
export const vitePreloadErrorStore = {
  /**
   * SSR용 빈 스냅샷을 반환한다.
   */
  getServerSnapshot(): readonly Error[] {
    return EMPTY_VITE_PRELOAD_ERRORS;
  },

  /**
   * 현재 pending vitePreloadError 스냅샷을 반환한다.
   */
  getSnapshot(): readonly Error[] {
    return pendingVitePreloadErrors;
  },

  /**
   * payload를 pending 큐에 넣고 구독자에게 알린다.
   */
  push(error: Error): void {
    pendingVitePreloadErrors = [...pendingVitePreloadErrors, error];
    vitePreloadErrorStoreInternal.emit();
  },

  /**
   * pending vitePreloadError 스냅샷 변경을 구독한다.
   */
  subscribe: ((onStoreChange) => {
    vitePreloadErrorStoreInternal.listeners.add(onStoreChange);
    return () => {
      vitePreloadErrorStoreInternal.listeners.delete(onStoreChange);
    };
  }) satisfies UseSyncExternalStoreSubscribe,

  /**
   * pending 큐를 비우고 꺼낸 에러 목록을 반환한다.
   */
  takeAll(): Error[] {
    if (pendingVitePreloadErrors.length === 0) {
      return [];
    }

    const taken = [...pendingVitePreloadErrors];
    pendingVitePreloadErrors = EMPTY_VITE_PRELOAD_ERRORS;
    vitePreloadErrorStoreInternal.emit();
    return taken;
  },
};

/**
 * 쿨다운 안에 자동 reload를 이미 시도했는지 확인한다.
 */
const hasRecentReloadAttempt = (): boolean => {
  const previousAt = Number(sessionStorage.getItem(RELOAD_AT_KEY) ?? 0);
  if (!Number.isFinite(previousAt) || previousAt <= 0) {
    return false;
  }

  return Date.now() - previousAt < RELOAD_COOLDOWN_MS;
};

/**
 * 가능하면 1회 자동 reload를 시작하고, 불가하면 false를 반환한다.
 */
const tryReloadOnVitePreloadError = (): boolean => {
  // 이미 reload 중이거나 give-up/쿨다운이면 재시도하지 않는다.
  if (
    reloadStartedInThisDocument ||
    giveUpHandledInThisDocument ||
    hasRecentReloadAttempt()
  ) {
    return false;
  }

  // 문서 단위로 자동 reload는 한 번만 시작한다.
  reloadStartedInThisDocument = true;
  sessionStorage.setItem(RELOAD_AT_KEY, String(Date.now()));
  window.location.reload();
  return true;
};

/**
 * pending/실시간 vitePreloadError를 reload 또는 give-up으로 처리한다.
 */
const consumeVitePreloadError = (): ConsumeVitePreloadErrorResult => {
  if (tryReloadOnVitePreloadError()) {
    return "reloaded";
  }

  if (reloadStartedInThisDocument || giveUpHandledInThisDocument) {
    return "ignored";
  }

  giveUpHandledInThisDocument = true;
  sessionStorage.removeItem(RELOAD_AT_KEY);
  return "give-up";
};

/**
 * window 이벤트의 payload를 store에 쌓는다.
 */
const onWindowVitePreloadError = (event: VitePreloadErrorEvent): void => {
  event.preventDefault();
  vitePreloadErrorStore.push(event.payload);
};

/**
 * `vite:preloadError` 리스너를 한 번만 등록한다.
 */
export const registerVitePreloadError = (): void => {
  if (isRegistered) {
    return;
  }

  isRegistered = true;
  window.addEventListener("vite:preloadError", onWindowVitePreloadError);
};

/**
 * `vite:preloadError` 시 1회 reload.
 * 새 클라이언트 청크가 배포되면 기존 클라이언트의 엔트리 스크립트는 아직도 예전
 * 스크립트를 바라보므로, 레이지로드 등으로 인해 not found 관련 에러가 발생할 수 있다.
 * 이때 새로운 버전으로 앱을 업데이트하기 위해 새로고침한다.
 * give-up(자동 reload로 복구되지 않은 경우)에는 alert로 안내한다.
 *
 * `registerVitePreloadError`가 쌓아 둔 pending과, mount 이후 이벤트를 이 훅에서 소비한다.
 */
export const useVitePreloadError = (): void => {
  const pendingErrors = useSyncExternalStore(
    vitePreloadErrorStore.subscribe,
    vitePreloadErrorStore.getSnapshot,
    vitePreloadErrorStore.getServerSnapshot
  );

  /**
   * pending vitePreloadError가 생기면 큐를 비우고 reload / give-up 안내를 처리한다.
   */
  useEffect(() => {
    if (pendingErrors.length === 0) {
      return;
    }

    const errors = vitePreloadErrorStore.takeAll();
    for (const _error of errors) {
      if (consumeVitePreloadError() === "give-up") {
        // eslint-disable-next-line no-alert -- give-up 안내
        window.alert("업데이트에 실패했습니다.");
      }
    }
  }, [pendingErrors]);
};
