import { Globe } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "Get to Know Us",
    links: [
      { label: "About this project", href: "https://github.com/Hammad-Amer/amazon-clone" },
      { label: "Today's Deals", href: "/deals" },
      { label: "Best Sellers", href: "/s?sort=bestselling" },
      { label: "New Releases", href: "/s?sort=newest" },
    ],
  },
  {
    title: "Shop by Department",
    links: [
      { label: "Electronics", href: "/s?c=electronics" },
      { label: "Clothing, Shoes & Jewelry", href: "/s?c=fashion" },
      { label: "Home & Kitchen", href: "/s?c=home" },
      { label: "Beauty & Personal Care", href: "/s?c=beauty" },
    ],
  },
  {
    title: "More to Explore",
    links: [
      { label: "Grocery & Gourmet Food", href: "/s?c=grocery" },
      { label: "Sports & Outdoors", href: "/s?c=sports" },
      { label: "Deals on Smartphones", href: "/s?c=smartphones&deals=1" },
      { label: "Top rated products", href: "/s?rating=4.5&sort=rating" },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { label: "Your Account", href: "/orders" },
      { label: "Your Orders", href: "/orders" },
      { label: "Your Lists", href: "/wishlist" },
      { label: "Your Cart", href: "/cart" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto">
      <a href="#top" className="block bg-amz-backtop py-4 text-center text-[13px] text-white hover:bg-[#485769]">
        Back to top
      </a>
      <div className="bg-amz-footer px-6 py-10 text-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-2 font-bold">{col.title}</h3>
              <ul className="space-y-2 text-sm text-[#ddd]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-6 border-t border-[#3a4553] pt-8">
          <Logo />
          <span className="flex items-center gap-2 rounded-sm border border-[#848688] px-3 py-1.5 text-sm text-[#ccc]">
            <Globe size={14} /> English
          </span>
          <span className="flex items-center gap-2 rounded-sm border border-[#848688] px-3 py-1.5 text-sm text-[#ccc]">
            <span aria-hidden className="inline-block h-3 w-4 rounded-[1px] bg-[repeating-linear-gradient(#b22234_0_1.5px,#fff_1.5px_3px)] shadow-[inset_7px_6px_0_0_#3c3b6e]" /> United States
          </span>
        </div>
      </div>
      <div className="bg-amz-footer-dark px-6 py-6 text-center text-xs text-[#ddd]">
        <p>
          A portfolio demo built with Next.js &amp; Tailwind. Not affiliated with Amazon.com, Inc. Product data from{" "}
          <a href="https://dummyjson.com" className="underline">
            DummyJSON
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
