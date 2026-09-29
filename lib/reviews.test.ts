import { describe, expect, it } from "vitest";
import type { Order } from "./orders";
import { combineRatings, isVerifiedPurchase, ratingDistribution, seedHelpfulCount, validateReview } from "./reviews";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe("ratingDistribution", () => {
  it("always adds up to 100 and peaks near the average", () => {
    for (const r of [1, 2.5, 3.4, 4.2, 4.9]) expect(sum(ratingDistribution(r))).toBe(100);
    const d = ratingDistribution(4.8);
    expect(d[0]).toBe(Math.max(...d));
  });
});

describe("combineRatings", () => {
  it("returns the catalogue numbers when nobody has reviewed here", () => {
    expect(combineRatings(4.2, 500, [])).toEqual({ rating: 4.2, count: 500, distribution: ratingDistribution(4.2) });
  });

  it("adds user ratings to the average, count and distribution", () => {
    const r = combineRatings(4, 3, [1]);
    expect(r.count).toBe(4);
    expect(r.rating).toBeCloseTo(3.25);
    expect(sum(r.distribution)).toBe(100);
    expect(r.distribution[4]).toBeGreaterThan(ratingDistribution(4)[4]); // more 1-star share
  });

  it("keeps percentages summing to 100 for large counts", () => {
    expect(sum(combineRatings(3.7, 12345, [5, 5, 2]).distribution)).toBe(100);
  });
});

describe("isVerifiedPurchase", () => {
  const order = { email: "a@b.c", items: [{ product: { id: 7 }, qty: 1 }] } as unknown as Order;
  it("is true only for the buyer of that product", () => {
    expect(isVerifiedPurchase([order], "a@b.c", 7)).toBe(true);
    expect(isVerifiedPurchase([order], "a@b.c", 8)).toBe(false);
    expect(isVerifiedPurchase([order], "x@b.c", 7)).toBe(false);
  });
});

describe("helpers", () => {
  it("gives stable helpful counts", () => {
    expect(seedHelpfulCount(5, 1)).toBe(seedHelpfulCount(5, 1));
    expect(seedHelpfulCount(5, 1)).toBeGreaterThan(0);
  });

  it("validates reviews", () => {
    expect(validateReview({ rating: 0, title: " ", body: "short" })).toEqual({
      rating: expect.any(String),
      title: expect.any(String),
      body: expect.any(String),
    });
    expect(validateReview({ rating: 4, title: "Great", body: "Works well and arrived on time." })).toEqual({
      rating: null,
      title: null,
      body: null,
    });
  });
});
