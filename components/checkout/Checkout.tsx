"use client";

import { Banknote, CreditCard, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { checkoutItems, itemCount, qualifiesForFreeShipping, subtotal } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { addDays, formatLongDate, formatPrice } from "@/lib/format";
import {
  SHIPPING_OPTIONS,
  STANDARD_FEE_UNDER_THRESHOLD,
  newOrderId,
  orderTotals,
  type Address,
  type Order,
  type Payment,
  type ShippingSpeed,
} from "@/lib/orders";
import { TEST_CARD, cardBrand, digitsOnly, expiryValid, formatCardNumber, formatExpiry, luhnValid } from "@/lib/payment";
import type { ProductSummary } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { ordersFor, useOrders } from "@/store/orders";
import { useHydrated } from "@/store/StoreHydrator";

type Line = { product: ProductSummary; qty: number };

const COUNTRIES = ["United States", "Pakistan", "United Kingdom", "Canada", "United Arab Emirates", "Germany", "India", "Australia"];
const EMPTY_ADDRESS: Address = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", zip: "", country: "United States" };

function shippingCost(speed: ShippingSpeed, sub: number) {
  if (speed === "express") return SHIPPING_OPTIONS.express.cost;
  return qualifiesForFreeShipping(sub) ? 0 : STANDARD_FEE_UNDER_THRESHOLD;
}

/** Numbered, collapsible checkout step like Amazon's single-page checkout. */
function Step({
  n,
  title,
  open,
  summary,
  onChange,
  children,
}: {
  n: number;
  title: string;
  open: boolean;
  summary?: React.ReactNode;
  onChange?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl bg-surface shadow-[0_2px_12px_rgba(11,36,71,0.07)] px-5 py-4", open && "ring-2 ring-brand/25")}>
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            open ? "bg-brand text-white" : "bg-sky-tint text-brand",
          )}
        >
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <h2 className={cn("mt-0.5 text-lg font-extrabold tracking-tight", open && "text-brand")}>{title}</h2>
            {!open && summary && onChange && (
              <button onClick={onChange} className="text-sm font-medium text-brand hover:text-brand-hover hover:underline">
                Change
              </button>
            )}
          </div>
          {!open && summary && <div className="mt-1 text-sm">{summary}</div>}
          {open && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}

function AddressForm({ initial, onSave }: { initial: Address; onSave: (a: Address) => void }) {
  const [a, setA] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setA((x) => ({ ...x, [k]: e.target.value }));

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const next: typeof errors = {};
        if (!a.fullName.trim()) next.fullName = "Please enter a name.";
        if (digitsOnly(a.phone).length < 7) next.phone = "Please enter a phone number so we can call if there are any issues with delivery.";
        if (!a.line1.trim()) next.line1 = "Please enter an address.";
        if (!a.city.trim()) next.city = "Please enter a city name.";
        if (!a.zip.trim()) next.zip = "Please enter a ZIP or postal code.";
        setErrors(next);
        if (Object.keys(next).length === 0) onSave(a);
      }}
      className="grid max-w-xl gap-3 sm:grid-cols-2"
    >
      <label className="sm:col-span-2">
        <span className="mb-1 block text-[13px] font-bold">Country/Region</span>
        <select value={a.country} onChange={set("country")} className="h-9 w-full rounded-lg border border-field bg-surface px-2.5 text-sm outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(47,128,237,0.2)]">
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <Field className="sm:col-span-2" label="Full name (First and Last name)" name="fullName" autoComplete="name" value={a.fullName} onChange={set("fullName")} error={errors.fullName} />
      <Field className="sm:col-span-2" label="Phone number" name="phone" type="tel" autoComplete="tel" value={a.phone} onChange={set("phone")} error={errors.phone} />
      <Field className="sm:col-span-2" label="Address" name="line1" autoComplete="address-line1" placeholder="Street address or P.O. Box" value={a.line1} onChange={set("line1")} error={errors.line1} />
      <Field className="sm:col-span-2" label="Apt, suite, unit (optional)" name="line2" autoComplete="address-line2" value={a.line2 ?? ""} onChange={set("line2")} />
      <Field label="City" name="city" autoComplete="address-level2" value={a.city} onChange={set("city")} error={errors.city} />
      <Field label="State / Province" name="state" autoComplete="address-level1" value={a.state} onChange={set("state")} />
      <Field label="ZIP Code" name="zip" autoComplete="postal-code" value={a.zip} onChange={set("zip")} error={errors.zip} />
      <div className="sm:col-span-2">
        <Button type="submit" variant="brand">Use this address</Button>
      </div>
    </form>
  );
}

function AddressStep({ saved, onDone }: { saved: Address[]; onDone: (a: Address) => void }) {
  const [adding, setAdding] = useState(saved.length === 0);
  const [choice, setChoice] = useState(0);
  const user = useAuth((s) => s.user);

  if (adding) {
    return (
      <>
        {saved.length > 0 && (
          <button onClick={() => setAdding(false)} className="mb-3 text-sm font-medium text-brand hover:underline">
            ‹ Back to your addresses
          </button>
        )}
        <AddressForm initial={{ ...EMPTY_ADDRESS, fullName: user?.name ?? "" }} onSave={onDone} />
      </>
    );
  }

  return (
    <div>
      <p className="mb-2 border-b border-line pb-1 text-sm font-bold">Your addresses</p>
      <ul className="space-y-2">
        {saved.map((a, i) => (
          <li key={i}>
            <label className={cn("flex cursor-pointer gap-3 rounded-xl border p-3 text-sm", choice === i ? "border-brand bg-sky" : "border-transparent")}>
              <input type="radio" name="address" checked={choice === i} onChange={() => setChoice(i)} className="mt-1 accent-brand" />
              <span>
                <b>{a.fullName}</b> {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.zip}, {a.country}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button onClick={() => setAdding(true)} className="mt-3 text-sm font-medium text-brand hover:text-brand-hover hover:underline">
        + Add a new address
      </button>
      <div className="mt-4 border-t border-line pt-4">
        <Button variant="brand" onClick={() => onDone(saved[choice])}>
          Use this address
        </Button>
      </div>
    </div>
  );
}

function PaymentStep({ onDone }: { onDone: (p: Payment) => void }) {
  const [method, setMethod] = useState<"card" | "cod">("card");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof card, string>>>({});

  const submit = () => {
    if (method === "cod") return onDone({ method: "cod" });
    const next: typeof errors = {};
    if (!card.name.trim()) next.name = "Enter the name on the card.";
    if (!luhnValid(card.number)) next.number = "Enter a valid card number.";
    if (!expiryValid(card.expiry)) next.expiry = "Enter a valid future date (MM/YY).";
    if (!/^\d{3,4}$/.test(card.cvv)) next.cvv = "3 or 4 digits.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      onDone({ method: "card", brand: cardBrand(card.number), last4: digitsOnly(card.number).slice(-4) });
    }
  };

  const option = (value: "card" | "cod", icon: React.ReactNode, label: string, sub: string) => (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3", method === value ? "border-brand bg-sky" : "border-amz-border")}>
      <input type="radio" name="pay" checked={method === value} onChange={() => setMethod(value)} className="mt-1 accent-brand" />
      <span className="flex-1">
        <span className="flex items-center gap-2 text-sm font-bold">
          {icon} {label}
        </span>
        <span className="text-xs text-amz-muted">{sub}</span>
      </span>
    </label>
  );

  return (
    <div className="max-w-xl space-y-3">
      {option("card", <CreditCard size={18} />, "Credit or debit card", "Visa, Mastercard, American Express, Discover")}
      {method === "card" && (
        <div className="rounded-xl border border-amz-border p-4">
          <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-sky-tint px-3 py-2 text-xs">
            <span>Demo store — please don&apos;t enter a real card.</span>
            <button
              type="button"
              className="shrink-0 font-bold text-brand hover:underline"
              onClick={() => setCard({ name: card.name || "Demo Shopper", ...TEST_CARD })}
            >
              Use test card
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_90px_80px]">
            <Field className="sm:col-span-3" label="Name on card" name="ccname" autoComplete="off" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} error={errors.name} />
            <Field label="Card number" name="ccnumber" inputMode="numeric" autoComplete="off" placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} error={errors.number} />
            <Field label="Expiry" name="ccexp" inputMode="numeric" autoComplete="off" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} error={errors.expiry} />
            <Field label="CVV" name="cccvv" inputMode="numeric" autoComplete="off" placeholder="123" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: digitsOnly(e.target.value).slice(0, 4) })} error={errors.cvv} />
          </div>
        </div>
      )}
      {option("cod", <Banknote size={18} />, "Cash on Delivery", "Pay with cash when your order arrives")}
      <Button variant="brand" onClick={submit}>
        Use this payment method
      </Button>
    </div>
  );
}

export function Checkout() {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const cartItems = useCart((s) => s.items);
  const removeMany = useCart((s) => s.removeMany);
  const allOrders = useOrders((s) => s.orders);
  const place = useOrders((s) => s.place);

  const buyId = Number(params.get("buy")) || null;
  const buyQty = Math.max(1, Number(params.get("qty")) || 1);
  const [buyNowLine, setBuyNowLine] = useState<Line | null>(null);

  const [address, setAddress] = useState<Address | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [speed, setSpeed] = useState<ShippingSpeed>("standard");
  const [placing, setPlacing] = useState(false);

  // Checkout needs an account, like Amazon.
  useEffect(() => {
    if (hydrated && !user && !placing) {
      const here = `/checkout${params.toString() ? `?${params}` : ""}`;
      router.replace(`/signin?next=${encodeURIComponent(here)}`);
    }
  }, [hydrated, user, placing, params, router]);

  useEffect(() => {
    if (!buyId) return;
    fetch(`/api/products?ids=${buyId}`)
      .then((r) => r.json())
      .then((ps: ProductSummary[]) => ps[0] && setBuyNowLine({ product: ps[0], qty: buyQty }))
      .catch(() => {});
  }, [buyId, buyQty]);

  const lines: Line[] = buyId ? (buyNowLine ? [buyNowLine] : []) : checkoutItems(cartItems);
  const sub = subtotal(lines);
  const ship = shippingCost(speed, sub);
  const totals = orderTotals(sub, ship);

  const savedAddresses = useMemo(() => {
    const seen = new Set<string>();
    return ordersFor(allOrders, user?.email)
      .map((o) => o.address)
      .filter((a) => {
        const key = `${a.line1}|${a.zip}`;
        return !seen.has(key) && seen.add(key);
      });
  }, [allOrders, user?.email]);

  if (!hydrated || !user || (buyId && !buyNowLine)) {
    return <div className="mx-auto h-96 max-w-5xl animate-pulse rounded-2xl bg-surface" />;
  }

  if (lines.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-surface shadow-[0_2px_12px_rgba(11,36,71,0.07)] p-8 text-center">
        <h1 className="text-xl font-extrabold tracking-tight">There&apos;s nothing to check out</h1>
        <p className="mt-2 text-sm text-amz-muted">Your cart is empty or no items are selected.</p>
        <ButtonLink href="/cart" variant="brand" className="mt-4">Return to cart</ButtonLink>
      </div>
    );
  }

  const deliveryDate = formatLongDate(addDays(new Date(), SHIPPING_OPTIONS[speed].days));
  const canPlace = !!address && !!payment;

  const placeOrder = () => {
    if (!address || !payment) return;
    setPlacing(true);
    const order: Order = {
      id: newOrderId(),
      email: user.email,
      items: lines.map((l) => ({ product: l.product, qty: l.qty })),
      address,
      payment,
      shipping: speed,
      ...totals,
      createdAt: new Date().toISOString(),
      deliveryBy: addDays(new Date(), SHIPPING_OPTIONS[speed].days).toISOString(),
    };
    place(order);
    if (!buyId) removeMany(lines.map((l) => l.product.id));
    router.replace(`/orders/${order.id}?placed=1`);
  };

  const summary = (
    <div className="rounded-2xl bg-surface shadow-[0_2px_12px_rgba(11,36,71,0.07)] p-5 text-sm">
      <Button variant="brand" size="lg" className="w-full" disabled={!canPlace || placing} onClick={placeOrder}>
        {placing ? "Placing your order…" : "Place your order"}
      </Button>
      <p className="mt-2 text-center text-xs text-amz-muted">
        {canPlace ? "By placing your order, you agree to our demo terms." : "Complete the steps to place your order."}
      </p>
      <hr className="my-3 border-line" />
      <h3 className="mb-2 text-lg font-extrabold tracking-tight">Order Summary</h3>
      <dl className="space-y-1">
        <div className="flex justify-between"><dt>Items ({itemCount(lines)}):</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Shipping &amp; handling:</dt><dd>{ship === 0 ? "FREE" : formatPrice(ship)}</dd></div>
        <div className="flex justify-between"><dt>Estimated tax:</dt><dd>{formatPrice(totals.tax)}</dd></div>
      </dl>
      <hr className="my-3 border-line" />
      <div className="flex justify-between text-lg font-extrabold text-strong">
        <span>Order total:</span>
        <span>{formatPrice(totals.total)}</span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-3">
        <Step
          n={1}
          title="Delivery address"
          open={step === 1}
          onChange={() => setStep(1)}
          summary={
            address && (
              <p>
                {address.fullName}
                <br />
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.zip}
              </p>
            )
          }
        >
          <AddressStep
            saved={savedAddresses}
            onDone={(a) => {
              setAddress(a);
              setStep(payment ? 3 : 2);
            }}
          />
        </Step>
        <Step
          n={2}
          title="Payment method"
          open={step === 2}
          onChange={() => setStep(2)}
          summary={
            payment &&
            (payment.method === "card" ? (
              <p className="flex items-center gap-2">
                <CreditCard size={16} /> {payment.brand} ending in {payment.last4}
              </p>
            ) : (
              <p className="flex items-center gap-2">
                <Banknote size={16} /> Cash on Delivery
              </p>
            ))
          }
        >
          <PaymentStep
            onDone={(p) => {
              setPayment(p);
              setStep(3);
            }}
          />
        </Step>
        <Step n={3} title="Review items and delivery" open={step === 3}>
          <div className="rounded-xl border border-amz-border p-4">
            <p className="font-bold text-amz-green">Arriving {deliveryDate}</p>
            <div className="mt-3 grid gap-4 md:grid-cols-[1fr_240px]">
              <ul className="space-y-3">
                {lines.map((l) => (
                  <li key={l.product.id} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sky">
                      <Image src={l.product.thumbnail} alt="" fill sizes="64px" className="object-contain mix-blend-multiply" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold leading-snug">{l.product.title}</p>
                      <p className="font-bold">{formatPrice(l.product.price)}</p>
                      <p>Qty: {l.qty}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <fieldset>
                <legend className="mb-1 text-sm font-bold">Choose your delivery option:</legend>
                {(Object.keys(SHIPPING_OPTIONS) as ShippingSpeed[]).map((k) => {
                  const cost = shippingCost(k, sub);
                  return (
                    <label key={k} className="flex cursor-pointer items-start gap-2 py-1 text-sm">
                      <input type="radio" name="speed" checked={speed === k} onChange={() => setSpeed(k)} className="mt-1 accent-brand" />
                      <span>
                        <span className="font-bold text-amz-green">{formatLongDate(addDays(new Date(), SHIPPING_OPTIONS[k].days))}</span>
                        <br />
                        {cost === 0 ? "FREE Standard Delivery" : `${formatPrice(cost)} - ${k === "express" ? "Next-Day Delivery" : "Standard Delivery"}`}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-sky p-4">
            <Button variant="brand" disabled={!canPlace || placing} onClick={placeOrder}>
              Place your order
            </Button>
            <div>
              <p className="text-lg font-extrabold text-strong">Order total: {formatPrice(totals.total)}</p>
              <p className="text-xs text-amz-muted">By placing your order, you agree to our demo terms.</p>
            </div>
          </div>
        </Step>
        <p className="px-1 text-xs text-amz-muted">
          Need help? Go <Link href="/cart" className="font-medium text-brand hover:underline">back to your cart</Link>. Orders in this demo are saved in your browser only.
        </p>
      </div>
      <aside className="lg:sticky lg:top-4 lg:self-start">{summary}</aside>
    </div>
  );
}

export function CheckoutHeader() {
  const count = useCart((s) => s.items.filter((i) => !i.saved).reduce((n, i) => n + i.qty, 0));
  return (
    <div className="flex items-center justify-between gap-4 bg-amz-header px-4 py-2.5">
      <span className="flex items-center gap-2 text-lg text-white md:text-2xl">
        <Lock size={18} className="text-amz-search" /> Secure checkout
      </span>
      <Link href="/cart" className="text-sm text-white hover:underline">
        Cart ({count})
      </Link>
    </div>
  );
}
