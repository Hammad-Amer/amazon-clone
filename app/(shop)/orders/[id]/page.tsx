import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetail } from "@/components/orders/OrdersViews";

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  return (
    <div className="px-3 py-5 md:px-5">
      <Suspense>
        <OrderDetail id={id} />
      </Suspense>
    </div>
  );
}
