"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Desktop: thumbnail rail (hover to switch) + main image with hover zoom.
 * Mobile: swipeable, snap-scrolling strip with dots.
 */
export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  return (
    <div>
      {/* Mobile */}
      <div className="md:hidden">
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((src, i) => (
            <div key={src} className="relative aspect-square w-full shrink-0 snap-center bg-[#f7f8f8]">
              <Image src={src} alt={`${alt}, image ${i + 1}`} fill priority={i === 0} sizes="100vw" className="object-contain p-4 mix-blend-multiply" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-2 flex justify-center gap-1.5">
            {images.map((src, i) => (
              <span key={src} className={cn("h-2 w-2 rounded-full", i === active ? "bg-amz-link" : "bg-[#d5d9d9]")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden gap-3 md:flex">
        <ul className="flex shrink-0 flex-col gap-2.5">
          {images.map((src, i) => (
            <li key={src}>
              <button
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block h-12 w-12 overflow-hidden rounded-lg border bg-[#f7f8f8]",
                  i === active ? "border-amz-link shadow-[0_0_0_2px_rgba(0,113,133,0.4)]" : "border-[#a2a6ac] hover:border-amz-link",
                )}
              >
                <Image src={src} alt="" fill sizes="48px" className="object-contain p-0.5 mix-blend-multiply" />
              </button>
            </li>
          ))}
        </ul>
        <div
          className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden bg-[#f7f8f8]"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom(null)}
        >
          <Image
            src={images[active]}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1280px) 45vw, 560px"
            className="object-contain p-6 mix-blend-multiply transition-transform duration-150"
            style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
        </div>
      </div>
      <p className="mt-2 hidden text-center text-xs text-amz-muted md:block">Roll over image to zoom in</p>
    </div>
  );
}
