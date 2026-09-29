import type { SearchParams } from "./search";

/** Builds a /s URL from typed params, dropping empty values and resetting page unless given. */
export function searchHref(params: SearchParams, changes: Partial<SearchParams> = {}): string {
  const next: SearchParams = { ...params, page: undefined, ...changes };
  const q = new URLSearchParams();
  if (next.k) q.set("k", next.k);
  if (next.c) q.set("c", next.c);
  for (const b of next.brands ?? []) q.append("brand", b);
  if (next.min !== undefined) q.set("min", String(next.min));
  if (next.max !== undefined) q.set("max", String(next.max));
  if (next.rating !== undefined) q.set("rating", String(next.rating));
  if (next.deals) q.set("deals", "1");
  if (next.sort && next.sort !== "featured") q.set("sort", next.sort);
  if (next.page && next.page > 1) q.set("page", String(next.page));
  const s = q.toString();
  return s ? `/s?${s}` : "/s";
}

export function toggleBrand(params: SearchParams, brand: string): string[] {
  const brands = params.brands ?? [];
  return brands.includes(brand) ? brands.filter((b) => b !== brand) : [...brands, brand];
}
