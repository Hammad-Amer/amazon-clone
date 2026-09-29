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
    <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-center">
      <Package size={48} strokeWidth={1.2} className="mx-auto text-[#aab7b8]" />
      <h1 className="mt-2 text-xl font-bold">Sign in to see your orders</h1>
      <p className="mt-1 text-sm text-amz-muted">Track packages, buy things again and view order details.</p>
      <ButtonLink href={`/signin?next=${encodeURIComponent(next)}`} className="mt-4">
        Sign in
      </ButtonLink>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = orderStatus(order);
  return (
    <article className="overflow-hidden rounded-lg border border-amz-border bg-white">
      <header className="grid grid-cols-2 gap-3 bg-[#f0f2f2] px-5 py-3 text-xs text-amz-muted sm:flex sm:gap-10">
        <div>
          <p className="uppercase">Order placed</p>
          <p className="text-sm text-amz-text">{longDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="uppercase">Total</p>
          <p className="text-sm text-amz-text">{formatPrice(order.total)}</p>
        </div>
        <div>
          <p className="uppercase">Ship to</p>
          <p className="text-sm text-amz-link">{order.address.fullName}</p>
        </div>
        <div className="col-span-2 sm:ml-auto sm:text-right">
          <p className="uppercase">Order # {order.id}</p>
          <Link href={`/orders/${order.id}`} className="text-sm text-amz-link hover:text-amz-link-hover hover:underline">
            View order details
          </Link>
        </div>
      </header>
      <div className="px-5 py-4">
        <h2 className={cn("flex items-center gap-2 text-lg font-bold", status.delivered ? "text-amz-text" : "text-amz-green")}>
          {status.delivered ? <CircleCheck size={20} className="fill-amz-green text-white" /> : <Truck size={20} />}
          {status.label}
        </h2>
        <ul className="mt-3 space-y-4">
          {order.items.map(({ product, qty }) => (
            <li key={product.id} className="flex gap-4">
              <Link href={`/dp/${product.id}`} className="relative h-20 w-20 shrink-0 bg-[#f7f8f8]">
                <Image src={product.thumbnail} alt={product.title} fill sizes="80px" className="object-contain mix-blend-multiply" />
                {qty > 1 && (
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-1.5 text-xs font-bold shadow">{qty}</span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/dp/${product.id}`} className="line-clamp-2 text-sm text-amz-link hover:text-amz-link-hover hover:underline">
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

  if (!hydrated) return <div className="mx-auto h-80 max-w-4xl animate-pulse rounded-lg bg-white" />;
  if (!user) return <SignInPrompt next="/orders" />;

  const mine = ordersFor(all, user.email);
  const shown = mine.filter((o) => filter === "all" || (filter === "delivered") === orderStatus(o).delivered);

  return (
    <div className="mx-auto max-w-4xl">
      <nav aria-label="Breadcrumb" className="mb-2 text-sm text-[#c45500]">
        <span className="text-amz-link">Your Account</span> › Your Orders
      </nav>
      <h1 className="text-[28px] font-normal">Your Orders</h1>
      <div role="tablist" className="mt-3 flex gap-6 border-b border-amz-border text-sm">
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
            className={cn("-mb-px border-b-2 pb-2", filter === k ? "border-[#e77600] font-bold" : "border-transparent text-amz-link hover:text-amz-link-hover")}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="my-3 text-sm">
        <b>{shown.length} {shown.length === 1 ? "order" : "orders"}</b> {filter === "all" ? "placed" : ""}
      </p>
      {mine.length === 0 ? (
        <div className="rounded-lg border border-amz-border bg-white p-8 text-center">
          <p>You haven&apos;t placed any orders yet.</p>
          <ButtonLink href="/" className="mt-3">
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

  if (!hydrated) return <div className="mx-auto h-80 max-w-4xl animate-pulse rounded-lg bg-white" />;
  if (!user) return <SignInPrompt next={`/orders/${id}`} />;
  if (!order) {
    return (
      <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-center">
        <h1 className="text-xl font-bold">We couldn&apos;t find that order</h1>
        <ButtonLink href="/orders" className="mt-4">Go to Your Orders</ButtonLink>
      </div>
    );
  }

  const status = orderStatus(order, now);
  const steps = ["Ordered", "Shipped", "Out for delivery", "Delivered"];
  const reached = orderProgress(order, now);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {placed && (
        <div className="rounded-lg border-2 border-amz-green bg-white p-5">
          <p className="flex items-center gap-2 text-xl font-bold text-amz-green">
            <CircleCheck size={26} className="fill-amz-green text-white" /> Order placed, thanks!
          </p>
          <p className="mt-1 text-sm">
            Confirmation will be sent to <b>{user.email}</b>. Estimated delivery: <b>{formatLongDate(new Date(order.deliveryBy))}</b>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ButtonLink href="/orders" variant="outline" size="sm">Review or edit your orders</ButtonLink>
            <ButtonLink href="/" size="sm">Continue shopping</ButtonLink>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-[28px] font-normal">Order Details</h1>
        <p className="text-sm text-amz-muted">
          Ordered on {longDate(order.createdAt)} <span className="mx-2">|</span> Order# {order.id}
        </p>
      </div>

      <div className="grid gap-5 rounded-lg border border-amz-border bg-white p-5 text-sm sm:grid-cols-3">
        <div>
          <h2 className="font-bold">Shipping Address</h2>
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
          <h2 className="font-bold">Payment Method</h2>
          <p>{order.payment.method === "card" ? `${order.payment.brand} ending in ${order.payment.last4}` : "Cash on Delivery"}</p>
          <h2 className="mt-3 font-bold">Delivery</h2>
          <p>{SHIPPING_OPTIONS[order.shipping].label.replace("FREE ", "")}</p>
        </div>
        <div>
          <h2 className="font-bold">Order Summary</h2>
          <dl className="space-y-0.5">
            <div className="flex justify-between"><dt>Item(s) Subtotal:</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping &amp; Handling:</dt><dd>{formatPrice(order.shippingCost)}</dd></div>
            <div className="flex justify-between"><dt>Estimated tax:</dt><dd>{formatPrice(order.tax)}</dd></div>
            <div className="flex justify-between pt-1 font-bold"><dt>Grand Total:</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-amz-border bg-white p-5">
        <h2 className={cn("text-lg font-bold", !status.delivered && "text-amz-green")}>{status.label}</h2>
        <ol className="my-5 grid grid-cols-4" aria-label="Shipment progress">
          {steps.map((s, i) => (
            <li key={s} className="relative text-center text-xs">
              {i > 0 && <span className={cn("absolute right-1/2 top-2 h-1 w-full", i <= reached ? "bg-amz-green" : "bg-[#e3e6e6]")} />}
              <span className={cn("relative mx-auto block h-5 w-5 rounded-full border-4 border-white", i <= reached ? "bg-amz-green" : "bg-[#d5d9d9]")} />
              <span className={cn("mt-1 block", i === reached && "font-bold")}>{s}</span>
            </li>
          ))}
        </ol>
        <ul className="space-y-4">
          {order.items.map(({ product, qty }) => (
            <li key={product.id} className="flex gap-4">
              <Link href={`/dp/${product.id}`} className="relative h-24 w-24 shrink-0 bg-[#f7f8f8]">
                <Image src={product.thumbnail} alt={product.title} fill sizes="96px" className="object-contain mix-blend-multiply" />
              </Link>
              <div className="text-sm">
                <Link href={`/dp/${product.id}`} className="text-amz-link hover:text-amz-link-hover hover:underline">
                  {product.title}
                </Link>
                <p className="text-xs text-amz-muted">Qty: {qty}</p>
                <p className="font-bold text-[#b12704]">{formatPrice(product.price)}</p>
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
