import type { FetchDevtoolsPreset } from "@packages/react-http-override/src/core";

/** 앱이 정의해 넘기는 프리셋 — 목 데이터가 무거우므로 패널과 같은 lazy 청크에 둡니다 */
export const DEMO_PRESETS: FetchDevtoolsPreset[] = [
  {
    description: "서버 응답 그대로",
    id: "friends-original",
    name: "친구 별점 원본",
    rules: [
      {
        patch: [
          {
            path: "friend_ratings",
            value: [
              { rating: 4.5, user: { code: "u1AbCd", name: "테오" } },
              { rating: 4, user: { code: "u2EfGh", name: "메타" } },
              { rating: 3.5, user: { code: "u3IjKl", name: "애런" } },
              { rating: 5, user: { code: "u4MnOp", name: "가루" } },
            ],
          },
          { path: "total_count", value: 4 },
        ],
        pattern: "friend-ratings",
      },
    ],
  },
  {
    description: "아직 아무도 평가하지 않은 상태",
    id: "friends-empty",
    name: "친구 별점 없음",
    rules: [
      {
        patch: [
          { path: "friend_ratings", value: [] },
          { path: "total_count", value: 0 },
        ],
        pattern: "friend-ratings",
      },
    ],
  },
  {
    description: "로그인이 풀린 상태",
    id: "friends-401",
    name: "401 인증 만료",
    rules: [
      {
        body: JSON.stringify({ message: "로그인이 필요해요" }),
        pattern: "friend-ratings",
        status: 401,
      },
    ],
  },
];
