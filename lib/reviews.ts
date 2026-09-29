import type { Order } from "./orders";

/** A review written in this browser. Seed reviews come from the product data. */
export type UserReview = {
  id: string;
  productId: number;
  email: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

export const REVIEW_MIN_LENGTH = 20;
export const REVIEW_TITLE_MAX = 100;

/**
 * A plausible 5→1 star distribution centred on the average rating.
 * (DummyJSON gives an average and only three written reviews.)
 */
export function ratingDistribution(rating: number): number[] {
  const weights = [5, 4, 3, 2, 1].map((star) => Math.exp(-((star - rating) ** 2) / 1.1) + (star === 5 ? 0.15 : 0));
  const sum = weights.reduce((a, b) => a + b, 0);
  const pct = weights.map((w) => Math.round((w / sum) * 100));
  pct[0] += 100 - pct.reduce((a, b) => a + b, 0); // make it add up to exactly 100
  return pct;
}

/**
 * The product's average, rating count and 5→1 star percentages once reviews written
 * here are added to the catalogue's numbers.
 */
export function combineRatings(
  baseRating: number,
  baseCount: number,
  userRatings: number[],
): { rating: number; count: number; distribution: number[] } {
  const base = ratingDistribution(baseRating);
  if (userRatings.length === 0) return { rating: baseRating, count: baseCount, distribution: base };

  const counts = base.map((pct) => (pct / 100) * baseCount);
  for (const r of userRatings) counts[5 - Math.round(r)] += 1;
  const count = baseCount + userRatings.length;
  const rating = (baseRating * baseCount + userRatings.reduce((a, b) => a + b, 0)) / count;

  const pct = counts.map((c) => Math.round((c / count) * 100));
  const largest = pct.indexOf(Math.max(...pct));
  pct[largest] += 100 - pct.reduce((a, b) => a + b, 0);
  return { rating, count, distribution: pct };
}

export const newReviewId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function isVerifiedPurchase(orders: Order[], email: string, productId: number): boolean {
  return orders.some((o) => o.email === email && o.items.some((i) => i.product.id === productId));
}

/** A stable "N people found this helpful" count for the catalogue's reviews. */
export function seedHelpfulCount(productId: number, index: number): number {
  return ((productId * 37 + index * 19) % 48) + 1;
}

export function validateReview(v: { rating: number; title: string; body: string }) {
  return {
    rating: v.rating < 1 ? "Please select a star rating." : null,
    title: !v.title.trim() ? "Please add a headline." : null,
    body:
      v.body.trim().length < REVIEW_MIN_LENGTH
        ? `Please write at least ${REVIEW_MIN_LENGTH} characters so your review is helpful to others.`
        : null,
  };
}
