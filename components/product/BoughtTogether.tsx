"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { useCart } from "@/store/cart";
import { showAddedToast } from "./AddToCartButton";
import { Price } from "./Price";

/** Amazon's bundle box: tick the items you want and add them to the cart in one go. */
export function BoughtTogether({ products }: { products: ProductSummary[] }) {
  const add = useCart((s) => s.add);
  const [checked, setChecked] = useState(() => products.map((p) => p.stock > 0));
  const chosen = products.filter((_, i) => checked[i]);
  const total = chosen.reduce((sum, p) => sum + p.price, 0);

  const label =
    chosen.length === products.length && chosen.length > 1
      ? chosen.length === 2
        ? "Add both to Cart"
        : `Add all ${chosen.length} to Cart`
      : chosen.length > 1
        ? `Add ${chosen.length} to Cart`
        : "Add to Cart";

  return (
    <section aria-labelledby="fbt-heading">
      <h2 id="fbt-heading" className="mb-4 text-2xl font-bold">
        Frequently bought together
      </h2>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          {products.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 sm:gap-3">
              {i > 0 && <Plus size={20} className="shrink-0 text-amz-muted" aria-hidden />}
              <Link
                href={`/dp/${p.id}`}
                className={cn(
                  "relative block h-24 w-24 shrink-0 bg-[#f7f8f8] transition-opacity sm:h-32 sm:w-32",
                  !checked[i] && "opacity-40",
                )}
              >
                <Image src={p.thumbnail} alt={p.title} fill sizes="128px" className="object-contain p-2 mix-blend-multiply" />
              </Link>
            </div>
          ))}
        </div>

        <div className="lg:w-56 lg:shrink-0">
          <p className="text-sm">
            Total price:{" "}
            {chosen.length > 0 ? (
              <Price amount={total} size="sm" className="align-middle" />
            ) : (
              <span className="text-amz-muted">Select an item</span>
            )}
          </p>
          <Button
            className="mt-2 w-full"
            size="sm"
            disabled={chosen.length === 0}
            onClick={() => {
              for (const p of chosen) add(p, 1);
              showAddedToast(chosen[0], chosen.length);
            }}
          >
            {label}
          </Button>
          <p className="mt-2 text-xs text-amz-muted">These items are shipped from and sold by different sellers.</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm">
        {products.map((p, i) => (
          <li key={p.id}>
            <label className={cn("flex items-start gap-2", p.stock > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-60")}>
              <input
                type="checkbox"
                checked={checked[i]}
                disabled={p.stock <= 0}
                onChange={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
                className="mt-0.5 h-4 w-4 shrink-0 accent-amz-link"
              />
              <span>
                {i === 0 ? (
                  <>
                    <b>This item: </b>
                    {p.title}
                  </>
                ) : (
                  <Link href={`/dp/${p.id}`} className="text-amz-link hover:text-amz-link-hover hover:underline">
                    {p.title}
                  </Link>
                )}{" "}
                <span className="font-bold text-amz-deal">{formatPrice(p.price)}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
