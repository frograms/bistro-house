type MockPoster = {
  large: string;
  medium: string;
  small: string;
};

type MockContent = {
  code: string;
  genres: Array<string>;
  nation: string;
  poster: MockPoster;
  rating_avg: number;
  title: string;
  user_action: {
    rating: number | null;
    wish: boolean;
  };
  year: number;
};

type MockContentsResponse = {
  contents: Array<MockContent>;
  next_uri: string | null;
  total_count: number;
};

/**
 * 콘텐츠 목록 데모 응답.
 */
export const MOCK_CONTENTS: MockContentsResponse = {
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
};
