"use client";

import { DEMO_ORDER_PRODUCT_IDS, demoOrders } from "@/lib/demo";
import type { ProductSummary } from "@/lib/types";
import { DEMO_USER, useAuth } from "./auth";
import { useOrders } from "./orders";

/** Signs into the demo account, creating it (with a seeded order history) on first use. */
export async function signInDemo(): Promise<void> {
  const { signIn, register } = useAuth.getState();
  if (await signIn(DEMO_USER.email, DEMO_USER.password)) {
    await register(DEMO_USER.name, DEMO_USER.email, DEMO_USER.password);
  }
  if (useOrders.getState().orders.some((o) => o.email === DEMO_USER.email)) return;
  try {
    const products: ProductSummary[] = await fetch(`/api/products?ids=${DEMO_ORDER_PRODUCT_IDS.flat().join(",")}`).then((r) => r.json());
    useOrders.setState((s) => ({ orders: [...s.orders, ...demoOrders(DEMO_USER.email, products)] }));
  } catch {
    // Seeding is a nice-to-have; the account still works without it.
  }
}
