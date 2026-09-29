"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cart";
import type { ProductSummary } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Adds to cart in place (no navigation) and confirms with a toast linking to the cart. */
export function AddToCartButton({
  product,
  qty = 1,
  className,
  size = "md",
}: {
  product: ProductSummary;
  qty?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const add = useCart((s) => s.add);
  const outOfStock = product.stock <= 0;

  return (
    <Button
      size={size}
      disabled={outOfStock}
      className={cn("w-full", className)}
      onClick={() => {
        add(product, qty);
        toast.custom(
          (id) => (
            <div className="flex w-[340px] items-center gap-3 rounded-lg border border-amz-border bg-white p-3 shadow-xl">
              <div className="relative h-14 w-14 shrink-0 bg-[#f7f8f8]">
                <Image src={product.thumbnail} alt="" fill sizes="56px" className="object-contain mix-blend-multiply" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold text-amz-green">✓ Added to cart</p>
                <p className="truncate text-amz-muted">{product.title}</p>
              </div>
              <Link
                href="/cart"
                onClick={() => toast.dismiss(id)}
                className="shrink-0 rounded-full border border-amz-border px-3 py-1 text-xs hover:bg-gray-50"
              >
                Go to Cart
              </Link>
            </div>
          ),
          { duration: 3500 },
        );
      }}
    >
      {outOfStock ? "Currently unavailable" : "Add to cart"}
    </Button>
  );
}
