"use client";

import { Heart, Lock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { locationLabel } from "@/components/layout/HeaderWidgets";
import { maxQtyFor } from "@/lib/cart";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useHistory, useLocation, useWishlist } from "@/store/misc";
import { useHydrated } from "@/store/StoreHydrator";
import { useUI } from "@/store/ui";
import { DeliveryDate } from "./DeliveryDate";
import { Price } from "./Price";

export function BuyBox({
  product,
  returnPolicy,
  shippingInformation,
}: {
  product: ProductSummary;
  returnPolicy: string;
  shippingInformation: string;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const inWishlist = useWishlist((s) => s.items.some((i) => i.id === product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const location = useLocation((s) => s.location);
  const openLocation = useUI((s) => s.setLocationOpen);
  const [qty, setQty] = useState(1);

  const inStock = product.stock > 0;
  const freeDelivery = product.price >= FREE_SHIPPING_THRESHOLD || product.fastDelivery;

  return (
    <div className="rounded-2xl bg-white p-4 text-sm shadow-[0_4px_20px_rgba(11,36,71,0.10)] ring-1 ring-[#d6e4f5]">
      <Price amount={product.price} size="lg" />
      <p className="mt-3">
        {freeDelivery ? <span className="font-bold text-[#1a7f37]">FREE delivery </span> : "$5.99 delivery "}
        <DeliveryDate days={product.fastDelivery ? 2 : 5} long />
        {!freeDelivery && <span className="text-amz-muted"> on orders under ${FREE_SHIPPING_THRESHOLD}</span>}
      </p>
      {product.fastDelivery && (
        <p className="mt-1">
          Or fastest delivery <DeliveryDate days={1} long />. Order within{" "}
          <span className="font-medium text-amz-green">6 hrs 12 mins</span>
        </p>
      )}
      <button
        onClick={() => openLocation(true)}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover hover:underline"
      >
        <MapPin size={14} /> Deliver to {locationLabel(location) ?? "Pakistan"}
      </button>

      <p className={inStock ? (product.stock <= 10 ? "mt-3 text-lg text-amz-deal" : "mt-3 text-lg text-amz-green") : "mt-3 text-lg text-amz-deal"}>
        {!inStock ? "Currently unavailable." : product.stock <= 10 ? `Only ${product.stock} left in stock - order soon.` : "In Stock"}
      </p>

      {inStock && (
        <>
          <label className="mt-3 flex w-fit items-center gap-2 rounded-full bg-sky-tint px-3.5 py-1.5 ring-1 ring-[#bcd6f7]">
            <span>Quantity:</span>
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="bg-transparent font-bold text-brand outline-none"
              aria-label="Quantity"
            >
              {Array.from({ length: maxQtyFor(product) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 space-y-2">
            <Button
              variant="brand"
              className="w-full"
              onClick={() => {
                add(product, qty);
                router.push(`/cart/added?id=${product.id}&qty=${qty}`);
              }}
            >
              Add to cart
            </Button>
            <Button
              variant="dark"
              className="w-full font-medium"
              onClick={() => router.push(`/checkout?buy=${product.id}&qty=${qty}`)}
            >
              Buy Now
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-amz-muted">
            <Lock size={12} /> Secure transaction
          </p>
        </>
      )}

      <dl className="mt-3 grid grid-cols-[88px_1fr] gap-x-2 gap-y-1 text-xs">
        <dt className="text-amz-muted">Ships from</dt>
        <dd>amazon.clone</dd>
        <dt className="text-amz-muted">Sold by</dt>
        <dd>{product.brand ?? "amazon.clone"}</dd>
        <dt className="text-amz-muted">Returns</dt>
        <dd className="text-brand">{returnPolicy}</dd>
        <dt className="text-amz-muted">Shipping</dt>
        <dd>{shippingInformation}</dd>
      </dl>

      <hr className="my-4 border-[#e3ecf7]" />
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          const added = toggleWish(product);
          toast.success(added ? "Added to your Wish List" : "Removed from your Wish List");
        }}
      >
        <Heart size={16} className={inWishlist ? "fill-amz-deal text-amz-deal" : ""} />
        {inWishlist ? "In your Wish List" : "Add to List"}
      </Button>
    </div>
  );
}

/** Records the product in browsing history once persisted state has loaded. */
export function RecordView({ product }: { product: ProductSummary }) {
  const hydrated = useHydrated();
  const record = useHistory((s) => s.record);
  useEffect(() => {
    if (hydrated) record(product);
  }, [hydrated, record, product]);
  return null;
}
