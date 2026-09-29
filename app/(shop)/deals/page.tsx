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
      "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
      active ? "border-amz-link bg-[#edfdff] font-bold text-amz-text" : "border-amz-border bg-white hover:bg-[#f7fafa]",
    );

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-5 md:px-5">
      <div className="mb-5 overflow-hidden rounded-lg bg-gradient-to-r from-[#131921] via-[#232f3e] to-[#37475a] px-6 py-8 text-white">
        <p className="text-sm font-bold uppercase tracking-widest text-amz-search">Limited-time savings</p>
        <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Today&apos;s Deals</h1>
        <p className="mt-2 max-w-xl text-sm text-[#ddd]">
          {deals.length} deals on electronics, fashion, beauty and more — up to {deals[0]?.discountPercentage ?? 0}% off.
        </p>
      </div>

      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
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
        <span className="font-bold">Discount:</span>
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
        <p className="rounded-lg bg-white p-8 text-center">No deals match these filters right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {deals.map((p, i) => (
            <ProductCard key={p.id} product={toSummary(p)} priority={i < 5} />
          ))}
        </div>
      )}
    </div>
  );
}
