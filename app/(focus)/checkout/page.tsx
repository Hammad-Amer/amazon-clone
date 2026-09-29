import type { Metadata } from "next";
import { Suspense } from "react";
import { Checkout, CheckoutHeader } from "@/components/checkout/Checkout";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = { title: "Secure checkout" };

export default function CheckoutPage() {
  return (
    <div className="min-h-full bg-sky">
      <div className="flex items-center bg-amz-header pl-2">
        <Logo />
        <div className="flex-1">
          <CheckoutHeader />
        </div>
      </div>
      <div className="px-3 py-5 md:px-5">
        <Suspense>
          <Checkout />
        </Suspense>
      </div>
    </div>
  );
}
