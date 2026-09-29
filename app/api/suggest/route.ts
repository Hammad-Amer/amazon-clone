import { NextResponse } from "next/server";
import { CATEGORY_LABELS, categoryLabel } from "@/lib/departments";
import { getAllProducts } from "@/lib/products";
import type { Suggestion } from "@/lib/types";

export function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 1) return NextResponse.json([]);

  const suggestions: Suggestion[] = [];
  const seen = new Set<string>();
  const push = (s: Suggestion) => {
    const key = `${s.text}|${s.category?.slug ?? ""}`;
    if (!seen.has(key) && suggestions.length < 10) {
      seen.add(key);
      suggestions.push(s);
    }
  };

  // "shoes in Men's Shoes" style department-scoped suggestions first.
  for (const [slug, label] of Object.entries(CATEGORY_LABELS)) {
    const l = label.toLowerCase().replace(/'/g, "");
    if (l.split(/\s+/).some((w) => w.startsWith(q)) || l.includes(q)) {
      push({ text: q, category: { slug, label } });
    }
    if (suggestions.length >= 3) break;
  }

  const matches = getAllProducts()
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().startsWith(q) ||
        p.tags.some((t) => t.startsWith(q)),
    )
    .sort((a, b) => b.boughtPastMonth - a.boughtPastMonth);

  for (const p of matches) push({ text: p.title.toLowerCase(), productId: p.id });
  for (const p of matches) {
    const brand = p.brand?.toLowerCase();
    if (brand?.startsWith(q)) push({ text: `${brand} ${categoryLabel(p.category).toLowerCase()}` });
  }

  return NextResponse.json(suggestions);
}
