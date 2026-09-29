"use client";

import { CircleCheck, Package, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatLongDate, formatPrice } from "@/lib/format";
import { SHIPPING_OPTIONS, orderProgress, type Order } from "@/lib/orders";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { ordersFor, useOrders } from "@/store/orders";
import { useHydrated } from "@/store/StoreHydrator";

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export function orderStatus(o: Order, now = new Date()) {
  const by = new Date(o.deliveryBy);
  return by <= now
    ? { delivered: true, label: `Delivered ${formatLongDate(by)}` }
    : { delivered: false, label: `Arriving ${formatLongDate(by)}` };
}

function BuyAgain({ product }: { product: Order["items"][number]["product"] }) {
  const add = useCart((s) => s.add);
  return (
    <Button
      size="sm"
      variant="brand"
      onClick={() => {
        add(product);
        toast.success("Added to cart", { description: product.title });
      }}
    >
      Buy it again
    </Button>
  );
}

function SignInPrompt({ next }: { next: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white shadow-[0_2px_12px_rgba(11,36,71,0.07)] p-8 text-center">
      <Package size={48} strokeWidth={1.2} className="mx-auto text-brand" />
      <h1 className="mt-2 text-xl font-extrabold tracking-tight">Sign in to see your orders</h1>
      <p className="mt-1 text-sm text-amz-muted">Track packages, buy things again and view order details.</p>
      <ButtonLink href={`/signin?next=${encodeURIComponent(next)}`} variant="brand" className="mt-4">
        Sign in
      </ButtonLink>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = orderStatus(order);
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(11,36,71,0.07)]">
      <header className="grid grid-cols-2 gap-3 bg-sky-tint px-5 py-3 text-xs text-[#4a6385] sm:flex sm:gap-10">
        <div>
          <p className="font-bold uppercase tracking-wide">Order placed</p>
          <p className="text-sm text-amz-text">{longDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="font-bold uppercase tracking-wide">Total</p>
          <p className="text-sm text-amz-text">{formatPrice(order.total)}</p>
        </div>
        <div>
          <p className="font-bold uppercase tracking-wide">Ship to</p>
          <p className="text-sm text-amz-text">{order.address.fullName}</p>
        </div>
        <div className="col-span-2 sm:ml-auto sm:text-right">
          <p className="font-bold uppercase tracking-wide">Order # {order.id}</p>
          <Link href={`/orders/${order.id}`} className="text-sm font-medium text-brand hover:text-brand-hover hover:underline">
            View order details
          </Link>
        </div>
      </header>
      <div className="px-5 py-4">
        <h2 className={cn("flex items-center gap-2 text-lg font-extrabold tracking-tight", status.delivered ? "text-amz-text" : "text-[#1a7f37]")}>
          {status.delivered ? <CircleCheck size={20} className="fill-[#1a7f37] text-white" /> : <Truck size={20} />}
          {status.label}
        </h2>
        <ul className="mt-3 space-y-4">
          {order.items.map(({ product, qty }) => (
            <li key={product.id} className="flex gap-4">
              <Link href={`/dp/${product.id}`} className="relative h-20 w-20 shrink-0 rounded-xl bg-sky">
                <Image src={product.thumbnail} alt={product.title} fill sizes="80px" className="object-contain mix-blend-multiply" />
                {qty > 1 && (
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-brand px-1.5 text-xs font-bold text-white shadow">{qty}</span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/dp/${product.id}`} className="line-clamp-2 text-sm font-medium hover:text-brand hover:underline">
                  {product.title}
                </Link>
                <p className="text-xs text-amz-muted">{status.delivered ? "Return window closed" : "Return or replace items: Eligible"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <BuyAgain product={product} />
                  <ButtonLink href={`/dp/${product.id}`} variant="outline" size="sm">
                    View your item
                  </ButtonLink>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function OrdersList() {
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const all = useOrders((s) => s.orders);
  const [filter, setFilter] = useState<"all" | "transit" | "delivered">("all");

  if (!hydrated) return <div className="mx-auto h-80 max-w-4xl animate-pulse rounded-2xl bg-white" />;
  if (!user) return <SignInPrompt next="/orders" />;

  const mine = ordersFor(all, user.email);
  const shown = mine.filter((o) => filter === "all" || (filter === "delivered") === orderStatus(o).delivered);

  return (
    <div className="mx-auto max-w-4xl">
      <nav aria-label="Breadcrumb" className="mb-2 text-sm font-medium text-brand">
        <span className="text-amz-muted">Your Account</span> › Your Orders
      </nav>
      <h1 className="text-[28px] font-extrabold tracking-tight">Your Orders</h1>
      <div role="tablist" className="mt-3 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1 text-sm shadow-[0_2px_12px_rgba(11,36,71,0.07)]">
        {(
          [
            ["all", "Orders"],
            ["transit", "Not Yet Delivered"],
            ["delivered", "Delivered"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={cn("shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 transition-colors", filter === k ? "bg-brand font-bold text-white" : "text-amz-text hover:bg-sky-tint hover:text-brand")}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="my-3 text-sm">
        <b>{shown.length} {shown.length === 1 ? "order" : "orders"}</b> {filter === "all" ? "placed" : ""}
      </p>
      {mine.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(11,36,71,0.07)] p-8 text-center">
          <p>You haven&apos;t placed any orders yet.</p>
          <ButtonLink href="/" variant="brand" className="mt-3">
            Start shopping
          </ButtonLink>
        </div>
      ) : (
        <div className="space-y-5">
          {shown.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const order = useOrders((s) => s.orders.find((o) => o.id === id && o.email === user?.email));
  const placed = useSearchParams().get("placed") === "1";
  const [now] = useState(() => new Date());

  if (!hydrated) return <div className="mx-auto h-80 max-w-4xl animate-pulse rounded-2xl bg-white" />;
  if (!user) return <SignInPrompt next={`/orders/${id}`} />;
  if (!order) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white shadow-[0_2px_12px_rgba(11,36,71,0.07)] p-8 text-center">
        <h1 className="text-xl font-extrabold tracking-tight">We couldn&apos;t find that order</h1>
        <ButtonLink href="/orders" variant="brand" className="mt-4">Go to Your Orders</ButtonLink>
      </div>
    );
  }

  const status = orderStatus(order, now);
  const steps = ["Ordered", "Shipped", "Out for delivery", "Delivered"];
  const reached = orderProgress(order, now);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {placed && (
        <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(11,36,71,0.07)] ring-2 ring-[#1a7f37]/40">
          <p className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-[#1a7f37]">
            <CircleCheck size={26} className="fill-[#1a7f37] text-white" /> Order placed, thanks!
          </p>
          <p className="mt-1 text-sm">
            Confirmation will be sent to <b>{user.email}</b>. Estimated delivery: <b>{formatLongDate(new Date(order.deliveryBy))}</b>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ButtonLink href="/orders" variant="outline" size="sm">Review or edit your orders</ButtonLink>
            <ButtonLink href="/" size="sm" variant="brand">Continue shopping</ButtonLink>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight">Order Details</h1>
        <p className="text-sm text-amz-muted">
          Ordered on {longDate(order.createdAt)} <span className="mx-2">|</span> Order# {order.id}
        </p>
      </div>

      <div className="grid gap-5 rounded-2xl bg-white shadow-[0_2px_12px_rgba(11,36,71,0.07)] p-5 text-sm sm:grid-cols-3">
        <div>
          <h2 className="mb-1 font-extrabold text-amz-nav">Shipping Address</h2>
          <p>
            {order.address.fullName}
            <br />
            {order.address.line1}
            {order.address.line2 && <>, {order.address.line2}</>}
            <br />
            {order.address.city}, {order.address.state} {order.address.zip}
            <br />
            {order.address.country}
          </p>
        </div>
        <div>
          <h2 className="mb-1 font-extrabold text-amz-nav">Payment Method</h2>
          <p>{order.payment.method === "card" ? `${order.payment.brand} ending in ${order.payment.last4}` : "Cash on Delivery"}</p>
          <h2 className="mb-1 mt-3 font-extrabold text-amz-nav">Delivery</h2>
          <p>{SHIPPING_OPTIONS[order.shipping].label.replace("FREE ", "")}</p>
        </div>
        <div>
          <h2 className="mb-1 font-extrabold text-amz-nav">Order Summary</h2>
          <dl className="space-y-0.5">
            <div className="flex justify-between"><dt>Item(s) Subtotal:</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping &amp; Handling:</dt><dd>{formatPrice(order.shippingCost)}</dd></div>
            <div className="flex justify-between"><dt>Estimated tax:</dt><dd>{formatPrice(order.tax)}</dd></div>
            <div className="flex justify-between border-t border-[#e3ecf7] pt-1.5 font-extrabold text-amz-nav"><dt>Grand Total:</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(11,36,71,0.07)] p-5">
        <h2 className={cn("text-lg font-extrabold tracking-tight", !status.delivered && "text-[#1a7f37]")}>{status.label}</h2>
        <ol className="my-5 grid grid-cols-4" aria-label="Shipment progress">
          {steps.map((s, i) => (
            <li key={s} className="relative text-center text-xs">
              {i > 0 && <span className={cn("absolute right-1/2 top-2 h-1 w-full", i <= reached ? "bg-brand" : "bg-sky-tint")} />}
              <span className={cn("relative mx-auto block h-5 w-5 rounded-full border-4 border-white", i <= reached ? "bg-brand" : "bg-[#c9d6e6]")} />
              <span className={cn("mt-1 block", i === reached && "font-bold text-brand")}>{s}</span>
            </li>
          ))}
        </ol>
        <ul className="space-y-4">
          {order.items.map(({ product, qty }) => (
            <li key={product.id} className="flex gap-4">
              <Link href={`/dp/${product.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sky">
                <Image src={product.thumbnail} alt={product.title} fill sizes="96px" className="object-contain mix-blend-multiply" />
              </Link>
              <div className="text-sm">
                <Link href={`/dp/${product.id}`} className="font-medium hover:text-brand hover:underline">
                  {product.title}
                </Link>
                <p className="text-xs text-amz-muted">Qty: {qty}</p>
                <p className="font-bold">{formatPrice(product.price)}</p>
                <div className="mt-2">
                  <BuyAgain product={product} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
