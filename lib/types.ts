// The exact shape GET /api/restaurants/[id] sends back. The screen only reads it.
export type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

export type RestaurantPage = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};
