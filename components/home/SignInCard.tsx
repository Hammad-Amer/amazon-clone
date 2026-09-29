"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/misc";
import { useOrders, ordersFor } from "@/store/orders";
import { activeItems, itemCount } from "@/lib/cart";

/** Guest: "Sign in for the best experience". Signed in: a quick account summary. */
export function SignInCard() {
  const user = useAuth((s) => s.user);
  const cartCount = useCart((s) => itemCount(activeItems(s.items)));
  const wishCount = useWishlist((s) => s.items.length);
  const orderCount = useOrders((s) => ordersFor(s.orders, user?.email).length);

  if (!user) {
    return (
      <section className="flex flex-col bg-white p-5">
        <h2 className="text-[21px] font-bold leading-tight">Sign in for the best experience</h2>
        <ButtonLink href="/signin" className="mt-4 w-full">
          Sign in securely
        </ButtonLink>
        <p className="mt-3 text-center text-xs">
          New here?{" "}
          <Link href="/register" className="text-amz-link hover:text-amz-link-hover hover:underline">
            Create an account
          </Link>
        </p>
        <div className="mt-5 rounded-md bg-gradient-to-br from-[#232f3e] to-[#37475a] p-4 text-white">
          <p className="text-sm font-bold">Just looking around?</p>
          <p className="mt-1 text-xs text-[#ddd]">
            Use the one-click demo account to see orders, lists and personalized picks.
          </p>
          <Link href="/signin?demo=1" className="mt-3 inline-block text-xs font-bold text-amz-search hover:underline">
            Try the demo account →
          </Link>
        </div>
      </section>
    );
  }

  const stats = [
    { label: "Orders", value: orderCount, href: "/orders" },
    { label: "In cart", value: cartCount, href: "/cart" },
    { label: "Wish List", value: wishCount, href: "/wishlist" },
  ];

  return (
    <section className="flex flex-col bg-white p-5">
      <h2 className="text-[21px] font-bold leading-tight">Hi, {user.name.split(" ")[0]}</h2>
      <p className="mt-1 text-sm text-amz-muted">Welcome back. Here&apos;s your account at a glance.</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-lg border border-amz-border p-3 text-center hover:bg-[#f7fafa]">
            <span className="block text-2xl font-bold">{s.value}</span>
            <span className="text-xs text-amz-muted">{s.label}</span>
          </Link>
        ))}
      </div>
      <div className="mt-auto space-y-2 pt-5">
        <ButtonLink href="/orders" variant="outline" className="w-full">
          Your Orders
        </ButtonLink>
        <ButtonLink href="/deals" className="w-full">
          Today&apos;s Deals
        </ButtonLink>
      </div>
    </section>
  );
}
