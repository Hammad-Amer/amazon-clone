import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  outline: "bg-surface hover:bg-sky-tint border-rim text-amz-text",
  dark: "bg-amz-nav hover:bg-amz-backtop border-amz-nav text-white dark:bg-[#e4ebf5] dark:hover:bg-white dark:border-transparent dark:text-[#0b2447]",
  brand: "bg-brand hover:bg-brand-hover border-brand text-white font-medium shadow-[0_2px_8px_rgba(47,128,237,0.28)]",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border font-normal shadow-[0_2px_5px_rgba(11,36,71,0.08)] transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export function Button({
  variant = "brand",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "brand",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
