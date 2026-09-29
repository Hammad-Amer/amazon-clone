import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

/** Five stars with fractional fill, e.g. 4.3 fills the fifth star 30%. */
export function Stars({ rating, size = 16, className }: { rating: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex", className)} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        const id = `s${i}-${Math.round(fill * 100)}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id={id}>
                <stop offset={`${fill * 100}%`} stopColor="#de7921" />
                <stop offset={`${fill * 100}%`} stopColor="#fff" />
              </linearGradient>
            </defs>
            <path d={STAR} fill={`url(#${id})`} stroke="#de7921" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        );
      })}
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
