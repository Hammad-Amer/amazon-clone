"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addItem, setQty, type CartItem } from "@/lib/cart";
import type { ProductSummary } from "@/lib/types";

type CartState = {
  items: CartItem[];
  add: (product: ProductSummary, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  setSaved: (id: number, saved: boolean) => void;
  toggleSelected: (id: number) => void;
  setAllSelected: (selected: boolean) => void;
  removeMany: (ids: number[]) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product, qty = 1) => set((s) => ({ items: addItem(s.items, product, qty) })),
      setQty: (id, qty) => set((s) => ({ items: setQty(s.items, id, qty) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),
      setSaved: (id, saved) =>
        set((s) => ({ items: s.items.map((i) => (i.product.id === id ? { ...i, saved } : i)) })),
      toggleSelected: (id) =>
        set((s) => ({
          items: s.items.map((i) => (i.product.id === id ? { ...i, selected: !i.selected } : i)),
        })),
      setAllSelected: (selected) =>
        set((s) => ({ items: s.items.map((i) => (i.saved ? i : { ...i, selected })) })),
      removeMany: (ids) => set((s) => ({ items: s.items.filter((i) => !ids.includes(i.product.id)) })),
    }),
    { name: "amz-cart", skipHydration: true },
  ),
);
