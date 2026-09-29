"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cart";
import type { ProductSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Confirms an add-to-cart with a toast linking to the cart. `count` > 1 covers bundles. */
export function showAddedToast(product: ProductSummary, count = 1) {
  toast.custom(
    (id) => (
      <div className="flex w-[340px] items-center gap-3 rounded-2xl bg-surface p-3 shadow-[0_8px_30px_rgba(11,36,71,0.18)] ring-1 ring-amz-border">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sky">
          <Image src={product.thumbnail} alt="" fill sizes="56px" className="object-contain mix-blend-multiply" />
        </div>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-bold text-amz-green">✓ {count > 1 ? `${count} items added to cart` : "Added to cart"}</p>
          <p className="truncate text-amz-muted">
            {product.title}
            {count > 1 && ` and ${count - 1} more`}
          </p>
        </div>
        <Link
          href="/cart"
          onClick={() => toast.dismiss(id)}
          className="shrink-0 rounded-full bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand-hover"
        >
          Go to Cart
        </Link>
      </div>
    ),
    { duration: 3500 },
  );
}

/** Adds to cart in place (no navigation) and confirms with a toast linking to the cart. */
export function AddToCartButton({
  product,
  qty = 1,
  className,
  size = "md",
  variant,
}: {
  product: ProductSummary;
  qty?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "brand" | "dark";
}) {
  const add = useCart((s) => s.add);
  const outOfStock = product.stock <= 0;

  return (
    <Button
      size={size}
      variant={variant}
      disabled={outOfStock}
      className={cn("w-full", className)}
      onClick={() => {
        add(product, qty);
        showAddedToast(product);
      }}
    >
      {outOfStock ? "Currently unavailable" : "Add to cart"}
    </Button>
  );
}
