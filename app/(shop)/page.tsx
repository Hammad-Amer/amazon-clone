import { HeroCard, QuadCard, type QuadTile } from "@/components/home/Cards";
import { HeroTiles, type HeroTile } from "@/components/home/HeroTiles";
import { PersonalizedRows } from "@/components/home/PersonalizedRows";
import { ProductRow } from "@/components/home/ProductRow";
import { SignInCard } from "@/components/home/SignInCard";
import { Price } from "@/components/product/Price";
import { categoryLabel } from "@/lib/departments";
import {
  getBestSellers,
  getByCategories,
  getByDepartment,
  getDeals,
  getNewReleases,
  getProduct,
  getUnderPrice,
  toSummary,
} from "@/lib/products";
import type { Product } from "@/lib/types";

const shot = (p: Product) => ({ src: p.images[0] ?? p.thumbnail, alt: p.title });
const img = (id: number) => shot(getProduct(id)!);

const HERO: HeroTile[] = [
  {
    title: "Tech that keeps up with you",
    href: "/s?c=electronics",
    background: "#dce9f5",
    layout: "single",
    images: [img(123)],
  },
  {
    eyebrow: "Up to 30% off",
    title: "Today's top deals",
    href: "/deals",
    background: "#d4213d",
    dark: true,
    layout: "grid",
    images: getDeals(4).map(shot),
  },
  {
    title: "Shop all things beauty",
    href: "/s?c=beauty",
    background: "#f9d9d2",
    layout: "single",
    images: [img(7)],
  },
  {
    title: "Start looking sharp",
    href: "/s?c=fashion",
    background: "#ebe1d6",
    layout: "single",
    images: [img(88)],
  },
  {
    title: "Kitchen must-haves",
    href: "/s?c=kitchen-accessories",
    background: "#d9ece5",
    layout: "grid",
    images: getByCategories(["kitchen-accessories"], 4).map(shot),
  },
  {
    title: "Level up your PC setup",
    href: "/s?c=laptops",
    background: "#ead9f2",
    layout: "single",
    images: [img(78)],
  },
  {
    title: "Make home your happy place",
    href: "/s?c=home",
    background: "#f4ead6",
    layout: "single",
    images: [img(12)],
  },
  {
    eyebrow: "Great prices on essentials",
    title: "Everyday staples under $20",
    href: "/s?max=20&sort=bestselling",
    background: "#f68b1f",
    dark: true,
    layout: "grid",
    images: getUnderPrice(20, ["groceries", "skin-care"], 4).map(shot),
  },
  {
    title: "Game on. Gear up for less",
    href: "/s?c=sports",
    background: "#fdeaa7",
    layout: "single",
    images: [img(140)],
  },
];

/** A 2x2 tile per category, using that category's most popular product image. */
function tiles(categories: string[]): QuadTile[] {
  return categories.map((c) => ({
    label: categoryLabel(c),
    href: `/s?c=${c}`,
    image: getByCategories([c], 1)[0].thumbnail,
  }));
}

export default function HomePage() {
  const topDeal = getDeals(1)[0];
  const summaries = (xs: ReturnType<typeof getDeals>) => xs.map(toSummary);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1500px] pt-3">
        <HeroTiles tiles={HERO} />

        <div className="space-y-5 px-2.5 pb-8 pt-5 md:px-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <QuadCard
              title="Plug in with our electronics"
              tiles={tiles(["smartphones", "laptops", "tablets", "mobile-accessories"])}
              moreHref="/s?c=electronics"
            />
            <QuadCard
              title="Refresh your wardrobe"
              tiles={tiles(["mens-shirts", "womens-dresses", "tops", "mens-shoes"])}
              moreHref="/s?c=fashion"
            />
            <QuadCard
              title="Level up your home"
              tiles={tiles(["furniture", "home-decoration", "kitchen-accessories", "groceries"])}
              moreHref="/s?c=home"
            />
            <SignInCard />
          </div>

          <ProductRow
            framed
            title="Today's Deals"
            href="/deals"
            variant="deal"
            products={summaries(getDeals(16))}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <HeroCard
              title="Deal of the day"
              image={topDeal.images[0] ?? topDeal.thumbnail}
              href={`/dp/${topDeal.id}`}
              caption={
                <div className="space-y-1">
                  <span className="rounded-sm bg-amz-deal px-1.5 py-1 text-xs font-bold text-white">
                    {topDeal.discountPercentage}% off
                  </span>{" "}
                  <span className="text-xs font-bold text-amz-deal">Deal of the Day</span>
                  <div className="flex items-baseline gap-2">
                    <Price amount={topDeal.price} size="sm" />
                    <span className="text-xs text-amz-muted line-through">${topDeal.listPrice}</span>
                  </div>
                  <p className="line-clamp-1 text-sm">{topDeal.title}</p>
                </div>
              }
            />
            <QuadCard
              title="Shop all things beauty"
              tiles={tiles(["beauty", "fragrances", "skin-care", "womens-jewellery"])}
              moreHref="/s?c=beauty"
            />
            <QuadCard
              title="Accessorize your look"
              tiles={tiles(["sunglasses", "womens-watches", "mens-watches", "womens-bags"])}
              moreHref="/s?c=fashion"
            />
            <QuadCard
              title="Under $30 finds"
              tiles={getUnderPrice(30, ["womens-shoes", "tops", "sunglasses", "mens-shirts", "sports-accessories"], 4).map((p) => ({
                label: p.title,
                href: `/dp/${p.id}`,
                image: p.thumbnail,
              }))}
              moreHref="/s?max=30&sort=bestselling"
            />
          </div>

          <PersonalizedRows />

          <ProductRow framed title="Best Sellers in Electronics" href="/s?c=electronics&sort=bestselling" products={summaries(getByDepartment("electronics", 16))} />
          <ProductRow framed title="Best Sellers in Beauty & Personal Care" href="/s?c=beauty&sort=bestselling" products={summaries(getByDepartment("beauty", 16))} />
          <ProductRow framed title="Top picks for your kitchen" href="/s?c=kitchen-accessories" variant="detail" products={summaries(getByCategories(["kitchen-accessories"], 16))} />
          <ProductRow framed title="New arrivals" href="/s?sort=newest" products={summaries(getNewReleases(16))} />
          <ProductRow framed title="Customers' most-loved" href="/s?sort=bestselling" variant="detail" products={summaries(getBestSellers(16))} />
        </div>
      </div>
    </div>
  );
}
