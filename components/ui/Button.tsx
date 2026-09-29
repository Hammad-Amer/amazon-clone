import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  yellow: "bg-amz-yellow hover:bg-amz-yellow-hover border-amz-yellow-hover text-amz-text",
  orange: "bg-amz-orange hover:bg-amz-orange-hover border-amz-orange-hover text-amz-text",
  outline: "bg-white hover:bg-gray-50 border-amz-border text-amz-text",
  dark: "bg-amz-nav hover:bg-amz-backtop border-amz-nav text-white",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border font-normal shadow-[0_2px_5px_rgba(213,217,217,0.5)] transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export function Button({
  variant = "yellow",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "yellow",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
