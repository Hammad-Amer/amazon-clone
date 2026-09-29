import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { AppliedFilters } from "@/components/search/AppliedFilters";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { MobileFilters, SortSelect } from "@/components/search/SearchControls";
import { ButtonLink } from "@/components/ui/Button";
import { filterLabel } from "@/lib/departments";
import { getAllProducts, getBestSellers, toSummary } from "@/lib/products";
import { withParsedQuery } from "@/lib/query";
import { SORT_OPTIONS, parseSearchParams, searchWithFallback, type SortKey } from "@/lib/search";
import { searchHref } from "@/lib/url";
import { cn } from "@/lib/cn";

export async function generateMetadata({ searchParams }: PageProps<"/s">): Promise<Metadata> {
  const params = parseSearchParams(await searchParams);
  const what = params.k ?? (params.c ? filterLabel(params.c) : "All products");
  return { title: `Results for ${what}` };
}

export default async function SearchPage({ searchParams }: PageProps<"/s">) {
  const requested = parseSearchParams(await searchParams);
  // Plain-English queries ("shoes under 50") become real filters with a canonical URL, so
  // chips, the sidebar, sharing and the back button all work as for hand-picked filters.
  const parsed = withParsedQuery(requested);
  if (parsed) redirect(searchHref(parsed));

  // If only the filters (e.g. a department left over from an earlier search) empty the
  // results, show the keyword's results everywhere instead, with a notice.
  const { result, params, relaxed } = searchWithFallback(getAllProducts(), requested);
  const sort = params.sort ?? "featured";

  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);
  const filterCount =
    (params.c ? 1 : 0) + (params.brands?.length ?? 0) + (params.min !== undefined || params.max !== undefined ? 1 : 0) + (params.rating !== undefined ? 1 : 0) + (params.deals ? 1 : 0);

  const sortHrefs = Object.fromEntries(
    Object.keys(SORT_OPTIONS).map((k) => [k, searchHref(params, { sort: k as SortKey })]),
  ) as Record<SortKey, string>;

  const heading = params.k ? (
    <>
      results for <span className="font-bold text-[#c45500]">&quot;{params.k}&quot;</span>
    </>
  ) : (
    <>results in <span className="font-bold text-[#c45500]">{params.c ? filterLabel(params.c) : "All Departments"}</span></>
  );

  const sidebar = <FilterSidebar params={params} result={result} />;

  return (
    <div className="bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amz-border px-3 py-2.5 shadow-sm md:px-5">
        <p className="text-sm">
          {result.total > 0 ? `${from}-${to} of ${result.total}` : "0"} {heading}
        </p>
        <div className="flex items-center gap-2">
          <MobileFilters count={filterCount}>{sidebar}</MobileFilters>
          <SortSelect value={sort} hrefs={sortHrefs} />
        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-3 py-4 md:px-5">
        <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filters">
          {sidebar}
        </aside>

        <div className="min-w-0 flex-1">
          <AppliedFilters params={params} />
          {relaxed && (
            <div role="status" className="mb-5 rounded-lg border border-[#fbd8b4] bg-[#fcf5ee] px-4 py-3 text-sm">
              No results for <b>&quot;{requested.k}&quot;</b>{" "}
              {requested.c ? (
                <>
                  in <b>{filterLabel(requested.c)}</b>
                </>
              ) : (
                "with your selected filters"
              )}
              . Showing results from <b>All Departments</b> instead.
            </div>
          )}
          {params.k && result.facets.categories.length > 1 && !params.c && (
            <nav aria-label="Narrow your search" className="mb-5">
              <h2 className="mb-2 text-lg font-bold">Narrow your search</h2>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {result.facets.categories.map((f) => (
                  <Link
                    key={f.slug}
                    href={searchHref(params, { c: f.slug })}
                    className="shrink-0 rounded-full border border-amz-border bg-[#f7fafa] px-4 py-1.5 text-sm hover:bg-[#edfdff]"
                  >
                    {f.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}

          {result.total === 0 ? (
            <NoResults query={params.k} />
          ) : (
            <>
              <h2 className="mb-3 text-xl font-bold">Results</h2>
              <p className="-mt-2 mb-3 text-xs text-amz-muted">
                Check each product page for other buying options. Price and other details may vary based on product size and colour.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4 2xl:grid-cols-5">
                {result.items.map((p, i) => (
                  <ProductCard key={p.id} product={toSummary(p)} priority={i < 4} />
                ))}
              </div>
              {result.pageCount > 1 && (
                <Pagination page={result.page} pageCount={result.pageCount} href={(page) => searchHref(params, { page })} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (p: number) => string }) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const cls = "flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm";
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(cls, "hover:bg-[#f0f2f2]")}>‹ Previous</Link>
      ) : (
        <span className={cn(cls, "text-[#b7b7b7]")}>‹ Previous</span>
      )}
      {pages.map((p) =>
        p === page ? (
          <span key={p} aria-current="page" className={cn(cls, "border border-amz-text font-bold")}>
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} className={cn(cls, "hover:bg-[#f0f2f2]")}>
            {p}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={href(page + 1)} className={cn(cls, "hover:bg-[#f0f2f2]")}>Next ›</Link>
      ) : (
        <span className={cn(cls, "text-[#b7b7b7]")}>Next ›</span>
      )}
    </nav>
  );
}

function NoResults({ query }: { query?: string }) {
  const picks = getBestSellers(8).map(toSummary);
  return (
    <div>
      <div className="rounded-lg border border-amz-border p-6">
        <h2 className="text-lg font-bold">
          No results for {query ? <span className="text-[#c45500]">&quot;{query}&quot;</span> : "these filters"}.
        </h2>
        <p className="mt-1 text-sm text-amz-muted">
          Try checking your spelling, using more general terms, or removing some filters.
        </p>
        <ButtonLink href="/s" variant="outline" className="mt-4">
          Browse all products
        </ButtonLink>
      </div>
      <h3 className="mb-3 mt-8 text-lg font-bold">Popular right now</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {picks.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
