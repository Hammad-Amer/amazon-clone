import { NextResponse } from "next/server";
import { getProductsByIds, getRelated, toSummary } from "@/lib/products";

/** Products related to the given ids (e.g. browsing history), excluding the ids themselves. */
export function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "")
    .split(",")
    .map(Number)
    .filter(Number.isInteger)
    .slice(0, 10);
  const exclude = new Set(ids);
  const seen = new Set<number>();
  const picks = getProductsByIds(ids)
    .flatMap((p) => getRelated(p, 6))
    .filter((p) => !exclude.has(p.id) && !seen.has(p.id) && seen.add(p.id))
    .slice(0, 16)
    .map(toSummary);
  return NextResponse.json(picks);
}
