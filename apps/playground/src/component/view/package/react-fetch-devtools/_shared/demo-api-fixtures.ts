/** 실서비스 응답 모양"만 본뜬 가짜 데이터 */
export const DEMO_API_FIXTURES: Record<string, unknown> = {
  "/api/contents": {
    contents: [
      {
        code: "tPzKm1a",
        genres: ["드라마", "스릴러"],
        nation: "한국",
        poster: {
          large: "https://example.invalid/poster/tPzKm1a/large.jpg",
          medium: "https://example.invalid/poster/tPzKm1a/medium.jpg",
          small: "https://example.invalid/poster/tPzKm1a/small.jpg",
        },
        rating_avg: 4.1,
        title: "달빛 조사관",
        user_action: { rating: null, wish: false },
        year: 2023,
      },
      {
        code: "tQx9Lb2",
        genres: ["코미디"],
        nation: "한국",
        poster: {
          large: "https://example.invalid/poster/tQx9Lb2/large.jpg",
          medium: "https://example.invalid/poster/tQx9Lb2/medium.jpg",
          small: "https://example.invalid/poster/tQx9Lb2/small.jpg",
        },
        rating_avg: 3.8,
        title: "오늘도 출근",
        user_action: { rating: 4, wish: true },
        year: 2024,
      },
      {
        code: "tRw3Mc5",
        genres: ["애니메이션", "가족"],
        nation: "일본",
        poster: {
          large: "https://example.invalid/poster/tRw3Mc5/large.jpg",
          medium: "https://example.invalid/poster/tRw3Mc5/medium.jpg",
          small: "https://example.invalid/poster/tRw3Mc5/small.jpg",
        },
        rating_avg: 4.5,
        title: "구름 위 정원",
        user_action: { rating: null, wish: false },
        year: 2021,
      },
    ],
    next_uri: null,
    total_count: 3,
  },
  "/api/friend-ratings": {
    friend_ratings: [
      {
        rating: 4.5,
        user: {
          code: "u1AbCd",
          name: "테오",
          photo: { small: "https://example.invalid/photo/u1AbCd/small.jpg" },
        },
      },
      {
        rating: 3,
        user: {
          code: "u2EfGh",
          name: "수",
          photo: { small: "https://example.invalid/photo/u2EfGh/small.jpg" },
        },
      },
    ],
    total_count: 2,
  },
  "/api/settings": {
    settings: {
      adult_filter: false,
      auto_play: true,
      notifications: {
        marketing: false,
        party_invite: true,
        price_drop: true,
      },
      subtitle_lang: "ko",
      video_quality: "auto",
    },
  },
};