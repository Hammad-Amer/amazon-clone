import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

function StarRow({ size, filled }: { size: number; filled: boolean }) {
  return (
    <span className="flex shrink-0" style={{ width: size * 5 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
          <path d={STAR} style={{ fill: filled ? "#de7921" : "var(--color-surface)" }} stroke="#de7921" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Five stars with fractional fill (4.3 fills 86% of the row): an outlined row
 * with a filled row clipped on top. No SVG ids, so many instances can share a page.
 */
export function Stars({ rating, size = 16, className }: { rating: number; size?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className={cn("relative inline-flex", className)} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <StarRow size={size} filled={false} />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <StarRow size={size} filled />
      </span>
    </span>
  );
}

export function Rating({
  rating,
  count,
  className,
  showNumber = true,
}: {
  rating: number;
  count?: number;
  className?: string;
  showNumber?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      {showNumber && <span className="text-amz-text">{rating.toFixed(1)}</span>}
      <Stars rating={rating} />
      {count !== undefined && <span className="text-amz-link">({formatCount(count)})</span>}
    </span>
  );
}
