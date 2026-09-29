import { CATEGORY_LABELS, DEPARTMENTS, categoryLabel, resolveCategoryFilter } from "./departments";
import type { Product } from "./types";

export const SORT_OPTIONS = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Avg. Customer Review",
  newest: "Newest Arrivals",
  bestselling: "Best Sellers",
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export type SearchParams = {
  k?: string;
  c?: string;
  brands?: string[];
  min?: number;
  max?: number;
  rating?: number;
  deals?: boolean;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
};

export type SearchResult = {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  facets: {
    categories: { slug: string; label: string; count: number }[];
    brands: { name: string; count: number }[];
  };
};

export const PAGE_SIZE = 24;

const STOP_WORDS = new Set(["for", "and", "the", "with", "a", "an", "of", "in", "to", "on"]);

// Words shoppers use that don't literally appear in product data.
const SYNONYMS: Record<string, string[]> = {
  clothes: DEPARTMENTS.find((d) => d.slug === "fashion")!.categories,
  clothing: DEPARTMENTS.find((d) => d.slug === "fashion")!.categories,
  apparel: DEPARTMENTS.find((d) => d.slug === "fashion")!.categories,
  electronics: DEPARTMENTS.find((d) => d.slug === "electronics")!.categories,
  makeup: ["beauty"],
  perfume: ["fragrances"],
  food: ["groceries"],
  mobile: ["smartphones", "mobile-accessories"],
  jewelry: ["womens-jewellery"],
  bag: ["womens-bags"],
  bags: ["womens-bags"],
};

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/'s$|'/g, ""))
    .filter((t) => t && !STOP_WORDS.has(t));
}

type Field = { words: string[]; text: string; weight: number };

function fieldsOf(p: Product): Field[] {
  const f = (s: string, weight: number): Field => {
    const text = s.toLowerCase().replace(/'/g, "");
    return { text, words: text.split(/[^a-z0-9]+/).filter(Boolean), weight };
  };
  return [
    f(p.title, 3),
    f(p.brand ?? "", 2),
    f(`${categoryLabel(p.category)} ${p.category}`, 2),
    f(p.tags.join(" "), 1),
  ];
}

/**
 * Word-prefix match for short tokens (so "men" doesn't hit "women"),
 * substring match for longer ones (so "phone" hits "smartphones").
 */
function fieldMatches(field: Field, token: string): boolean {
  if (field.words.some((w) => w.startsWith(token))) return true;
  return token.length >= 4 && field.text.includes(token);
}

/** Returns a relevance score, or 0 if any token fails to match. */
function relevance(p: Product, tokens: string[]): number {
  if (tokens.length === 0) return 1;
  const fields = fieldsOf(p);
  let score = 0;
  for (const token of tokens) {
    const synonymCats = SYNONYMS[token];
    if (synonymCats?.includes(p.category)) {
      score += 2;
      continue;
    }
    const hit = fields.filter((f) => fieldMatches(f, token));
    if (hit.length === 0) return 0;
    score += Math.max(...hit.map((f) => f.weight));
  }
  return score;
}

const popularity = (p: Product) =>
  (p.badge ? 1_000_000 : 0) + p.boughtPastMonth * p.rating + p.ratingCount / 100;

export function searchProducts(all: Product[], params: SearchParams): SearchResult {
  const tokens = tokenize(params.k ?? "");
  const scored = new Map<number, number>();
  const textMatches = all.filter((p) => {
    const s = relevance(p, tokens);
    if (s > 0) scored.set(p.id, s);
    return s > 0;
  });

  const cats = resolveCategoryFilter(params.c);
  const brands = params.brands?.length ? new Set(params.brands) : null;

  const passesNonBrand = (p: Product) =>
    (!cats || cats.includes(p.category)) &&
    (params.min === undefined || p.price >= params.min) &&
    (params.max === undefined || p.price <= params.max) &&
    (params.rating === undefined || p.rating >= params.rating) &&
    (!params.deals || p.discountPercentage > 0);

  const beforeBrand = textMatches.filter(passesNonBrand);
  const filtered = brands ? beforeBrand.filter((p) => p.brand && brands.has(p.brand)) : beforeBrand;

  const sort = params.sort ?? "featured";
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating || b.ratingCount - a.ratingCount;
      case "newest":
        return b.createdAt.localeCompare(a.createdAt);
      case "bestselling":
        return b.boughtPastMonth - a.boughtPastMonth || popularity(b) - popularity(a);
      default:
        return (scored.get(b.id)! - scored.get(a.id)!) || popularity(b) - popularity(a);
    }
  });

  const pageSize = params.pageSize ?? PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(Math.max(1, params.page ?? 1), pageCount);

  // Category facet counts ignore the category filter; brand facet counts ignore the brand filter.
  const categoryCounts = new Map<string, number>();
  for (const p of textMatches) categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1);
  const brandCounts = new Map<string, number>();
  for (const p of beforeBrand) if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);

  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: sorted.length,
    page,
    pageCount,
    pageSize,
    facets: {
      categories: Object.keys(CATEGORY_LABELS)
        .filter((slug) => categoryCounts.has(slug))
        .map((slug) => ({ slug, label: categoryLabel(slug), count: categoryCounts.get(slug)! })),
      brands: [...brandCounts]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    },
  };
}

/**
 * Like searchProducts, but if the keyword matches products and only the filters
 * (department, brand, price, rating, deals) empty the results, fall back to the
 * keyword alone rather than showing a dead end.
 */
export function searchWithFallback(
  all: Product[],
  params: SearchParams,
): { result: SearchResult; params: SearchParams; relaxed: boolean } {
  const result = searchProducts(all, params);
  const filtered =
    !!params.c || !!params.brands?.length || params.min !== undefined || params.max !== undefined || params.rating !== undefined || !!params.deals;
  if (result.total > 0 || !params.k || !filtered) return { result, params, relaxed: false };

  const broadParams: SearchParams = { k: params.k, ...(params.sort && { sort: params.sort }) };
  const broad = searchProducts(all, broadParams);
  return broad.total > 0 ? { result: broad, params: broadParams, relaxed: true } : { result, params, relaxed: false };
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | string[] | undefined) => {
  const s = first(v);
  if (s === undefined || s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export function parseSearchParams(raw: RawParams): SearchParams {
  const brand = raw.brand;
  const sort = first(raw.sort);
  return {
    k: first(raw.k)?.trim() || undefined,
    c: first(raw.c) || undefined,
    brands: brand === undefined ? undefined : Array.isArray(brand) ? brand : [brand],
    min: num(raw.min),
    max: num(raw.max),
    rating: num(raw.rating),
    sort: sort && sort in SORT_OPTIONS ? (sort as SortKey) : "featured",
    page: num(raw.page),
    deals: first(raw.deals) === "1" ? true : undefined,
  };
}
