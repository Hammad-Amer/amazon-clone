import Link from "next/link";
import { cn } from "@/lib/cn";

/** Our own wordmark: "amazon.clone" with a hand-drawn smile arrow. */
export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="amazon.clone home"
      className={cn(
        "flex shrink-0 flex-col items-start rounded-sm border border-transparent px-1.5 pb-1 pt-1.5",
        dark ? "hover:border-strong" : "hover:border-white",
        className,
      )}
    >
      <span
        className={cn(
          "text-[22px] font-extrabold leading-none tracking-[-0.04em]",
          dark ? "text-strong" : "text-white",
        )}
      >
        amazon<span className={cn("text-[15px] font-bold tracking-normal", dark ? "text-brand" : "text-amz-search")}>.clone</span>
      </span>
      <svg width="74" height="10" viewBox="0 0 74 10" aria-hidden className="-mt-0.5">
        <path d="M3 2.5 Q 34 11 64 3" fill="none" stroke={dark ? "#2f80ed" : "#7cc4ff"} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M58.5 1.2 L65 2.6 L61.8 8" fill="none" stroke={dark ? "#2f80ed" : "#7cc4ff"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
