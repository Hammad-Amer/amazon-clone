"use client";

import { CircleCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { checkoutItems, itemCount, qualifiesForFreeShipping, subtotal } from "@/lib/cart";
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";

export function FreeShippingNote({ amount }: { amount: number }) {
  if (amount === 0) return null;
  if (qualifiesForFreeShipping(amount)) {
    return (
      <p className="flex gap-1.5 rounded-xl bg-[#e8f6ec] p-2.5 text-xs text-[#1a7f37]">
        <CircleCheck size={18} className="shrink-0 fill-[#1a7f37] text-white" />
        <span>
          Your order qualifies for FREE delivery.{" "}
          <span className="text-amz-muted">Choose this option at checkout.</span>
        </span>
      </p>
    );
  }
  const remaining = FREE_SHIPPING_THRESHOLD - amount;
  return (
    <div className="text-xs">
      <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-sky-tint">
        <div className="h-full rounded-full bg-brand" style={{ width: `${(amount / FREE_SHIPPING_THRESHOLD) * 100}%` }} />
      </div>
      Add <b className="text-brand">{formatPrice(remaining)}</b> of eligible items to your order for FREE delivery.
    </div>
  );
}

/** Free-shipping message driven by the live cart subtotal. */
export function LiveFreeShippingNote() {
  const amount = useCart((s) => subtotal(checkoutItems(s.items)));
  return <FreeShippingNote amount={amount} />;
}

/** Subtotal box used in the cart sidebar and on the "Added to cart" page. */
export function CartSummary({ compact = false }: { compact?: boolean }) {
  const items = useCart((s) => s.items);
  const selected = checkoutItems(items);
  const count = itemCount(selected);
  const total = subtotal(selected);

  return (
    <div className="space-y-3">
      {!compact && <FreeShippingNote amount={total} />}
      <p className="text-lg">
        Subtotal ({count} {count === 1 ? "item" : "items"}): <b>{formatPrice(total)}</b>
      </p>
      <ButtonLink
        href="/checkout"
        variant="brand"
        className="w-full"
        aria-disabled={count === 0}
        onClick={(e) => count === 0 && e.preventDefault()}
      >
        Proceed to checkout{compact ? ` (${count} ${count === 1 ? "item" : "items"})` : ""}
      </ButtonLink>
    </div>
  );
}
