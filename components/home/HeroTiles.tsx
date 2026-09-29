"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type HeroTile = {
  title: string;
  eyebrow?: string;
  href: string;
  /** Soft pastel or bold brand colour behind the tile. */
  background: string;
  dark?: boolean;
  /** "single": one large product; "grid": four products in white boxes. */
  layout: "single" | "grid";
  images: { src: string; alt: string }[];
};

/** Amazon's current homepage hero: a row of tall, rounded promo tiles that scrolls sideways. */
export function HeroTiles({ tiles }: { tiles: HeroTile[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section aria-label="Featured" className="relative">
      <div
        ref={scroller}
        onScroll={update}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-2.5 pb-1 md:scroll-px-5 md:px-5"
      >
        {tiles.map((t, i) => (
          <Link
            key={t.title}
            href={t.href}
            className="group relative flex aspect-[5/7] w-[72vw] shrink-0 snap-start flex-col overflow-hidden rounded-xl p-4 sm:w-[44vw] md:w-[31%] lg:w-[23.5%] xl:w-[calc((100%-3rem)/5.25)]"
            style={{ background: t.background }}
          >
            <div className={cn("relative z-10", t.dark ? "text-white" : "text-amz-text")}>
              {t.eyebrow && <p className="mb-1 text-sm font-medium md:text-base">{t.eyebrow}</p>}
              <h2 className="text-[26px] font-extrabold leading-[1.05] tracking-tight md:text-[30px]">{t.title}</h2>
            </div>
            {t.layout === "single" ? (
              <div className="relative mt-3 flex-1">
                <Image
                  src={t.images[0].src}
                  alt={t.images[0].alt}
                  fill
                  priority={i < 3}
                  sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 300px"
                  className="object-contain mix-blend-multiply drop-shadow-[0_14px_18px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
                {t.images.slice(0, 4).map((img) => (
                  <div key={img.src} className="relative aspect-square overflow-hidden rounded-lg bg-white">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      priority={i < 3}
                      sizes="(max-width: 640px) 34vw, 140px"
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      <button
        onClick={() => page(-1)}
        aria-label="Previous"
        className={cn(
          "absolute left-0 top-1/2 hidden h-28 w-12 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-amz-border bg-white/95 shadow-md transition-opacity hover:bg-white md:flex",
          edges.start && "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft size={30} strokeWidth={1.6} />
      </button>
      <button
        onClick={() => page(1)}
        aria-label="Next"
        className={cn(
          "absolute right-0 top-1/2 hidden h-28 w-12 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-amz-border bg-white/95 shadow-md transition-opacity hover:bg-white md:flex",
          edges.end && "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight size={30} strokeWidth={1.6} />
      </button>
    </section>
  );
}
