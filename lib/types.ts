export type Review = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
};

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  brand: string | null;
  price: number;
  discountPercentage: number;
  listPrice: number | null;
  rating: number;
  ratingCount: number;
  boughtPastMonth: number;
  stock: number;
  fastDelivery: boolean;
  tags: string[];
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  returnPolicy: string;
  reviews: Review[];
  createdAt: string;
  images: string[];
  thumbnail: string;
  badge: "Best Seller" | "Overall Pick" | null;
};

/** The slice of a product that client components (cards, cart, carousels) need. */
export type ProductSummary = Pick<
  Product,
  | "id"
  | "title"
  | "brand"
  | "category"
  | "price"
  | "listPrice"
  | "discountPercentage"
  | "rating"
  | "ratingCount"
  | "boughtPastMonth"
  | "stock"
  | "fastDelivery"
  | "thumbnail"
  | "badge"
>;

export type Suggestion = { text: string; category?: { slug: string; label: string }; productId?: number };
