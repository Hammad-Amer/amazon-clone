import { cn } from "@/lib/cn";
import { formatPrice, splitPrice } from "@/lib/format";

const sizes = {
  sm: { whole: "text-lg", small: "text-[11px] top-[-0.45em]" },
  md: { whole: "text-[28px]", small: "text-[13px] top-[-0.75em]" },
  lg: { whole: "text-[28px] md:text-[32px]", small: "text-sm top-[-0.9em]" },
};

/** Amazon-style price: small superscript "$" and cents around a large whole-dollar amount. */
export function Price({
  amount,
  size = "md",
  className,
}: {
  amount: number;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const { whole, fraction } = splitPrice(amount);
  const s = sizes[size];
  return (
    <span className={cn("inline-flex items-start leading-none text-amz-text", className)}>
      <span className="sr-only">{formatPrice(amount)}</span>
      <span aria-hidden className={cn("relative", s.small)}>$</span>
      <span aria-hidden className={cn("font-medium", s.whole)}>{whole}</span>
      <span aria-hidden className={cn("relative", s.small)}>{fraction}</span>
    </span>
  );
}

export function ListPrice({ amount, label = "List:" }: { amount: number; label?: string }) {
  return (
    <span className="text-xs text-amz-muted">
      {label} <span className="line-through">{formatPrice(amount)}</span>
    </span>
  );
}
