import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductRow } from "@/components/home/ProductRow";
import { BoughtTogether } from "@/components/product/BoughtTogether";
import { BuyBox, RecordView } from "@/components/product/BuyBox";
import { CompareTable } from "@/components/product/CompareTable";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ListPrice, Price } from "@/components/product/Price";
import { Stars } from "@/components/product/Rating";
import { LiveRating, Reviews } from "@/components/product/Reviews";
import { categoryLabel, departmentOf } from "@/lib/departments";
import { cn } from "@/lib/cn";
import { boughtLabel } from "@/lib/format";
import { getAllProducts, getBoughtTogether, getCompareSet, getProduct, getRelated, toSummary } from "@/lib/products";
import type { Product } from "@/lib/types";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: PageProps<"/dp/[id]">): Promise<Metadata> {
  const p = getProduct(Number((await params).id));
  if (!p) return { title: "Product not found" };
  return {
    title: p.title,
    description: p.description,
    openGraph: { title: p.title, description: p.description, images: [p.thumbnail] },
  };
}

/** White floating card that each product-page section sits in. */
const sectionCls = "rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(11,36,71,0.07)] md:p-6";

function aboutBullets(p: Product): string[] {
  return [
    p.description,
    `QUALITY YOU CAN TRUST: ${p.warrantyInformation} from ${p.brand ?? "the manufacturer"}, so you can buy with confidence.`,
    `FAST, RELIABLE SHIPPING: ${p.shippingInformation}. Orders over $35 ship free.`,
    /no return/i.test(p.returnPolicy) ? "RETURNS: This item is not returnable." : `EASY RETURNS: ${p.returnPolicy}.`,
    `DIMENSIONS: ${p.dimensions.width} x ${p.dimensions.height} x ${p.dimensions.depth} cm; weight ${p.weight} oz.`,
  ];
}

export default async function ProductPage({ params }: PageProps<"/dp/[id]">) {
  const product = getProduct(Number((await params).id));
  if (!product) notFound();

  const summary = toSummary(product);
  const dept = departmentOf(product.category);
  const related = getRelated(product, 16).map(toSummary);
  const together = getBoughtTogether(product, 2).map(toSummary);
  const compare = getCompareSet(product, 3);
  const bought = boughtLabel(product.boughtPastMonth);

  const specs: [string, string][] = [
    ["Brand", product.brand ?? "Generic"],
    ["Category", categoryLabel(product.category)],
    ["Item model number", product.sku],
    ["Item weight", `${product.weight} ounces`],
    ["Product dimensions", `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm`],
    ["Warranty", product.warrantyInformation],
    ["Date first available", new Date(product.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
  ];

  return (
    <div className="bg-sky">
      <RecordView product={summary} />
      <nav aria-label="Breadcrumb" className="mx-auto max-w-[1500px] px-4 pt-3 text-xs md:px-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-amz-muted">
          {dept && (
            <li className="flex items-center gap-1.5">
              <Link href={`/s?c=${dept.slug}`} className="rounded-full px-2 py-0.5 hover:bg-white hover:text-brand">
                {dept.label}
              </Link>
              <ChevronRight size={12} aria-hidden />
            </li>
          )}
          <li>
            <Link href={`/s?c=${product.category}`} className="rounded-full bg-white px-2.5 py-0.5 font-medium text-amz-nav shadow-[0_1px_4px_rgba(11,36,71,0.08)] hover:text-brand">
              {categoryLabel(product.category)}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-[1500px] px-2.5 py-3 md:px-6">
        <div className={cn(sectionCls, "grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_280px]")}>
          <div className="md:sticky md:top-4 md:self-start">
            <ImageGallery images={product.images.length ? product.images : [product.thumbnail]} alt={product.title} />
          </div>

          <div className="min-w-0">
            {product.brand && (
              <Link
                href={`/s?brand=${encodeURIComponent(product.brand)}`}
                className="text-[12px] font-bold uppercase tracking-wide text-brand hover:text-brand-hover hover:underline"
              >
                Visit the {product.brand} Store
              </Link>
            )}
            <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-amz-text md:text-[26px]">{product.title}</h1>
            <LiveRating productId={product.id} rating={product.rating} ratingCount={product.ratingCount} />
            {bought && <p className="mt-1 text-sm text-amz-muted">{bought}</p>}
            {product.badge && (
              <span className="mt-2 inline-block rounded-full bg-[#f59e0b] px-2.5 py-0.5 text-xs font-bold text-white">
                {product.badge === "Best Seller" ? "#1 Best Seller in " : "Overall Pick for "}
                {categoryLabel(product.category)}
              </span>
            )}

            <div className="mt-4 rounded-2xl bg-sky p-4">
              {product.discountPercentage > 0 && (
                <span className="mb-1.5 inline-block rounded-full bg-amz-deal px-2.5 py-0.5 text-xs font-bold text-white">
                  Limited time deal
                </span>
              )}
              <div className="flex items-start gap-2">
                {product.discountPercentage > 0 && (
                  <span className="text-[28px] font-light text-amz-deal">-{product.discountPercentage}%</span>
                )}
                <Price amount={product.price} size="lg" />
              </div>
              {product.listPrice && (
                <p className="mt-1">
                  <ListPrice amount={product.listPrice} label="List Price:" />
                </p>
              )}
              <p className="mt-2 text-sm">
                {/no return/i.test(product.returnPolicy) ? (
                  <span className="text-amz-muted">This item is not returnable</span>
                ) : (
                  <>
                    <span className="font-medium text-brand">FREE Returns</span> · {product.returnPolicy}
                  </>
                )}
              </p>
            </div>

            {/* On small screens the buy box sits right under the price. */}
            <div className="my-4 lg:hidden">
              <BuyBox product={summary} returnPolicy={product.returnPolicy} shippingInformation={product.shippingInformation} />
            </div>

            <dl className="mt-5 grid grid-cols-[minmax(0,10rem)_1fr] gap-x-4 gap-y-2 text-sm">
              {specs.slice(0, 5).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-bold text-amz-nav">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <h2 className="mt-6 text-lg font-extrabold tracking-tight">About this item</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {aboutBullets(product).map((b) => (
                <li key={b} className="flex gap-2.5">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((t) => (
                <Link
                  key={t}
                  href={`/s?k=${encodeURIComponent(t)}`}
                  className="rounded-full bg-sky-tint px-3 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand hover:text-white"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-4">
              <BuyBox product={summary} returnPolicy={product.returnPolicy} shippingInformation={product.shippingInformation} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] space-y-5 px-2.5 pb-10 md:px-6">
        {together.length > 0 && product.stock > 0 && (
          <div className={sectionCls}>
            <BoughtTogether products={[summary, ...together]} />
          </div>
        )}
        <ProductRow framed title="Products related to this item" variant="detail" products={related} />
        {compare.length >= 2 && (
          <div className={sectionCls}>
            <CompareTable product={product} others={compare} />
          </div>
        )}
        <section className={sectionCls}>
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight">Product information</h2>
          <div className="max-w-2xl overflow-hidden rounded-xl ring-1 ring-[#d6e4f5]">
            <table className="w-full text-sm">
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k} className="border-b border-[#e3ecf7]">
                    <th className="w-1/2 bg-sky px-4 py-2.5 text-left font-medium text-amz-nav md:w-2/5">{k}</th>
                    <td className="px-4 py-2.5">{v}</td>
                  </tr>
                ))}
                <tr>
                  <th className="bg-sky px-4 py-2.5 text-left font-medium text-amz-nav">Customer Reviews</th>
                  <td className="flex items-center gap-2 px-4 py-2.5">
                    <Stars rating={product.rating} size={14} /> {product.rating.toFixed(1)} out of 5 stars
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <div className={sectionCls}>
          <Reviews productId={product.id} productTitle={product.title} rating={product.rating} ratingCount={product.ratingCount} reviews={product.reviews} />
        </div>
      </div>
    </div>
  );
}
