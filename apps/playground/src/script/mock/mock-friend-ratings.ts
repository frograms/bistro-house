type MockFriendRating = {
  rating: number;
  user: {
    code: string;
    name: string;
    photo: {
      small: string;
    };
  };
};

type MockFriendRatingsResponse = {
  friend_ratings: Array<MockFriendRating>;
  total_count: number;
};

/**
 * 친구 별점 데모 응답.
 */
export const MOCK_FRIEND_RATINGS: MockFriendRatingsResponse = {
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
      rating: 4,
      user: {
        code: "u2EfGh",
        name: "메타",
        photo: { small: "https://example.invalid/photo/u2EfGh/small.jpg" },
      },
    },
    {
      rating: 3.5,
      user: {
        code: "u3IjKl",
        name: "애런",
        photo: { small: "https://example.invalid/photo/u3IjKl/small.jpg" },
      },
    },
    {
      rating: 5,
      user: {
        code: "u4MnOp",
        name: "가루",
        photo: { small: "https://example.invalid/photo/u4MnOp/small.jpg" },
      },
    },
  ],
  total_count: 4,
};
