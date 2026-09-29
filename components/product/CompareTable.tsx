import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { FREE_SHIPPING_THRESHOLD, formatCount } from "@/lib/format";
import { toSummary } from "@/lib/products";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";
import { Price } from "./Price";
import { Stars } from "./Rating";

type Row = { label: string; cell: (p: Product) => React.ReactNode };

const ROWS: Row[] = [
  {
    label: "Customer Rating",
    cell: (p) => (
      <span className="flex flex-wrap items-center gap-1">
        <Stars rating={p.rating} size={14} />
        <span className="text-amz-muted">({formatCount(p.ratingCount)})</span>
      </span>
    ),
  },
  {
    label: "Price",
    cell: (p) => (
      <span className="flex flex-wrap items-center gap-1.5">
        <Price amount={p.price} size="sm" />
        {p.discountPercentage > 0 && <span className="text-xs text-amz-deal">-{p.discountPercentage}%</span>}
      </span>
    ),
  },
  {
    label: "Shipping",
    cell: (p) =>
      p.fastDelivery ? (
        <span>FREE fast delivery</span>
      ) : (
        <span>FREE shipping on orders over ${FREE_SHIPPING_THRESHOLD}</span>
      ),
  },
  { label: "Sold By", cell: (p) => p.brand ?? "Generic" },
  {
    label: "Availability",
    cell: (p) =>
      p.stock <= 0 ? (
        <span className="text-amz-deal">Currently unavailable</span>
      ) : p.stock < 10 ? (
        <span className="text-amz-deal">Only {p.stock} left in stock</span>
      ) : (
        <span className="text-[#1a7f37]">In Stock</span>
      ),
  },
  { label: "Item Weight", cell: (p) => `${p.weight} ounces` },
  { label: "Warranty", cell: (p) => p.warrantyInformation },
];

/** "Compare with similar items": this product next to its closest alternatives. */
export function CompareTable({ product, others }: { product: Product; others: Product[] }) {
  const cols = [product, ...others];
  const th = "sticky left-0 z-10 w-32 bg-white py-2.5 pr-3 text-left align-top text-sm font-bold md:w-44";

  return (
    <section aria-labelledby="compare-heading">
      <h2 id="compare-heading" className="mb-4 text-2xl font-extrabold tracking-tight">
        Compare with similar items
      </h2>
      {/* The table scrolls sideways on its own on small screens; `relative` keeps sr-only text inside it. */}
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
          <thead>
            <tr>
              <th className={th} scope="row">
                <span className="sr-only">Product</span>
              </th>
              {cols.map((p, i) => (
                <th key={p.id} scope="col" className={cn("px-3 pb-3 text-left align-top font-normal", i === 0 && "rounded-t-2xl bg-sky")}>
                  <span className={cn("mb-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold", i === 0 ? "bg-brand text-white" : "invisible")}>This item</span>
                  <Link href={`/dp/${p.id}`} className="group block">
                    <span className="relative mx-auto block aspect-square w-full max-w-36 overflow-hidden rounded-xl bg-sky-tint/60">
                      <Image src={p.thumbnail} alt="" fill sizes="144px" className="object-contain p-2 mix-blend-multiply" />
                    </span>
                    <span className="mt-2 line-clamp-2 font-medium text-amz-text group-hover:text-brand">
                      {p.title}
                    </span>
                  </Link>
                  <AddToCartButton product={toSummary(p)} size="sm" variant="brand" className="mt-2" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-[#e3ecf7]">
                <th scope="row" className={th}>
                  {row.label}
                </th>
                {cols.map((p, i) => (
                  <td key={p.id} className={cn("px-3 py-2.5 align-top", i === 0 && "bg-sky")}>
                    {row.cell(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
