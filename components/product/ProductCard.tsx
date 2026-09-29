import Image from "next/image";
import Link from "next/link";
import { boughtLabel, formatCount } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";
import { DeliveryDate } from "./DeliveryDate";
import { ListPrice, Price } from "./Price";
import { Stars } from "./Rating";

/** Search-results grid card: a soft white card that lifts on hover. */
export function ProductCard({ product: p, priority = false }: { product: ProductSummary; priority?: boolean }) {
  const bought = boughtLabel(p.boughtPastMonth);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_2px_12px_rgba(11,36,71,0.07)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,36,71,0.12)]">
      <Link href={`/dp/${p.id}`} className="relative m-2 mb-0 block aspect-square overflow-hidden rounded-xl bg-sky">
        {p.badge && (
          <span
            className={
              p.badge === "Best Seller"
                ? "absolute left-2 top-2 z-10 rounded-full bg-[#f59e0b] px-2.5 py-0.5 text-[11px] font-bold text-white"
                : "absolute left-2 top-2 z-10 rounded-full bg-amz-header px-2.5 py-0.5 text-[11px] font-bold text-white"
            }
          >
            {p.badge}
          </span>
        )}
        {p.discountPercentage > 0 && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-amz-deal px-2 py-0.5 text-[11px] font-bold text-white">
            -{p.discountPercentage}%
          </span>
        )}
        <Image
          src={p.thumbnail}
          alt={p.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
          className="object-contain p-4 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {p.brand && <p className="text-[12px] font-bold uppercase tracking-wide text-brand">{p.brand}</p>}
        <Link href={`/dp/${p.id}`} className="line-clamp-2 text-[15px] leading-snug text-amz-text hover:text-brand">
          {p.title}
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <span>{p.rating.toFixed(1)}</span>
          <Stars rating={p.rating} size={15} />
          <span className="text-amz-muted">({formatCount(p.ratingCount)})</span>
        </div>
        {bought && <p className="text-[13px] text-amz-muted">{bought}</p>}
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <Price amount={p.price} />
          {p.listPrice && <ListPrice amount={p.listPrice} />}
        </div>
        <p className="text-[13px] text-amz-text">
          {p.fastDelivery ? (
            <>
              <span className="font-bold text-amz-green">FREE delivery</span> <DeliveryDate days={2} />
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
          <AddToCartButton product={p} size="sm" variant="brand" />
        </div>
      </div>
    </article>
  );
}
