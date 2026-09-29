import { describe, expect, it } from "vitest";
import { searchProducts, parseSearchParams } from "./search";
import type { Product } from "./types";

function make(overrides: Partial<Product> & { id: number }): Product {
  return {
    title: `Product ${overrides.id}`,
    description: "",
    category: "smartphones",
    brand: null,
    price: 10,
    discountPercentage: 0,
    listPrice: null,
    rating: 4,
    ratingCount: 100,
    boughtPastMonth: 0,
    stock: 10,
    fastDelivery: true,
    tags: [],
    sku: "",
    weight: 1,
    dimensions: { width: 1, height: 1, depth: 1 },
    warrantyInformation: "",
    shippingInformation: "",
    returnPolicy: "",
    reviews: [],
    createdAt: "2025-01-01T00:00:00.000Z",
    images: [],
    thumbnail: "",
    badge: null,
    ...overrides,
  };
}

const catalog: Product[] = [
  make({ id: 1, title: "Nike Air Jordan", category: "mens-shoes", brand: "Nike", price: 180, rating: 4.5 }),
  make({ id: 2, title: "Pampi Shoes", category: "womens-shoes", brand: "Pampi", price: 30, rating: 3.2 }),
  make({ id: 3, title: "iPhone 13 Pro", category: "smartphones", brand: "Apple", price: 999, rating: 4.8, discountPercentage: 10, listPrice: 1110 }),
  make({ id: 4, title: "Samsung Galaxy S10", category: "smartphones", brand: "Samsung", price: 699, rating: 4.1, createdAt: "2026-01-01T00:00:00.000Z" }),
  make({ id: 5, title: "Men's Plaid Shirt", category: "mens-shirts", brand: "Nike", price: 25, rating: 4.9, boughtPastMonth: 2000 }),
];

describe("searchProducts", () => {
  it("returns everything with no filters", () => {
    expect(searchProducts(catalog, {}).total).toBe(5);
  });

  it("matches keyword tokens against title, brand and category label", () => {
    const ids = searchProducts(catalog, { k: "shoes" }).items.map((p) => p.id);
    expect(ids.sort()).toEqual([1, 2]);
  });

  it("does not match 'men' inside 'women'", () => {
    const ids = searchProducts(catalog, { k: "shoes for men" }).items.map((p) => p.id);
    expect(ids).toEqual([1]);
  });

  it("matches substrings for longer tokens (phone -> smartphones)", () => {
    const ids = searchProducts(catalog, { k: "phone" }).items.map((p) => p.id);
    expect(ids.sort()).toEqual([3, 4]);
  });

  it("maps 'clothes' to the fashion department", () => {
    const ids = searchProducts(catalog, { k: "clothes" }).items.map((p) => p.id);
    expect(ids.sort()).toEqual([1, 2, 5]);
  });

  it("filters by department or category slug", () => {
    expect(searchProducts(catalog, { c: "electronics" }).total).toBe(2);
    expect(searchProducts(catalog, { c: "mens-shoes" }).total).toBe(1);
  });

  it("filters by brand, price range, rating and deals", () => {
    expect(searchProducts(catalog, { brands: ["Nike"] }).total).toBe(2);
    expect(searchProducts(catalog, { min: 20, max: 200 }).items.map((p) => p.id).sort()).toEqual([1, 2, 5]);
    expect(searchProducts(catalog, { rating: 4.5 }).items.map((p) => p.id).sort()).toEqual([1, 3, 5]);
    expect(searchProducts(catalog, { deals: true }).items.map((p) => p.id)).toEqual([3]);
  });

  it("sorts by price, rating and newest", () => {
    expect(searchProducts(catalog, { sort: "price-asc" }).items[0].id).toBe(5);
    expect(searchProducts(catalog, { sort: "price-desc" }).items[0].id).toBe(3);
    expect(searchProducts(catalog, { sort: "rating" }).items[0].id).toBe(5);
    expect(searchProducts(catalog, { sort: "newest" }).items[0].id).toBe(4);
  });

  it("paginates and clamps the page number", () => {
    const r = searchProducts(catalog, { page: 2, pageSize: 2 });
    expect(r.items).toHaveLength(2);
    expect(r.pageCount).toBe(3);
    expect(searchProducts(catalog, { page: 99, pageSize: 2 }).page).toBe(3);
  });

  it("computes brand facets ignoring the brand filter itself", () => {
    const r = searchProducts(catalog, { k: "shoes", brands: ["Nike"] });
    expect(r.total).toBe(1);
    expect(r.facets.brands.map((b) => b.name).sort()).toEqual(["Nike", "Pampi"]);
  });
});

describe("parseSearchParams", () => {
  it("parses URL params into typed search params", () => {
    expect(
      parseSearchParams({ k: " shoes ", brand: ["Nike", "Puma"], min: "10", max: "x", rating: "4", sort: "rating", page: "2", deals: "1" }),
    ).toEqual({ k: "shoes", c: undefined, brands: ["Nike", "Puma"], min: 10, max: undefined, rating: 4, sort: "rating", page: 2, deals: true });
  });

  it("ignores unknown sort values", () => {
    expect(parseSearchParams({ sort: "bogus" }).sort).toBe("featured");
  });
});
