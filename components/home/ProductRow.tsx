"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Price } from "@/components/product/Price";
import { Stars } from "@/components/product/Rating";
import { formatCount } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { cn } from "@/lib/cn";
import { homeCardCls } from "./Cards";

/**
 * Horizontal product strip. Native scrolling (with snap) keeps touch/trackpad
 * behaviour natural; the arrow buttons page it on desktop.
 */
export function ProductRow({
  title,
  products,
  href,
  variant = "image",
  subtitle,
  framed = false,
}: {
  title: string;
  products: ProductSummary[];
  href?: string;
  /** "image": image only (Amazon's homepage strips); "deal": adds discount badge + price; "detail": title, stars, price */
  variant?: "image" | "deal" | "detail";
  subtitle?: string;
  /** Soft rounded card, used on the homepage. */
  framed?: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  if (products.length === 0) return null;

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className={framed ? homeCardCls : "bg-surface px-5 py-4"}>
      <div className="mb-2 flex items-baseline gap-3">
        <h2 className={cn("text-[21px] leading-tight", framed ? "font-extrabold tracking-tight" : "font-bold")}>{title}</h2>
        {href && (
          <Link
            href={href}
            className={cn("text-[13px] hover:underline", framed ? "font-medium text-brand hover:text-brand-hover" : "text-amz-link hover:text-amz-link-hover")}
          >
            See all
          </Link>
        )}
      </div>
      {subtitle && <p className="-mt-1 mb-2 text-xs text-amz-muted">{subtitle}</p>}
      <div className="group relative">
        <div ref={scroller} className="no-scrollbar relative flex snap-x gap-3 overflow-x-auto scroll-smooth pb-1">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/dp/${p.id}`}
              className={variant === "image" ? "shrink-0 snap-start" : "w-[160px] shrink-0 snap-start md:w-[190px]"}
            >
              <div
                className={cn(
                  variant === "image"
                    ? "relative h-[150px] w-[130px] overflow-hidden rounded-lg md:h-[200px] md:w-[170px]"
                    : "relative aspect-square w-full overflow-hidden rounded-lg",
                  framed ? "rounded-xl bg-sky" : "bg-sky",
                )}
              >
                <Image
                  src={p.thumbnail}
                  alt={p.title}
                  fill
                  sizes="190px"
                  className="object-contain p-2 mix-blend-multiply"
                />
              </div>
              {variant === "deal" && p.discountPercentage > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="whitespace-nowrap rounded-full bg-amz-deal px-2 py-0.5 font-bold text-white">
                      {p.discountPercentage}% off
                    </span>
                    <span className="whitespace-nowrap font-bold text-amz-deal">Limited time deal</span>
                  </div>
                  <Price amount={p.price} size="sm" />
                  <p className="line-clamp-2 text-sm text-amz-text">{p.title}</p>
                </div>
              )}
              {variant === "detail" && (
                <div className="mt-2 space-y-0.5">
                  <p className={cn("line-clamp-2 text-sm", framed ? "text-amz-text hover:text-brand" : "text-amz-link hover:text-amz-link-hover")}>{p.title}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <Stars rating={p.rating} size={14} />
                    <span className={framed ? "text-amz-muted" : "text-amz-link"}>{formatCount(p.ratingCount)}</span>
                  </div>
                  <Price amount={p.price} size="sm" />
                </div>
              )}
            </Link>
          ))}
        </div>
        <button
          onClick={() => page(-1)}
          aria-label={`Scroll ${title} left`}
          className="absolute left-0 top-[35%] hidden h-24 w-11 -translate-y-1/2 items-center justify-center rounded-r-md border border-amz-border bg-surface/95 shadow-md group-hover:flex"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={() => page(1)}
          aria-label={`Scroll ${title} right`}
          className="absolute right-0 top-[35%] hidden h-24 w-11 -translate-y-1/2 items-center justify-center rounded-l-md border border-amz-border bg-surface/95 shadow-md group-hover:flex"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
}
