import type { ProductSummary } from "./types";

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type ShippingSpeed = "standard" | "express";

export const SHIPPING_OPTIONS: Record<ShippingSpeed, { label: string; days: number; cost: number }> = {
  standard: { label: "FREE Standard Delivery", days: 5, cost: 0 },
  express: { label: "Next-Day Delivery", days: 1, cost: 9.99 },
};

/** Standard shipping is free over the threshold; below it we charge a flat fee. */
export const STANDARD_FEE_UNDER_THRESHOLD = 5.99;
export const TAX_RATE = 0.08;

export type Payment = { method: "card"; brand: string; last4: string } | { method: "cod" };

export type Order = {
  id: string;
  email: string;
  items: { product: ProductSummary; qty: number }[];
  address: Address;
  payment: Payment;
  shipping: ShippingSpeed;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  createdAt: string;
  deliveryBy: string;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function orderTotals(subtotal: number, shippingCost: number) {
  const tax = round2(subtotal * TAX_RATE);
  return { subtotal: round2(subtotal), shippingCost, tax, total: round2(subtotal + shippingCost + tax) };
}

/** Amazon-style order number, e.g. "112-4839201-5738210". */
export function newOrderId(): string {
  const n = (len: number) =>
    Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
  return `112-${n(7)}-${n(7)}`;
}
