import "@playground/resource/css/common/global-style.css";

import { registerVitePreloadError } from "@playground/component/hook/use-vite-preload-error";

/**
 * (client side) 앱 모듈이 초기화될 때 호출됩니다.
 */
export const initializeGlobalApp = () => {
  registerVitePreloadError();
};

/**
 * (client side) 앱 컴포넌트가 마운트될 때 호출됩니다.
 */
export const initializeApp = () => {};
