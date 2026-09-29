import { FREE_SHIPPING_THRESHOLD } from "./format";
import type { ProductSummary } from "./types";

export type CartItem = {
  product: ProductSummary;
  qty: number;
  /** "Save for later" items stay in the cart list but don't count toward the subtotal. */
  saved: boolean;
  /** Mirrors Amazon's per-item checkbox: unselected items aren't checked out. */
  selected: boolean;
};

export const MAX_QTY = 30;

export const maxQtyFor = (p: ProductSummary) => Math.max(1, Math.min(MAX_QTY, p.stock));

export function addItem(items: CartItem[], product: ProductSummary, qty = 1): CartItem[] {
  const existing = items.find((i) => i.product.id === product.id);
  if (existing) {
    return items.map((i) =>
      i.product.id === product.id
        ? { ...i, product, qty: Math.min(i.qty + qty, maxQtyFor(product)), saved: false, selected: true }
        : i,
    );
  }
  return [...items, { product, qty: Math.min(qty, maxQtyFor(product)), saved: false, selected: true }];
}

export function setQty(items: CartItem[], id: number, qty: number): CartItem[] {
  if (qty <= 0) return items.filter((i) => i.product.id !== id);
  return items.map((i) => (i.product.id === id ? { ...i, qty: Math.min(qty, maxQtyFor(i.product)) } : i));
}

/** Items in the active cart (not saved for later). */
export const activeItems = (items: CartItem[]) => items.filter((i) => !i.saved);

/** Items that will go to checkout. */
export const checkoutItems = (items: CartItem[]) => items.filter((i) => !i.saved && i.selected);

type Line = { product: { price: number }; qty: number };

export const itemCount = (items: Line[]) => items.reduce((n, i) => n + i.qty, 0);

export const subtotal = (items: Line[]) =>
  Math.round(items.reduce((sum, i) => sum + i.product.price * i.qty, 0) * 100) / 100;

export const qualifiesForFreeShipping = (amount: number) => amount >= FREE_SHIPPING_THRESHOLD;
