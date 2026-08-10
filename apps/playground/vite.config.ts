import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(() => ({
  base: "/web-packages",

  build: {
    rolldownOptions: {
      experimental: {
        devMode: {
          /**
           * - bundledDev lazy proxy가 non-root base를 붙이지 않아 /@vite/lazy 404가 난다 (vitejs/vite#23216).
           * - prod 코드스플리팅과 무관한 devMode 옵션이라 임시로 끈다.
           * - TODO: 확인 후 나중에 재 활성화
           */
          lazy: false,
        },
      },
    },
  },
  experimental: {
    bundledDev: true,
  },
  plugins: [vanillaExtractPlugin(), react()],
  resolve: {
    tsconfigPaths: true,
  },
}));
