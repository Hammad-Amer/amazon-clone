import { X } from "lucide-react";
import Link from "next/link";
import { filterLabel } from "@/lib/departments";
import type { SearchParams } from "@/lib/search";
import { searchHref } from "@/lib/url";

const money = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

function priceLabel(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) return `${money(min)} to ${money(max)}`;
  return max !== undefined ? `Under ${money(max)}` : `${money(min!)} & Above`;
}

/** Removable chips for every active filter, whether picked in the sidebar or typed ("shoes under 50"). */
export function AppliedFilters({ params }: { params: SearchParams }) {
  const chips: { label: string; href: string }[] = [];
  if (params.c) chips.push({ label: filterLabel(params.c), href: searchHref(params, { c: undefined }) });
  for (const b of params.brands ?? []) {
    chips.push({ label: b, href: searchHref(params, { brands: params.brands!.filter((x) => x !== b) }) });
  }
  if (params.min !== undefined || params.max !== undefined) {
    chips.push({ label: priceLabel(params.min, params.max), href: searchHref(params, { min: undefined, max: undefined }) });
  }
  if (params.rating !== undefined) {
    chips.push({ label: `${params.rating} Stars & Up`, href: searchHref(params, { rating: undefined }) });
  }
  if (params.deals) chips.push({ label: "Today's Deals", href: searchHref(params, { deals: undefined }) });
  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Applied filters">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          aria-label={`Remove filter: ${chip.label}`}
          className="flex items-center gap-1.5 rounded-full bg-sky-tint py-1 pl-3 pr-2 text-sm font-medium text-brand ring-1 ring-[#bcd6f7] transition-colors hover:bg-brand hover:text-white hover:ring-brand"
        >
          {chip.label}
          <X size={14} strokeWidth={2.5} />
        </Link>
      ))}
      {chips.length > 1 && (
        <Link href={searchHref({ k: params.k, sort: params.sort })} className="px-1 text-sm font-medium text-brand hover:text-brand-hover hover:underline">
          Clear all
        </Link>
      )}
    </div>
  );
}
