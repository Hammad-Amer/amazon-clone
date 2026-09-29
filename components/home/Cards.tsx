import Image from "next/image";
import Link from "next/link";

export type QuadTile = { label: string; href: string; image: string };

const cardCls = "flex flex-col bg-white p-5 pb-4";

/** "Plug in with our electronics" style card: a 2x2 grid of labelled images. */
export function QuadCard({ title, tiles, moreHref, moreLabel = "See more" }: {
  title: string;
  tiles: QuadTile[];
  moreHref: string;
  moreLabel?: string;
}) {
  return (
    <section className={cardCls}>
      <h2 className="mb-3 text-[21px] font-bold leading-tight">{title}</h2>
      <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="group">
            <div className="relative aspect-square overflow-hidden bg-[#f7f8f8]">
              <Image
                src={t.image}
                alt=""
                fill
                sizes="(max-width: 768px) 45vw, 160px"
                className="object-contain p-2 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="mt-1 truncate text-xs text-amz-text">{t.label}</p>
          </Link>
        ))}
      </div>
      <Link href={moreHref} className="mt-4 text-[13px] text-amz-link hover:text-amz-link-hover hover:underline">
        {moreLabel}
      </Link>
    </section>
  );
}

/** Single large image card, e.g. "Deal of the day". */
export function HeroCard({ title, image, href, caption, moreLabel = "Shop now" }: {
  title: string;
  image: string;
  href: string;
  caption?: React.ReactNode;
  moreLabel?: string;
}) {
  return (
    <section className={cardCls}>
      <h2 className="mb-3 text-[21px] font-bold leading-tight">{title}</h2>
      <Link href={href} className="group relative block flex-1 overflow-hidden bg-[#f7f8f8]">
        <div className="relative aspect-square md:aspect-auto md:h-full md:min-h-[290px]">
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 90vw, 330px"
            className="object-contain p-4 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      {caption && <div className="mt-2 text-sm">{caption}</div>}
      <Link href={href} className="mt-3 text-[13px] text-amz-link hover:text-amz-link-hover hover:underline">
        {moreLabel}
      </Link>
    </section>
  );
}
