import { describe, expect, it } from "vitest";
import { parseQuery, withParsedQuery } from "./query";

const parse = (text: string) => {
  const { k, changes } = parseQuery(text);
  return { k, ...changes };
};

describe("parseQuery", () => {
  it("leaves plain keywords untouched", () => {
    expect(parseQuery("Nike Shoes")).toEqual({ k: "Nike Shoes", changes: {}, changed: false });
    expect(parseQuery("  ")).toEqual({ k: undefined, changes: {}, changed: false });
  });

  it("does not treat numbers in product names as filters", () => {
    expect(parseQuery("iphone 13").changed).toBe(false);
    expect(parseQuery("galaxy s10").changed).toBe(false);
    expect(parseQuery("airpods max").changed).toBe(false);
  });

  it("parses price ceilings and floors", () => {
    expect(parse("shoes under 50")).toEqual({ k: "shoes", max: 50 });
    expect(parse("shoes below $50")).toEqual({ k: "shoes", max: 50 });
    expect(parse("laptops less than 1k")).toEqual({ k: "laptops", max: 1000 });
    expect(parse("watches over $1,000")).toEqual({ k: "watches", min: 1000 });
    expect(parse("perfume at least 30 dollars")).toEqual({ k: "perfume", min: 30 });
  });

  it("parses price ranges", () => {
    expect(parse("sunglasses between 20 and 60")).toEqual({ k: "sunglasses", min: 20, max: 60 });
    expect(parse("bags $50-$20")).toEqual({ k: "bags", min: 20, max: 50 });
    expect(parse("tops from 10 to 25")).toEqual({ k: "tops", min: 10, max: 25 });
    expect(parse("dresses 20 to 40 dollars")).toEqual({ k: "dresses", min: 20, max: 40 });
  });

  it("parses star ratings", () => {
    expect(parse("phones 4 stars")).toEqual({ k: "phones", rating: 4 });
    expect(parse("phones with 4+ stars")).toEqual({ k: "phones", rating: 4 });
    expect(parse("lipstick 3 star and up")).toEqual({ k: "lipstick", rating: 3 });
    expect(parse("chairs rated 4 and above")).toEqual({ k: "chairs", rating: 4 });
    expect(parse("5 star mascara")).toEqual({ k: "mascara", rating: 4.5 });
  });

  it("parses deals and sort words", () => {
    expect(parse("watches on sale")).toEqual({ k: "watches", deals: true });
    expect(parse("cheapest laptops")).toEqual({ k: "laptops", sort: "price-asc" });
    expect(parse("top rated headphones")).toEqual({ k: "headphones", sort: "rating" });
    expect(parse("best selling perfume")).toEqual({ k: "perfume", sort: "bestselling" });
    expect(parse("newest phones")).toEqual({ k: "phones", sort: "newest" });
    expect(parse("best sunglasses")).toEqual({ k: "sunglasses", sort: "rating" });
  });

  it("combines several filters and drops filler words", () => {
    expect(parse("show me nike shoes for under $100 with 4 stars")).toEqual({ k: "nike shoes", max: 100, rating: 4 });
    expect(parse("Cheap Watches On Sale")).toEqual({ k: "watches", sort: "price-asc", deals: true });
  });

  it("allows a query that is only filters", () => {
    expect(parseQuery("under 20")).toEqual({ k: undefined, changes: { max: 20 }, changed: true });
    expect(parse("products on sale")).toEqual({ k: undefined, deals: true });
  });
});

describe("withParsedQuery", () => {
  it("returns null when there is nothing to parse", () => {
    expect(withParsedQuery({ k: "shoes", c: "fashion" })).toBeNull();
  });

  it("merges parsed filters into the existing params", () => {
    expect(withParsedQuery({ k: "shoes under 50", c: "fashion", sort: "featured" })).toEqual({
      k: "shoes",
      c: "fashion",
      max: 50,
      min: undefined,
      rating: undefined,
      deals: undefined,
      sort: "featured",
    });
  });

  it("lets filters already in the URL win", () => {
    const p = withParsedQuery({ k: "cheapest shoes under 50", max: 30, sort: "rating" });
    expect(p).toMatchObject({ k: "shoes", max: 30, sort: "rating" });
  });
});
