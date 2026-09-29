"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserReview } from "@/lib/reviews";

type ReviewsState = {
  reviews: UserReview[];
  /** Keys of reviews this browser has marked helpful. */
  helpful: Record<string, true>;
  /** One review per customer per product: submitting again replaces the earlier one. */
  upsert: (review: UserReview) => void;
  remove: (id: string) => void;
  markHelpful: (key: string) => void;
};

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      reviews: [],
      helpful: {},
      upsert: (review) =>
        set((s) => ({
          reviews: [
            review,
            ...s.reviews.filter((r) => r.id !== review.id && !(r.productId === review.productId && r.email === review.email)),
          ],
        })),
      remove: (id) => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),
      markHelpful: (key) => set((s) => ({ helpful: { ...s.helpful, [key]: true } })),
    }),
    { name: "amz-reviews", skipHydration: true },
  ),
);
