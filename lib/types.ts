// The shapes the APIs send back. Screens only read these - they never compute them.

export type RestaurantCard = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
  costLabel: string;
  deliveryTime: string;
  pureVeg: boolean;
  emoji: string;
  tint: string;
  offer: string | null;
  averageRating: number | null;
  totalReviews: number;
};

export type Feed = { city: { id: number; name: string }; countLabel: string; restaurants: RestaurantCard[] };

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  priceLabel: string;
  veg: boolean;
  bestseller: boolean;
};

export type Review = { id: number; rating: number; comment: string; author: string; createdAt: string; dateLabel: string };

export type RestaurantPage = Omit<RestaurantCard, "totalReviews"> & {
  city: string;
  totalReviews: number;
  totalReviewsLabel: string;
  menu: { category: string; items: MenuItem[] }[];
  latestReview: Review | null;
  reviews: Review[];
};

export type Bill = { rows: { label: string; value: string }[]; toPay: number; toPayLabel: string };

export type Cart = {
  loggedIn: boolean;
  restaurant: { id: number; name: string; area: string; emoji: string; tint: string } | null;
  items: { menuItemId: number; name: string; veg: boolean; qty: number; priceLabel: string; lineTotalLabel: string }[];
  itemCount: number;
  itemCountLabel: string;
  bill: Bill | null;
  hint: string | null;
};

export type Me = { user: { name: string; phone: string; initial: string } | null };

export type Address = { id: number; label: string; line: string };

export type OrderSummary = {
  id: number;
  restaurant: { id: number; name: string; area: string; emoji: string; tint: string };
  summary: string;
  placedAtLabel: string;
  toPayLabel: string;
  statusLabel: string;
  delivered: boolean;
};

export type OrderDetail = {
  id: number;
  restaurant: { id: number; name: string; area: string; emoji: string; tint: string };
  placedAtLabel: string;
  address: { label: string; line: string };
  paymentLabel: string;
  items: { id: number; name: string; qty: number; lineTotalLabel: string }[];
  bill: Bill;
  status: {
    key: string;
    label: string;
    note: string;
    delivered: boolean;
    steps: { key: string; label: string; done: boolean; current: boolean }[];
  };
};
