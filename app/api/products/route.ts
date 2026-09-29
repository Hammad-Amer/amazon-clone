import { NextResponse } from "next/server";
import { getProductsByIds, toSummary } from "@/lib/products";

/** Product summaries for a comma-separated list of ids, e.g. /api/products?ids=1,2,3 */
export function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "")
    .split(",")
    .map(Number)
    .filter(Number.isInteger)
    .slice(0, 50);
  return NextResponse.json(getProductsByIds(ids).map(toSummary));
}
