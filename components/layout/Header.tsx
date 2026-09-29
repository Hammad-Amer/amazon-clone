import { Globe, Menu } from "lucide-react";
import Link from "next/link";
import { AccountMenu, CartLink, DeliverTo, MobileAccountLink, SidebarToggle } from "./HeaderWidgets";
import { ThemeToggle } from "./Theme";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";

const NAV_LINKS = [
  { href: "/deals", label: "Today's Deals" },
  { href: "/s?sort=bestselling", label: "Best Sellers" },
  { href: "/s?sort=newest", label: "New Releases" },
  { href: "/s?c=electronics", label: "Electronics" },
  { href: "/s?c=fashion", label: "Fashion" },
  { href: "/s?c=home", label: "Home & Kitchen" },
  { href: "/s?c=beauty", label: "Beauty" },
  { href: "/s?c=grocery", label: "Grocery" },
  { href: "/s?c=sports", label: "Sports" },
  { href: "/wishlist", label: "Your Lists" },
  { href: "/orders", label: "Your Orders" },
];

export function Header() {
  return (
    <header id="top" className="sticky top-0 z-40 md:static">
      <div className="bg-amz-header">
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 px-2 py-1.5 md:flex-nowrap md:gap-x-2 md:px-3">
          <SidebarToggle className="p-1 text-white md:hidden">
            <Menu size={26} />
          </SidebarToggle>
          <Logo />
          <DeliverTo />
          <div className="order-last w-full md:order-none md:w-auto md:flex-1">
            <SearchBar />
          </div>
          <div className="ml-auto flex items-center md:ml-0">
            <span className="hidden items-center gap-1 rounded-sm border border-transparent px-2 py-3 text-sm font-bold text-white hover:border-white xl:flex">
              <Globe size={16} aria-hidden /> EN
            </span>
            <ThemeToggle />
            <MobileAccountLink />
            <AccountMenu />
            <Link
              href="/orders"
              className="hidden rounded-sm border border-transparent px-2 py-1.5 leading-tight hover:border-white md:block"
            >
              <span className="block text-xs text-white">Returns</span>
              <span className="block text-sm font-bold text-white">&amp; Orders</span>
            </Link>
            <CartLink />
          </div>
        </div>
      </div>

      <nav aria-label="Shop" className="bg-amz-nav">
        <div className="no-scrollbar flex items-center overflow-x-auto whitespace-nowrap px-2 text-sm text-white md:px-3">
          <SidebarToggle className="hidden items-center gap-1 rounded-sm border border-transparent px-2 py-2 font-bold hover:border-white md:flex">
            <Menu size={20} /> All
          </SidebarToggle>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-sm border border-transparent px-2 py-2 hover:border-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="md:hidden">
        <DeliverTo compact />
      </div>
    </header>
  );
}
