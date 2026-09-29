import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type QuadTile = { label: string; href: string; image: string };

/** Soft white homepage card that floats on the sky background. */
export const homeCardCls = "flex flex-col rounded-2xl bg-surface p-4 shadow-[0_2px_12px_rgba(11,36,71,0.07)] md:p-5";

// Blue-family tints behind product shots, so the tiles read as soft boxes.
const TINTS = ["var(--color-tint-1)", "var(--color-tint-2)", "var(--color-tint-3)", "var(--color-tint-4)"];

/** Card heading that links to the full collection, with a round chevron badge. */
export function CardTitle({ title, href }: { title: string; href?: string }) {
  const h = <h2 className="text-[21px] font-extrabold leading-tight tracking-tight">{title}</h2>;
  if (!href) return <div className="mb-3">{h}</div>;
  return (
    <Link href={href} className="group mb-3 flex items-start justify-between gap-2" aria-label={`${title}: see more`}>
      {h}
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-tint text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        <ChevronRight size={18} strokeWidth={2.4} />
      </span>
    </Link>
  );
}

/** "Plug in with our electronics" style card: a 2x2 grid of labelled images. */
export function QuadCard({ title, tiles, moreHref }: { title: string; tiles: QuadTile[]; moreHref: string }) {
  return (
    <section className={homeCardCls}>
      <CardTitle title={title} href={moreHref} />
      <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-3">
        {tiles.map((t, i) => (
          <Link key={t.label} href={t.href} className="group">
            <div className="relative aspect-square overflow-hidden rounded-xl" style={{ background: TINTS[i % TINTS.length] }}>
              <Image
                src={t.image}
                alt=""
                fill
                sizes="(max-width: 768px) 45vw, 160px"
                className="object-contain p-3 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="mt-1.5 truncate text-[13px] text-amz-text">{t.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Single large image card, e.g. "Deal of the day". */
export function HeroCard({ title, image, href, caption }: {
  title: string;
  image: string;
  href: string;
  caption?: React.ReactNode;
}) {
  return (
    <section className={homeCardCls}>
      <CardTitle title={title} href={href} />
      <Link href={href} className="group relative block flex-1 overflow-hidden rounded-xl bg-sky-tint">
        <div className="relative aspect-square md:aspect-auto md:h-full md:min-h-[260px]">
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 90vw, 330px"
            className="object-contain p-5 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      {caption && <div className="mt-2 text-sm">{caption}</div>}
    </section>
  );
}
