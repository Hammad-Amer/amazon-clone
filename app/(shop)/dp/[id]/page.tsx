import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductRow } from "@/components/home/ProductRow";
import { BuyBox, RecordView } from "@/components/product/BuyBox";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ListPrice, Price } from "@/components/product/Price";
import { Stars } from "@/components/product/Rating";
import { Reviews } from "@/components/product/Reviews";
import { categoryLabel, departmentOf } from "@/lib/departments";
import { boughtLabel, formatCount } from "@/lib/format";
import { getAllProducts, getProduct, getRelated, toSummary } from "@/lib/products";
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
    <div className="bg-white">
      <RecordView product={summary} />
      <nav aria-label="Breadcrumb" className="mx-auto max-w-[1500px] px-4 pt-3 text-xs text-amz-muted md:px-6">
        <ol className="flex flex-wrap items-center gap-1">
          {dept && (
            <li>
              <Link href={`/s?c=${dept.slug}`} className="hover:text-amz-link-hover hover:underline">
                {dept.label}
              </Link>{" "}
              ›
            </li>
          )}
          <li>
            <Link href={`/s?c=${product.category}`} className="hover:text-amz-link-hover hover:underline">
              {categoryLabel(product.category)}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_260px]">
        <div className="md:sticky md:top-4 md:self-start">
          <ImageGallery images={product.images.length ? product.images : [product.thumbnail]} alt={product.title} />
        </div>

        <div className="min-w-0">
          {product.brand && (
            <Link href={`/s?brand=${encodeURIComponent(product.brand)}`} className="text-sm text-amz-link hover:text-amz-link-hover hover:underline">
              Visit the {product.brand} Store
            </Link>
          )}
          <h1 className="text-2xl font-normal leading-tight text-amz-text">{product.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span>{product.rating.toFixed(1)}</span>
            <Stars rating={product.rating} />
            <a href="#reviews" className="text-amz-link hover:text-amz-link-hover hover:underline">
              {formatCount(product.ratingCount)} ratings
            </a>
          </div>
          {bought && <p className="mt-1 text-sm text-amz-muted">{bought}</p>}
          {product.badge && (
            <span className="mt-2 inline-block rounded-sm bg-[#e47911] px-2 py-0.5 text-xs text-white">
              {product.badge === "Best Seller" ? "#1 Best Seller in " : "Overall Pick for "}
              {categoryLabel(product.category)}
            </span>
          )}
          <hr className="my-3 border-amz-border" />

          {product.discountPercentage > 0 && (
            <span className="mb-1 inline-block rounded-sm bg-amz-deal px-1.5 py-0.5 text-xs font-bold text-white">
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
                <span className="text-amz-link">FREE Returns</span> · {product.returnPolicy}
              </>
            )}
          </p>

          {/* On small screens the buy box sits right under the price. */}
          <div className="my-4 lg:hidden">
            <BuyBox product={summary} returnPolicy={product.returnPolicy} shippingInformation={product.shippingInformation} />
          </div>

          <hr className="my-4 border-amz-border" />
          <table className="text-sm">
            <tbody>
              {specs.slice(0, 5).map(([k, v]) => (
                <tr key={k}>
                  <th className="w-40 py-1 pr-4 text-left align-top font-bold">{k}</th>
                  <td className="py-1">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="my-4 border-amz-border" />
          <h2 className="text-base font-bold">About this item</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
            {aboutBullets(product).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.tags.map((t) => (
              <Link
                key={t}
                href={`/s?k=${encodeURIComponent(t)}`}
                className="rounded-full border border-amz-border bg-[#f7fafa] px-3 py-1 text-xs hover:bg-[#edfdff]"
              >
                {t}
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

      <div className="mx-auto max-w-[1500px] space-y-8 px-4 pb-10 md:px-6">
        <hr className="border-amz-border" />
        <ProductRow title="Products related to this item" variant="detail" products={related} />
        <hr className="border-amz-border" />
        <section>
          <h2 className="mb-3 text-2xl font-bold">Product information</h2>
          <table className="w-full max-w-2xl border-t border-amz-border text-sm">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k} className="border-b border-amz-border">
                  <th className="w-1/2 bg-[#f3f3f3] px-4 py-2.5 text-left font-normal text-amz-muted md:w-2/5">{k}</th>
                  <td className="px-4 py-2.5">{v}</td>
                </tr>
              ))}
              <tr className="border-b border-amz-border">
                <th className="bg-[#f3f3f3] px-4 py-2.5 text-left font-normal text-amz-muted">Customer Reviews</th>
                <td className="flex items-center gap-2 px-4 py-2.5">
                  <Stars rating={product.rating} size={14} /> {product.rating.toFixed(1)} out of 5 stars
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <hr className="border-amz-border" />
        <Reviews productId={product.id} rating={product.rating} ratingCount={product.ratingCount} reviews={product.reviews} />
      </div>
    </div>
  );
}
