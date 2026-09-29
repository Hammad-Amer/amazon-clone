import type { SearchParams, SortKey } from "./search";

/**
 * Turns plain-English search text into filters: "nike shoes under $100 4 stars"
 * becomes k="nike shoes", max=100, rating=4. Whatever isn't understood stays as keywords.
 */
export type ParsedQuery = {
  k?: string;
  changes: Partial<Pick<SearchParams, "min" | "max" | "rating" | "deals" | "sort">>;
  /** True when the text was rewritten, i.e. the search should use the parsed version. */
  changed: boolean;
};

// "$1,299", "50", "49.99", "1k", "50 dollars", "50$"
const AMOUNT = String.raw`\$?\s*(\d[\d,]*(?:\.\d+)?)(?:\s*(k)\b)?(?:\s*(?:dollars?|usd|bucks)\b)?\$?`;
const STARS = String.raw`([1-5](?:\.\d)?)\s*\+?\s*-?\s*stars?\b(?:\s*(?:&|and)\s*(?:up|above|over|more)\b)?`;

const amount = (n: string, k?: string) => Number(n.replace(/,/g, "")) * (k ? 1000 : 1);

type Changes = ParsedQuery["changes"];
type Rule = { re: RegExp; apply: (m: string[], c: Changes) => void };

const sortRule = (words: string, sort: SortKey): Rule => ({
  re: new RegExp(String.raw`\b(?:${words})\b`, "g"),
  apply: (_, c) => {
    c.sort ??= sort;
  },
});

// Order matters: ranges before single bounds, star ratings before "at least N",
// and compound phrases ("best sellers") before single words ("best").
const RULES: Rule[] = [
  {
    re: new RegExp(String.raw`\b(?:between|from)\s+${AMOUNT}\s*(?:and|to|-)\s*${AMOUNT}`, "g"),
    apply: ([, a, ak, b, bk], c) => {
      const [lo, hi] = [amount(a, ak), amount(b, bk)].sort((x, y) => x - y);
      c.min = lo;
      c.max = hi;
    },
  },
  {
    // "$20-$50", "$20 to 50", "20-50 dollars"
    re: new RegExp(
      String.raw`\$(\d[\d,]*(?:\.\d+)?)\s*(?:-|to)\s*\$?(\d[\d,]*(?:\.\d+)?)|\b(\d[\d,]*(?:\.\d+)?)\s*(?:-|to)\s*(\d[\d,]*(?:\.\d+)?)\s*(?:dollars|usd|bucks)\b`,
      "g",
    ),
    apply: ([, a1, b1, a2, b2], c) => {
      const [lo, hi] = [amount(a1 ?? a2), amount(b1 ?? b2)].sort((x, y) => x - y);
      c.min = lo;
      c.max = hi;
    },
  },
  {
    re: new RegExp(String.raw`\b(?:(?:at least|over|above|with|min(?:imum)?)\s+)?${STARS}|\brated\s+([1-5](?:\.\d)?)\s*(?:\+|(?:&|and)\s*(?:up|above|over)\b)?`, "g"),
    apply: ([, a, b], c) => {
      const n = Number(a ?? b);
      if (n >= 1) c.rating = Math.min(n, 4.5);
    },
  },
  {
    re: new RegExp(String.raw`\b(?:under|below|less than|cheaper than|max(?:imum)?|up to|at most|no more than|within)\s+${AMOUNT}`, "g"),
    apply: ([, n, k], c) => {
      c.max = amount(n, k);
    },
  },
  {
    re: new RegExp(String.raw`\b(?:over|above|more than|at least|min(?:imum)?|from|starting at)\s+${AMOUNT}`, "g"),
    apply: ([, n, k], c) => {
      c.min = amount(n, k);
    },
  },
  {
    re: /\b(?:on sale|for sale|on offer|on deal|deals?|discounted|discounts?|sale)\b/g,
    apply: (_, c) => {
      c.deals = true;
    },
  },
  sortRule("top rated|best rated|highest rated|best reviewed|top reviewed", "rating"),
  sortRule("best ?sellers?|best ?selling|most popular|popular|trending", "bestselling"),
  sortRule("cheapest|cheap|budget|affordable|inexpensive|lowest price|low price", "price-asc"),
  sortRule("most expensive|priciest", "price-desc"),
  sortRule("newest|latest|new arrivals?|new releases?", "newest"),
  sortRule("best|top", "rating"),
];

const LEADING = /^(?:(?:show me|find me|find|search for|look for|looking for|i want|i need|get me|buy)\s+)+/;
// Connector words left dangling once a phrase is cut out ("shoes for under 50" -> "shoes for").
const EDGE = /^(?:for|with|and|or|that|are|is|in|at|of|priced|price|costing|costs?|rated|rating|stars?|&|,|-)\s+|\s+(?:for|with|and|or|that|are|is|in|at|of|priced|price|costing|costs?|rated|rating|stars?|&|,|-)$/;
const GENERIC = /\b(?:products|items|stuff|things)\b/g;

export function parseQuery(text: string | undefined): ParsedQuery {
  const original = (text ?? "").replace(/\s+/g, " ").trim();
  if (!original) return { k: undefined, changes: {}, changed: false };

  const changes: Changes = {};
  let s = original.toLowerCase();
  let matched = false;
  for (const rule of RULES) {
    s = s.replace(rule.re, (...m: unknown[]) => {
      // replace() passes (match, ...groups, offset, input); keep only the match and groups.
      rule.apply(m.slice(0, -2).map((g) => (typeof g === "string" ? g : undefined)) as string[], changes);
      matched = true;
      return " ";
    });
  }

  s = s.replace(LEADING, "");
  if (matched) s = s.replace(GENERIC, " ");
  s = s.replace(/\s+/g, " ").trim();
  for (let prev = ""; prev !== s; ) {
    prev = s;
    s = s.replace(EDGE, "").trim();
  }
  if (s === "for" || s === "with" || s === "and") s = "";

  // Nothing understood: keep the user's text exactly as typed (including its casing).
  if (!matched && s === original.toLowerCase()) return { k: original, changes: {}, changed: false };
  return { k: s || undefined, changes, changed: true };
}

/**
 * The search params with filters pulled out of the keywords, or null if the keywords
 * contain nothing to parse. Filters already set explicitly (e.g. in the URL) win.
 */
export function withParsedQuery(params: SearchParams): SearchParams | null {
  const { k, changes, changed } = parseQuery(params.k);
  if (!changed) return null;
  return {
    ...params,
    k,
    min: params.min ?? changes.min,
    max: params.max ?? changes.max,
    rating: params.rating ?? changes.rating,
    deals: params.deals || changes.deals,
    sort: params.sort && params.sort !== "featured" ? params.sort : (changes.sort ?? params.sort),
  };
}
