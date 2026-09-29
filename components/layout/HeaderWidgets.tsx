"use client";

import { ChevronDown, MapPin, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { itemCount, activeItems } from "@/lib/cart";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { useLocation } from "@/store/misc";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/cn";

const navBox = "rounded-sm border border-transparent hover:border-white";

export function locationLabel(l: { city: string; zip: string; country: string } | null) {
  if (!l) return null;
  return [l.city, l.zip].filter(Boolean).join(" ") || l.country;
}

export function DeliverTo({ compact = false }: { compact?: boolean }) {
  const location = useLocation((s) => s.location);
  const user = useAuth((s) => s.user);
  const open = useUI((s) => s.setLocationOpen);
  const label = locationLabel(location);

  if (compact) {
    return (
      <button
        onClick={() => open(true)}
        className="flex w-full items-center gap-1.5 bg-amz-backtop px-3 py-2.5 text-left text-[13px] text-white"
      >
        <MapPin size={16} />
        <span className="truncate">
          Deliver to {user ? `${user.name.split(" ")[0]} - ` : ""}
          {label ?? "Pakistan"}
        </span>
        <ChevronDown size={14} className="shrink-0" />
      </button>
    );
  }

  return (
    <button onClick={() => open(true)} className={cn(navBox, "hidden shrink-0 items-end gap-0.5 px-2 py-1.5 text-left lg:flex")}>
      <MapPin size={18} className="mb-0.5 text-white" />
      <span className="leading-tight">
        <span className="block text-xs text-[#ccc]">
          {user ? `Deliver to ${user.name.split(" ")[0]}` : "Deliver to"}
        </span>
        <span className="block max-w-32 truncate text-sm font-bold text-white">{label ?? "Pakistan"}</span>
      </span>
    </button>
  );
}

export function AccountMenu() {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const pathname = usePathname();
  const signInHref = `/signin?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="group relative hidden md:block">
      <Link href={user ? "/orders" : signInHref} className={cn(navBox, "block px-2 py-1.5 leading-tight")}>
        <span className="block text-xs text-white">Hello, {user ? user.name.split(" ")[0] : "sign in"}</span>
        <span className="flex items-center text-sm font-bold text-white">
          Account &amp; Lists <ChevronDown size={12} className="ml-0.5 text-[#a7acb2]" />
        </span>
      </Link>

      {/* Hover / keyboard-focus flyout */}
      <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-opacity delay-100 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="absolute right-10 top-0.5 h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-white" />
        <div className="w-[420px] rounded-sm bg-white p-5 text-amz-text shadow-xl">
          {!user && (
            <div className="mb-4 border-b border-amz-border pb-4 text-center">
              <Link
                href={signInHref}
                className="mx-auto block w-56 rounded-full bg-amz-yellow py-1.5 text-sm hover:bg-amz-yellow-hover"
              >
                Sign in
              </Link>
              <p className="mt-2 text-xs">
                New customer?{" "}
                <Link href="/register" className="text-amz-link hover:text-amz-link-hover hover:underline">
                  Start here.
                </Link>
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-6 text-[13px]">
            <div>
              <h3 className="mb-2 text-base font-bold">Your Lists</h3>
              <ul className="space-y-1.5">
                <li><Link className="hover:text-amz-link-hover hover:underline" href="/wishlist">Wish List</Link></li>
                <li><Link className="hover:text-amz-link-hover hover:underline" href="/deals">Discover deals</Link></li>
              </ul>
            </div>
            <div className="border-l border-amz-border pl-6">
              <h3 className="mb-2 text-base font-bold">Your Account</h3>
              <ul className="space-y-1.5">
                <li><Link className="hover:text-amz-link-hover hover:underline" href="/orders">Orders</Link></li>
                <li><Link className="hover:text-amz-link-hover hover:underline" href="/wishlist">Wish List</Link></li>
                <li><Link className="hover:text-amz-link-hover hover:underline" href="/cart">Cart</Link></li>
                {user && (
                  <li>
                    <button className="hover:text-amz-link-hover hover:underline" onClick={signOut}>
                      Sign Out
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact account link for small screens. */
export function MobileAccountLink() {
  const user = useAuth((s) => s.user);
  const pathname = usePathname();
  return (
    <Link
      href={user ? "/orders" : `/signin?next=${encodeURIComponent(pathname)}`}
      className="flex items-center gap-0.5 px-1 text-sm text-white md:hidden"
    >
      <span className="max-w-24 truncate">{user ? user.name.split(" ")[0] : "Sign in"}</span>
      <span aria-hidden>›</span>
      <User size={26} />
    </Link>
  );
}

export function CartLink() {
  const count = useCart((s) => itemCount(activeItems(s.items)));
  return (
    <Link href="/cart" className={cn(navBox, "flex items-end px-2 py-1")} aria-label={`Cart, ${count} items`}>
      <span className="relative">
        <svg width="40" height="30" viewBox="0 0 40 30" aria-hidden className="text-white">
          <path d="M2 4h5l4.5 16h19L35 8H10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="14" cy="26" r="2.4" fill="currentColor" />
          <circle cx="28" cy="26" r="2.4" fill="currentColor" />
        </svg>
        <span className="absolute left-[15px] top-[-4px] w-5 text-center text-base font-bold text-[#f08804]">
          {count > 99 ? "99+" : count}
        </span>
      </span>
      <span className="hidden text-sm font-bold text-white md:inline">Cart</span>
    </Link>
  );
}

export function SidebarToggle({ className, children }: { className?: string; children: React.ReactNode }) {
  const setOpen = useUI((s) => s.setSidebarOpen);
  return (
    <button onClick={() => setOpen(true)} className={className} aria-label="Open all categories menu">
      {children}
    </button>
  );
}
