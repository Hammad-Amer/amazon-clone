"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/lib/orders";

type OrdersState = {
  orders: Order[];
  place: (order: Order) => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      place: (order) => set((s) => ({ orders: [order, ...s.orders] })),
    }),
    { name: "amz-orders", skipHydration: true },
  ),
);

export const ordersFor = (orders: Order[], email: string | undefined) =>
  email ? orders.filter((o) => o.email === email) : [];
