import type { HtmlTagDescriptor, Plugin } from "vite";

import { MOCK_CONTENTS } from "../../../src/script/mock/mock-contents.ts";
import { MOCK_FRIEND_RATINGS } from "../../../src/script/mock/mock-friend-ratings.ts";

const DEMO_API_DELAY_MS = 200;
const WISH_FETCH_MODULE_PATH =
  "/project-attachment/vite-tool/demo-api/install-wish-fetch.ts";

const DEMO_API_FIXTURES: Record<string, unknown> = {
  "/api/contents": MOCK_CONTENTS,
  "/api/friend-ratings": MOCK_FRIEND_RATINGS,
};

const WISH_FETCH_SCRIPT_TAG: HtmlTagDescriptor = {
  attrs: {
    src: WISH_FETCH_MODULE_PATH,
    type: "module",
  },
  injectTo: "head-prepend",
  tag: "script",
};

type DemoApiPluginParams = {
  base: string;
};

/**
 * 데모 목록 API를 개발 서버 응답과 빌드 산출물로 제공한다.
 * 찜 POST, DELETE는 페이지에 올리는 fetch 모듈이 처리한다.
 */
export const demoApiPlugin = ({ base }: DemoApiPluginParams): Plugin => {
  const basePrefix = base.replace(/\/+$/, "");

  return {
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0];
        const path = Object.keys(DEMO_API_FIXTURES).find(
          (candidate) =>
            url === candidate || url === `${basePrefix}${candidate}`
        );
        if (path === undefined) {
          next();
          return;
        }
        setTimeout(() => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(DEMO_API_FIXTURES[path]));
        }, DEMO_API_DELAY_MS);
      });
    },
    generateBundle() {
      for (const [path, data] of Object.entries(DEMO_API_FIXTURES)) {
        this.emitFile({
          fileName: path.slice(1),
          source: JSON.stringify(data, null, 2),
          type: "asset",
        });
      }
    },
    name: "demo-api",
    transformIndexHtml: {
      handler(html) {
        return {
          html,
          tags: [WISH_FETCH_SCRIPT_TAG],
        };
      },
      order: "pre",
    },
  };
};
