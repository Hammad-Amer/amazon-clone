import { addDays } from "./format";
import { orderTotals, type Address, type Order } from "./orders";
import type { ProductSummary } from "./types";

export const DEMO_ADDRESS: Address = {
  fullName: "Demo Shopper",
  phone: "+1 555 010 2030",
  line1: "410 Terry Ave N",
  city: "Seattle",
  state: "WA",
  zip: "98109",
  country: "United States",
};

/** Product ids used for the demo account's order history. */
export const DEMO_ORDER_PRODUCT_IDS = [[100, 5], [88, 44, 51]];

/** Two past orders (one delivered, one on its way) so the demo account looks lived-in. */
export function demoOrders(email: string, products: ProductSummary[], now = new Date()): Order[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const specs = [
    { id: "112-3941870-2210456", ids: DEMO_ORDER_PRODUCT_IDS[0], placedDaysAgo: 14, days: 5, shipping: "standard" as const },
    { id: "112-8830152-6604321", ids: DEMO_ORDER_PRODUCT_IDS[1], placedDaysAgo: 1, days: 3, shipping: "standard" as const },
  ];
  return specs.map((s) => {
    const items = s.ids.map((id) => byId.get(id)).filter((p): p is ProductSummary => !!p).map((product) => ({ product, qty: 1 }));
    const sub = items.reduce((n, i) => n + i.product.price * i.qty, 0);
    const placed = addDays(now, -s.placedDaysAgo);
    return {
      id: s.id,
      email,
      items,
      address: DEMO_ADDRESS,
      payment: { method: "card", brand: "Visa", last4: "4242" },
      shipping: s.shipping,
      ...orderTotals(sub, 0),
      createdAt: placed.toISOString(),
      deliveryBy: addDays(placed, s.days).toISOString(),
    };
  });
}
