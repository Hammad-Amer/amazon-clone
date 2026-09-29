import Image from "next/image";
import Link from "next/link";
import { categoryLabel } from "@/lib/departments";
import { getByCategories } from "@/lib/products";

/** "Shop by category": a scrolling row of round product bubbles, one per category. */
export function CategoryBubbles({ categories }: { categories: string[] }) {
  return (
    <section aria-labelledby="shop-by-category" className="px-2.5 md:px-5">
      <h2 id="shop-by-category" className="sr-only">
        Shop by category
      </h2>
      <ul className="no-scrollbar relative flex gap-4 overflow-x-auto pb-1 md:justify-between md:gap-3">
        {categories.map((c) => {
          const product = getByCategories([c], 1)[0];
          if (!product) return null;
          return (
            <li key={c} className="shrink-0">
              <Link href={`/s?c=${c}`} className="group flex w-[84px] flex-col items-center gap-2 md:w-[100px]">
                <span className="relative size-[76px] overflow-hidden rounded-full bg-surface shadow-[0_2px_10px_rgba(11,36,71,0.08)] ring-2 ring-transparent transition group-hover:-translate-y-0.5 group-hover:ring-brand md:size-[92px]">
                  <Image
                    src={product.thumbnail}
                    alt=""
                    fill
                    sizes="92px"
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-110"
                  />
                </span>
                <span className="text-center text-[13px] font-medium leading-tight text-amz-text group-hover:text-brand">
                  {categoryLabel(c)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
