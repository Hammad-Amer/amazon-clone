import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { DEPARTMENTS } from "@/lib/departments";
import { getAllProducts, toSummary } from "@/lib/products";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Today's Deals" };

const DISCOUNT_TIERS = [10, 15, 20];

export default async function DealsPage({ searchParams }: PageProps<"/deals">) {
  const sp = await searchParams;
  const c = typeof sp.c === "string" ? sp.c : undefined;
  const min = Number(sp.min) || 0;
  const dept = DEPARTMENTS.find((d) => d.slug === c);

  const deals = getAllProducts()
    .filter((p) => p.discountPercentage > 0 && p.discountPercentage >= min && (!dept || dept.categories.includes(p.category)))
    .sort((a, b) => b.discountPercentage - a.discountPercentage || b.boughtPastMonth - a.boughtPastMonth);

  const href = (next: { c?: string; min?: number }) => {
    const q = new URLSearchParams();
    const nc = "c" in next ? next.c : c;
    const nm = "min" in next ? next.min : min;
    if (nc) q.set("c", nc);
    if (nm) q.set("min", String(nm));
    return `/deals${q.size ? `?${q}` : ""}`;
  };

  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors",
      active
        ? "bg-brand font-bold text-white shadow-[0_2px_8px_rgba(47,128,237,0.28)]"
        : "bg-surface ring-1 ring-amz-border hover:bg-sky-tint hover:text-brand",
    );

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-5 md:px-5">
      <div className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b2447] via-[#19376d] to-[#2f80ed] px-6 py-9 text-white md:px-10">
        <span aria-hidden className="absolute -right-10 -top-16 size-56 rounded-full bg-surface/10" />
        <span aria-hidden className="absolute -bottom-20 right-28 size-40 rounded-full bg-[#7cc4ff]/20" />
        <p className="relative text-sm font-bold uppercase tracking-widest text-amz-search">Limited-time savings</p>
        <h1 className="relative mt-1 text-3xl font-extrabold tracking-tight md:text-5xl">Today&apos;s Deals</h1>
        <p className="relative mt-2 max-w-xl text-sm text-[#d6e4f5]">
          {deals.length} deals on electronics, fashion, beauty and more — up to {deals[0]?.discountPercentage ?? 0}% off.
        </p>
      </div>

      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto p-0.5">
        <Link href={href({ c: undefined })} className={chip(!dept)}>
          All deals
        </Link>
        {DEPARTMENTS.map((d) => (
          <Link key={d.slug} href={href({ c: d.slug })} className={chip(dept?.slug === d.slug)}>
            {d.label}
          </Link>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-bold text-strong">Discount:</span>
        <Link href={href({ min: 0 })} className={chip(!min)}>
          Any
        </Link>
        {DISCOUNT_TIERS.map((t) => (
          <Link key={t} href={href({ min: t })} className={chip(min === t)}>
            {t}% off or more
          </Link>
        ))}
      </div>

      {deals.length === 0 ? (
        <p className="rounded-2xl bg-surface p-8 text-center shadow-[0_2px_12px_rgba(11,36,71,0.07)]">No deals match these filters right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {deals.map((p, i) => (
            <ProductCard key={p.id} product={toSummary(p)} priority={i < 5} />
          ))}
        </div>
      )}
    </div>
  );
}
