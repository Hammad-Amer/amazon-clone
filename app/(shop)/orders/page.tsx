import type { Metadata } from "next";
import { OrdersList } from "@/components/orders/OrdersViews";

export const metadata: Metadata = { title: "Your Orders" };

export default function OrdersPage() {
  return (
    <div className="px-3 py-5 md:px-5">
      <OrdersList />
    </div>
  );
}
