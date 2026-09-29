import Image from "next/image";
import Link from "next/link";
import { boughtLabel, formatCount } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";
import { DeliveryDate } from "./DeliveryDate";
import { ListPrice, Price } from "./Price";
import { Stars } from "./Rating";

/** Search-results grid card, modelled on Amazon's results layout. */
export function ProductCard({ product: p, priority = false }: { product: ProductSummary; priority?: boolean }) {
  const bought = boughtLabel(p.boughtPastMonth);
  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-[#e7e7e7] bg-white">
      <Link href={`/dp/${p.id}`} className="relative block aspect-square bg-[#f7f8f8]">
        {p.badge && (
          <span
            className={
              p.badge === "Best Seller"
                ? "absolute left-0 top-0 z-10 rounded-br-md bg-[#e47911] px-2 py-1 text-xs font-medium text-white"
                : "absolute left-0 top-0 z-10 rounded-br-md bg-amz-header px-2 py-1 text-xs font-medium text-white"
            }
          >
            {p.badge}
          </span>
        )}
        <Image
          src={p.thumbnail}
          alt={p.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
          className="object-contain p-4 mix-blend-multiply"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {p.brand && <p className="text-[13px] font-bold text-amz-text">{p.brand}</p>}
        <Link href={`/dp/${p.id}`} className="line-clamp-2 text-[15px] leading-snug text-amz-text hover:text-amz-link-hover">
          {p.title}
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <span>{p.rating.toFixed(1)}</span>
          <Stars rating={p.rating} size={15} />
          <span className="text-amz-link">({formatCount(p.ratingCount)})</span>
        </div>
        {bought && <p className="text-[13px] text-amz-muted">{bought}</p>}
        {p.discountPercentage > 0 && (
          <span className="w-fit rounded-sm bg-amz-deal px-1.5 py-0.5 text-xs font-bold text-white">
            Save {p.discountPercentage}%
          </span>
        )}
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <Price amount={p.price} />
          {p.listPrice && <ListPrice amount={p.listPrice} />}
        </div>
        <p className="text-[13px] text-amz-text">
          {p.fastDelivery ? (
            <>
              FREE delivery <DeliveryDate days={2} />
            </>
          ) : (
            <>
              Delivery <DeliveryDate days={5} />
            </>
          )}
        </p>
        {p.stock > 0 && p.stock <= 10 && (
          <p className="text-[13px] text-amz-deal">Only {p.stock} left in stock - order soon.</p>
        )}
        <div className="mt-auto pt-2">
          <AddToCartButton product={p} size="sm" />
        </div>
      </div>
    </article>
  );
}
