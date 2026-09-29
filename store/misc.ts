"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummary } from "@/lib/types";

/** Recently viewed products, newest first. Powers "Keep shopping for" and recommendations. */
export const useHistory = create<{
  viewed: ProductSummary[];
  record: (p: ProductSummary) => void;
  clear: () => void;
}>()(
  persist(
    (set) => ({
      viewed: [],
      record: (p) => set((s) => ({ viewed: [p, ...s.viewed.filter((v) => v.id !== p.id)].slice(0, 20) })),
      clear: () => set({ viewed: [] }),
    }),
    { name: "amz-history", skipHydration: true },
  ),
);

export const useWishlist = create<{
  items: ProductSummary[];
  toggle: (p: ProductSummary) => boolean;
  remove: (id: number) => void;
}>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (p) => {
        const has = get().items.some((i) => i.id === p.id);
        set((s) => ({ items: has ? s.items.filter((i) => i.id !== p.id) : [p, ...s.items] }));
        return !has;
      },
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: "amz-wishlist", skipHydration: true },
  ),
);

export type DeliveryLocation = { city: string; zip: string; country: string };

export const useLocation = create<{
  location: DeliveryLocation | null;
  setLocation: (l: DeliveryLocation) => void;
}>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (location) => set({ location }),
    }),
    { name: "amz-location", skipHydration: true },
  ),
);

/** Flipped once every persisted store has rehydrated from localStorage. */
export const useHydration = create<{ hydrated: boolean }>(() => ({ hydrated: false }));
