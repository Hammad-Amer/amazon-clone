import { Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Stars } from "@/components/product/Rating";
import { DEPARTMENTS, categoryLabel, departmentOf, filterLabel } from "@/lib/departments";
import type { SearchParams, SearchResult } from "@/lib/search";
import { searchHref, toggleBrand } from "@/lib/url";
import { cn } from "@/lib/cn";

const PRICE_BUCKETS = [
  { label: "Up to $25", max: 25 },
  { label: "$25 to $50", min: 25, max: 50 },
  { label: "$50 to $100", min: 50, max: 100 },
  { label: "$100 to $500", min: 100, max: 500 },
  { label: "$500 & above", min: 500 },
];

const linkCls = "text-sm text-amz-text hover:text-amz-link-hover";

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-1.5 text-sm font-bold text-amz-text">{children}</h3>;
}

function CheckLink({ href, checked, children }: { href: string; checked: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(linkCls, "flex items-center gap-2 py-0.5")} scroll={false} role="checkbox" aria-checked={checked}>
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
          checked ? "border-amz-link bg-amz-link text-white" : "border-[#888c8c] bg-white",
        )}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      {children}
    </Link>
  );
}

export function FilterSidebar({ params, result }: { params: SearchParams; result: SearchResult }) {
  const activeDept = params.c ? DEPARTMENTS.find((d) => d.slug === params.c) ?? departmentOf(params.c) : undefined;
  const hasFilters =
    !!params.c || !!params.brands?.length || params.min !== undefined || params.max !== undefined || params.rating !== undefined || !!params.deals;

  return (
    <div className="space-y-5">
      {hasFilters && (
        <Link href={searchHref({ k: params.k, sort: params.sort })} className="text-sm text-amz-link hover:text-amz-link-hover hover:underline">
          Clear all filters
        </Link>
      )}

      <section>
        <Heading>Department</Heading>
        <ul className="space-y-1">
          {params.c && (
            <li>
              <Link href={searchHref(params, { c: undefined })} className={cn(linkCls, "flex items-center")}>
                <ChevronLeft size={14} /> Any Department
              </Link>
            </li>
          )}
          {activeDept && params.c !== activeDept.slug && (
            <li>
              <Link href={searchHref(params, { c: activeDept.slug })} className={cn(linkCls, "flex items-center")}>
                <ChevronLeft size={14} /> {activeDept.label}
              </Link>
            </li>
          )}
          {params.c && <li className="pl-3 text-sm font-bold">{filterLabel(params.c)}</li>}
          {(activeDept && params.c === activeDept.slug
            ? result.facets.categories.filter((f) => activeDept.categories.includes(f.slug))
            : params.c
              ? []
              : result.facets.categories
          ).map((f) => (
            <li key={f.slug} className={params.c ? "pl-5" : ""}>
              <Link href={searchHref(params, { c: f.slug })} className={linkCls}>
                {categoryLabel(f.slug)} <span className="text-amz-muted">({f.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Heading>Customer Reviews</Heading>
        <ul className="space-y-1">
          {[4, 3].map((r) => (
            <li key={r}>
              <Link
                href={searchHref(params, { rating: params.rating === r ? undefined : r })}
                className={cn(linkCls, "flex items-center gap-1", params.rating === r && "font-bold")}
                aria-current={params.rating === r}
              >
                <Stars rating={r} size={18} /> <span>&amp; Up</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {result.facets.brands.length > 0 && (
        <section>
          <Heading>Brands</Heading>
          <div className="max-h-72 space-y-0.5 overflow-y-auto pr-2">
            {result.facets.brands.map((b) => (
              <CheckLink
                key={b.name}
                href={searchHref(params, { brands: toggleBrand(params, b.name) })}
                checked={!!params.brands?.includes(b.name)}
              >
                {b.name}
              </CheckLink>
            ))}
          </div>
        </section>
      )}

      <section>
        <Heading>Price</Heading>
        <ul className="space-y-1">
          {PRICE_BUCKETS.map((p) => {
            const active = params.min === p.min && params.max === p.max;
            return (
              <li key={p.label}>
                <Link
                  href={searchHref(params, active ? { min: undefined, max: undefined } : { min: p.min, max: p.max })}
                  className={cn(linkCls, active && "font-bold")}
                >
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {/* Plain GET form so custom price ranges work even before JS loads. */}
        <form action="/s" className="mt-2 flex items-center gap-1.5">
          {params.k && <input type="hidden" name="k" value={params.k} />}
          {params.c && <input type="hidden" name="c" value={params.c} />}
          {params.brands?.map((b) => <input key={b} type="hidden" name="brand" value={b} />)}
          {params.rating !== undefined && <input type="hidden" name="rating" value={params.rating} />}
          {params.deals && <input type="hidden" name="deals" value="1" />}
          {params.sort && params.sort !== "featured" && <input type="hidden" name="sort" value={params.sort} />}
          <input
            name="min"
            type="number"
            min={0}
            defaultValue={params.min}
            placeholder="$ Min"
            aria-label="Minimum price"
            className="w-[72px] rounded-md border border-[#888c8c] px-2 py-1 text-sm shadow-inner"
          />
          <input
            name="max"
            type="number"
            min={0}
            defaultValue={params.max}
            placeholder="$ Max"
            aria-label="Maximum price"
            className="w-[72px] rounded-md border border-[#888c8c] px-2 py-1 text-sm shadow-inner"
          />
          <button className="rounded-md border border-amz-border bg-white px-2.5 py-1 text-sm shadow-sm hover:bg-gray-50">
            Go
          </button>
        </form>
      </section>

      <section>
        <Heading>Deals &amp; Discounts</Heading>
        <CheckLink href={searchHref(params, { deals: !params.deals || undefined })} checked={!!params.deals}>
          Today&apos;s Deals
        </CheckLink>
      </section>
    </div>
  );
}
