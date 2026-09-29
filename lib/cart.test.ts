import { describe, expect, it } from "vitest";
import { addItem, checkoutItems, itemCount, setQty, subtotal, type CartItem } from "./cart";
import type { ProductSummary } from "./types";

const product = (id: number, price: number, stock = 50): ProductSummary => ({
  id,
  title: `P${id}`,
  brand: null,
  category: "beauty",
  price,
  listPrice: null,
  discountPercentage: 0,
  rating: 4,
  ratingCount: 10,
  boughtPastMonth: 0,
  stock,
  fastDelivery: true,
  thumbnail: "",
  badge: null,
});

describe("cart math", () => {
  it("adds new items and merges quantities for existing ones", () => {
    let items: CartItem[] = [];
    items = addItem(items, product(1, 10));
    items = addItem(items, product(1, 10), 2);
    items = addItem(items, product(2, 5));
    expect(items).toHaveLength(2);
    expect(itemCount(items)).toBe(4);
  });

  it("caps quantity at stock and at 30", () => {
    expect(addItem([], product(1, 10, 3), 10)[0].qty).toBe(3);
    expect(addItem([], product(1, 10, 500), 99)[0].qty).toBe(30);
  });

  it("removes an item when quantity drops to zero", () => {
    const items = addItem([], product(1, 10));
    expect(setQty(items, 1, 0)).toEqual([]);
  });

  it("re-adding a saved item moves it back to the cart", () => {
    const items: CartItem[] = [{ product: product(1, 10), qty: 1, saved: true, selected: true }];
    expect(addItem(items, product(1, 10))[0]).toMatchObject({ saved: false, qty: 2 });
  });

  it("subtotal only counts selected, non-saved items and avoids float drift", () => {
    const items: CartItem[] = [
      { product: product(1, 0.1), qty: 3, saved: false, selected: true },
      { product: product(2, 100), qty: 1, saved: true, selected: true },
      { product: product(3, 50), qty: 1, saved: false, selected: false },
    ];
    expect(subtotal(checkoutItems(items))).toBe(0.3);
  });
});
