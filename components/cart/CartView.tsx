"use client";

import { Check, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Price } from "@/components/product/Price";
import { Stars } from "@/components/product/Rating";
import { ButtonLink } from "@/components/ui/Button";
import { checkoutItems, itemCount, maxQtyFor, subtotal, type CartItem } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/store/StoreHydrator";
import { CartSummary } from "./CartSummary";

const actionCls = "text-xs font-medium text-brand hover:text-brand-hover hover:underline";
const cardCls = "rounded-2xl bg-white shadow-[0_2px_12px_rgba(11,36,71,0.07)]";

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border",
        checked ? "border-brand bg-brand text-white" : "border-[#a9b8cc] bg-white",
      )}
    >
      {checked && <Check size={13} strokeWidth={3} />}
    </button>
  );
}

function QtyStepper({ item }: { item: CartItem }) {
  const setQty = useCart((s) => s.setQty);
  const max = maxQtyFor(item.product);
  return (
    <div className="flex h-8 items-center rounded-full bg-sky-tint text-brand ring-1 ring-[#bcd6f7]">
      <button
        onClick={() => setQty(item.product.id, item.qty - 1)}
        aria-label={item.qty === 1 ? "Delete" : "Decrease quantity"}
        className="flex h-full w-8 items-center justify-center rounded-l-full hover:bg-brand hover:text-white"
      >
        {item.qty === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
      </button>
      <span className="w-8 text-center text-sm font-bold text-amz-text" aria-live="polite">
        {item.qty}
      </span>
      <button
        onClick={() => setQty(item.product.id, item.qty + 1)}
        disabled={item.qty >= max}
        aria-label="Increase quantity"
        className="flex h-full w-8 items-center justify-center rounded-r-full hover:bg-brand hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

function ItemRow({ item }: { item: CartItem }) {
  const { product: p } = item;
  const remove = useCart((s) => s.remove);
  const setSaved = useCart((s) => s.setSaved);
  const toggleSelected = useCart((s) => s.toggleSelected);

  return (
    <li className="flex gap-3 border-b border-[#e3ecf7] py-4 last:border-0">
      {!item.saved && (
        <div className="pt-12">
          <Checkbox checked={item.selected} onChange={() => toggleSelected(p.id)} label={`Select ${p.title}`} />
        </div>
      )}
      <Link href={`/dp/${p.id}`} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-sky sm:h-40 sm:w-40">
        <Image src={p.thumbnail} alt={p.title} fill sizes="180px" className="object-contain p-2 mix-blend-multiply" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex gap-3">
          <Link href={`/dp/${p.id}`} className="line-clamp-2 flex-1 text-base font-medium leading-snug hover:text-brand sm:text-lg">
            {p.title}
          </Link>
          <Price amount={p.price} size="sm" className="hidden font-bold sm:inline-flex" />
        </div>
        <p className="mt-0.5 text-lg font-bold sm:hidden">{formatPrice(p.price)}</p>
        <p className={cn("text-xs", p.stock > 10 ? "text-[#1a7f37]" : "text-amz-deal")}>
          {p.stock > 10 ? "In Stock" : `Only ${p.stock} left in stock - order soon.`}
        </p>
        {p.fastDelivery && <p className="text-xs">FREE delivery available at checkout</p>}
        {p.discountPercentage > 0 && (
          <span className="mt-1 inline-block rounded-full bg-amz-deal px-2 py-0.5 text-[11px] font-bold text-white">
            {p.discountPercentage}% off
          </span>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          {!item.saved && <QtyStepper item={item} />}
          <span className="h-4 w-px bg-[#d6e4f5]" />
          <button className={actionCls} onClick={() => remove(p.id)}>
            Delete
          </button>
          <span className="h-4 w-px bg-[#d6e4f5]" />
          {item.saved ? (
            <button className={actionCls} onClick={() => setSaved(p.id, false)}>
              Move to cart
            </button>
          ) : (
            <button className={actionCls} onClick={() => setSaved(p.id, true)}>
              Save for later
            </button>
          )}
          <span className="h-4 w-px bg-[#d6e4f5]" />
          <Link className={actionCls} href={`/s?c=${p.category}`}>
            Compare with similar items
          </Link>
        </div>
      </div>
    </li>
  );
}

function AlsoBought({ ids }: { ids: number[] }) {
  const [items, setItems] = useState<ProductSummary[]>([]);
  const key = ids.slice(0, 5).join(",");
  useEffect(() => {
    if (!key) return;
    fetch(`/api/recommendations?ids=${key}`)
      .then((r) => r.json())
      .then((xs: ProductSummary[]) => setItems(xs.slice(0, 4)))
      .catch(() => {});
  }, [key]);
  if (!key || items.length === 0) return null;
  return (
    <div className={cn(cardCls, "p-5")}>
      <h2 className="text-base font-extrabold leading-snug tracking-tight">Customers who bought items in your cart also bought</h2>
      <ul className="mt-3 space-y-4">
        {items.map((p) => (
          <li key={p.id} className="flex gap-3">
            <Link href={`/dp/${p.id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sky">
              <Image src={p.thumbnail} alt="" fill sizes="80px" className="object-contain mix-blend-multiply" />
            </Link>
            <div className="min-w-0 text-sm">
              <Link href={`/dp/${p.id}`} className="line-clamp-2 hover:text-brand hover:underline">
                {p.title}
              </Link>
              <Stars rating={p.rating} size={13} />
              <p className="font-bold">{formatPrice(p.price)}</p>
              <AddSmall product={p} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddSmall({ product }: { product: ProductSummary }) {
  const add = useCart((s) => s.add);
  return (
    <button
      onClick={() => add(product)}
      className="mt-1 rounded-full bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand-hover"
    >
      Add to cart
    </button>
  );
}

export function CartView() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setAllSelected = useCart((s) => s.setAllSelected);
  const user = useAuth((s) => s.user);
  const active = items.filter((i) => !i.saved);
  const saved = items.filter((i) => i.saved);
  const allSelected = active.length > 0 && active.every((i) => i.selected);

  if (!hydrated) {
    return (
      <div className="mx-auto grid max-w-[1500px] gap-5 bg-sky px-3 py-5 md:px-5 lg:grid-cols-[1fr_300px]">
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
        <div className="h-40 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-sky">
      <div className="mx-auto grid max-w-[1500px] gap-5 px-3 py-5 md:px-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          {/* Mobile: subtotal first so checkout is one tap away */}
          {active.length > 0 && (
            <div className={cn(cardCls, "p-5 lg:hidden")}>
              <CartSummary />
            </div>
          )}

          <section className={cn(cardCls, "px-5 pb-2 pt-5")}>
            {active.length === 0 ? (
              <EmptyCart signedIn={!!user} />
            ) : (
              <>
                <h1 className="text-[28px] font-extrabold tracking-tight">Shopping Cart</h1>
                <button className={actionCls + " text-sm"} onClick={() => setAllSelected(!allSelected)}>
                  {allSelected ? "Deselect all items" : "Select all items"}
                </button>
                <p className="hidden border-b border-[#e3ecf7] pb-1 text-right text-sm text-amz-muted sm:block">Price</p>
                <ul>
                  {active.map((i) => (
                    <ItemRow key={i.product.id} item={i} />
                  ))}
                </ul>
                <div className="border-t border-[#e3ecf7] py-3 text-right text-lg">
                  <InlineSubtotal />
                </div>
              </>
            )}
          </section>

          <section className={cn(cardCls, "p-5")}>
            <h2 className="text-2xl font-extrabold tracking-tight">Saved for later ({saved.length} {saved.length === 1 ? "item" : "items"})</h2>
            {saved.length === 0 ? (
              <p className="mt-2 text-sm text-amz-muted">
                Items you save for later will show up here. Use &quot;Save for later&quot; on any item in your cart.
              </p>
            ) : (
              <ul className="mt-2">
                {saved.map((i) => (
                  <ItemRow key={i.product.id} item={i} />
                ))}
              </ul>
            )}
          </section>

          <p className="px-1 text-xs text-amz-muted">
            The price and availability of items at amazon.clone are subject to change. The Cart is a temporary place to store a list of your items and reflects each item&apos;s most recent price.
          </p>
        </div>

        <aside className="space-y-5">
          {active.length > 0 && (
            <div className={cn(cardCls, "hidden p-5 lg:sticky lg:top-4 lg:block")}>
              <CartSummary />
            </div>
          )}
          <AlsoBought ids={items.map((i) => i.product.id)} />
        </aside>
      </div>
    </div>
  );
}

function InlineSubtotal() {
  const selected = checkoutItems(useCart((s) => s.items));
  const count = itemCount(selected);
  const total = subtotal(selected);
  return (
    <>
      Subtotal ({count} {count === 1 ? "item" : "items"}): <b>{formatPrice(total)}</b>
    </>
  );
}

function EmptyCart({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 sm:flex-row sm:items-start">
      <div className="flex h-40 w-56 shrink-0 items-center justify-center rounded-2xl bg-sky">
        <ShoppingCart size={84} strokeWidth={1.2} className="text-brand" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Your amazon.clone Cart is empty</h1>
        <Link href="/deals" className="text-sm font-medium text-brand hover:text-brand-hover hover:underline">
          Shop today&apos;s deals
        </Link>
        {!signedIn && (
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/signin?next=/cart" variant="brand">Sign in to your account</ButtonLink>
            <ButtonLink href="/register" variant="outline">
              Sign up now
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
