import { HeroCard, QuadCard, type QuadTile } from "@/components/home/Cards";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";
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

function img(id: number) {
  const p = getProduct(id)!;
  return { src: p.images[0] ?? p.thumbnail, alt: p.title };
}

const SLIDES: HeroSlide[] = [
  {
    title: "Tech that keeps up with you",
    subtitle: "Phones, laptops & audio from the brands you love",
    cta: "Shop Electronics",
    href: "/s?c=electronics",
    background: "linear-gradient(115deg, #0b2540 0%, #145a8a 55%, #3aa0d8 100%)",
    dark: true,
    images: [img(123), img(78), img(100)],
  },
  {
    title: "Shop all things beauty",
    subtitle: "Up to 20% off makeup, fragrance & skin care",
    cta: "See beauty deals",
    href: "/s?c=beauty&deals=1",
    background: "linear-gradient(115deg, #fde2de 0%, #f7b9c4 60%, #f19bb0 100%)",
    images: [img(7), img(2), img(8)],
  },
  {
    title: "Start looking sharp",
    subtitle: "New season styles for every occasion",
    cta: "Shop Fashion",
    href: "/s?c=fashion",
    background: "linear-gradient(115deg, #efe6da 0%, #d9c6ae 60%, #c4a988 100%)",
    images: [img(181), img(88), img(172)],
  },
  {
    title: "Make home your happy place",
    subtitle: "Furniture, décor & kitchen must-haves",
    cta: "Shop Home & Kitchen",
    href: "/s?c=home",
    background: "linear-gradient(115deg, #e4eee6 0%, #b9d3c0 60%, #8fb89c 100%)",
    images: [img(12), img(47), img(46)],
  },
  {
    title: "Game on. Gear up for less",
    subtitle: "Balls, gloves, rackets & more for every sport",
    cta: "Shop Sports",
    href: "/s?c=sports",
    background: "linear-gradient(115deg, #fff4d6 0%, #ffd66b 55%, #ffb627 100%)",
    images: [img(140), img(137), img(139)],
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
    <div className="mx-auto max-w-[1500px]">
      <HeroCarousel slides={SLIDES} />

      <div className="relative z-10 space-y-5 px-2.5 pb-6 md:-mt-[300px] md:px-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <QuadCard
            title="Plug in with our electronics"
            tiles={tiles(["smartphones", "laptops", "tablets", "mobile-accessories"])}
            moreHref="/s?c=electronics"
            moreLabel="Discover more in Electronics"
          />
          <QuadCard
            title="Refresh your wardrobe"
            tiles={tiles(["mens-shirts", "womens-dresses", "tops", "mens-shoes"])}
            moreHref="/s?c=fashion"
            moreLabel="See more in Fashion"
          />
          <QuadCard
            title="Level up your home"
            tiles={tiles(["furniture", "home-decoration", "kitchen-accessories", "groceries"])}
            moreHref="/s?c=home"
            moreLabel="Shop Home & Kitchen"
          />
          <SignInCard />
        </div>

        <ProductRow
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
            moreLabel="See all deals"
          />
          <QuadCard
            title="Shop all things beauty"
            tiles={tiles(["beauty", "fragrances", "skin-care", "womens-jewellery"])}
            moreHref="/s?c=beauty"
            moreLabel="See more in Beauty"
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
            moreLabel="Shop all under $30"
          />
        </div>

        <PersonalizedRows />

        <ProductRow title="Best Sellers in Electronics" href="/s?c=electronics&sort=bestselling" products={summaries(getByDepartment("electronics", 16))} />
        <ProductRow title="Best Sellers in Beauty & Personal Care" href="/s?c=beauty&sort=bestselling" products={summaries(getByDepartment("beauty", 16))} />
        <ProductRow title="Top picks for your kitchen" href="/s?c=kitchen-accessories" variant="detail" products={summaries(getByCategories(["kitchen-accessories"], 16))} />
        <ProductRow title="New arrivals" href="/s?sort=newest" products={summaries(getNewReleases(16))} />
        <ProductRow title="Customers' most-loved" href="/s?sort=bestselling" variant="detail" products={summaries(getBestSellers(16))} />
      </div>
    </div>
  );
}
