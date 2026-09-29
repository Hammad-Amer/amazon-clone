"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type HeroSlide = {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  background: string;
  dark?: boolean;
  images: { src: string; alt: string }[];
};

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  useEffect(() => {
    if (!embla || paused) return;
    const t = setInterval(() => embla.scrollNext(), 6000);
    return () => clearInterval(t);
  }, [embla, paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((s, i) => (
            <div
              key={s.title}
              className="relative min-w-0 flex-[0_0_100%]"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
            >
              <Link
                href={s.href}
                tabIndex={i === selected ? 0 : -1}
                className="relative block h-[230px] overflow-hidden sm:h-[320px] md:h-[600px]"
                style={{ background: s.background }}
              >
                <div className="mx-auto flex h-full max-w-[1500px] items-start gap-4 px-5 pt-6 sm:px-10 md:pt-10">
                  <div className={cn("z-10 max-w-[48%] md:max-w-md", s.dark ? "text-white" : "text-amz-text")}>
                    <h2 className="text-2xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-[52px]">
                      {s.title}
                    </h2>
                    <p className="mt-2 text-sm sm:text-lg md:mt-3 md:text-xl">{s.subtitle}</p>
                    <span className="mt-3 inline-block rounded-full bg-amz-yellow px-4 py-1.5 text-xs font-medium text-amz-text shadow sm:text-sm md:mt-5 md:px-6 md:py-2">
                      {s.cta}
                    </span>
                  </div>
                  <div className="relative h-full flex-1">
                    {s.images.map((img, j) => (
                      <div
                        key={img.src}
                        className={cn(
                          "absolute drop-shadow-[0_18px_22px_rgba(0,0,0,0.35)]",
                          j === 0 && "left-[2%] top-[4%] h-[70%] w-[55%] md:left-[2%] md:top-[6%] md:h-[40%] md:w-[30%]",
                          j === 1 && "right-0 top-[22%] h-[62%] w-[48%] md:left-[34%] md:right-auto md:top-0 md:h-[46%] md:w-[34%]",
                          j === 2 && "hidden md:right-0 md:top-[8%] md:block md:h-[38%] md:w-[28%]",
                        )}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          priority={i === 0}
                          sizes="(max-width: 768px) 30vw, 420px"
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Fade into the page background so the card grid can overlap the hero, like Amazon. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[320px] bg-gradient-to-b from-transparent to-amz-bg md:block" />

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-0 top-0 hidden h-[250px] w-16 items-center justify-center rounded-md text-amz-text/80 hover:text-amz-text focus-visible:ring-2 md:flex"
      >
        <ChevronLeft size={48} strokeWidth={1.4} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-0 top-0 hidden h-[250px] w-16 items-center justify-center rounded-md text-amz-text/80 hover:text-amz-text focus-visible:ring-2 md:flex"
      >
        <ChevronRight size={48} strokeWidth={1.4} />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
        {slides.map((s, i) => (
          <button
            key={s.title}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => embla?.scrollTo(i)}
            className={cn("h-2 w-2 rounded-full border border-amz-text/40", i === selected ? "bg-amz-text/70" : "bg-white/70")}
          />
        ))}
      </div>
    </section>
  );
}
