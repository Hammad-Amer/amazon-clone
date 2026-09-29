import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { CartSummary, LiveFreeShippingNote } from "@/components/cart/CartSummary";
import { ProductRow } from "@/components/home/ProductRow";
import { ButtonLink } from "@/components/ui/Button";
import { getProduct, getRelated, toSummary } from "@/lib/products";

export const metadata: Metadata = { title: "Added to cart" };

export default async function AddedToCartPage({ searchParams }: PageProps<"/cart/added">) {
  const sp = await searchParams;
  const product = getProduct(Number(sp.id));
  if (!product) redirect("/cart");
  const qty = Math.max(1, Number(sp.qty) || 1);

  return (
    <div className="min-h-[70vh] bg-sky">
      <div className="mx-auto max-w-[1500px] space-y-4 px-3 py-4 md:px-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl bg-surface shadow-[0_2px_12px_rgba(11,36,71,0.07)] p-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sky">
              <Image src={product.thumbnail} alt={product.title} fill sizes="96px" className="object-contain mix-blend-multiply" />
            </div>
            <div>
              <p className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                <CircleCheck size={24} className="fill-amz-green text-white" /> Added to cart
              </p>
              <p className="mt-1 line-clamp-2 text-sm">{product.title}</p>
              {qty > 1 && <p className="text-sm text-amz-muted">Quantity: {qty}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-surface shadow-[0_2px_12px_rgba(11,36,71,0.07)] p-5 sm:flex-row sm:items-center">
            <div className="sm:w-1/2">
              <LiveFreeShippingNote />
            </div>
            <div className="space-y-2 sm:w-1/2 sm:border-l sm:border-line sm:pl-5">
              <CartSummary compact />
              <ButtonLink href="/cart" variant="outline" className="w-full">
                Go to Cart
              </ButtonLink>
            </div>
          </div>
        </div>

        <ProductRow framed title="Based on what you added" variant="detail" products={getRelated(product, 16).map(toSummary)} />
      </div>
    </div>
  );
}
