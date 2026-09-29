import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Labelled input with Amazon's inset style and an inline error message. */
export function Field({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: ComponentProps<"input"> & { label: string; error?: string | null; hint?: string }) {
  const inputId = id ?? props.name;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1 block text-[13px] font-bold text-amz-text">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "h-[31px] w-full rounded-[3px] border px-2 text-[13px] shadow-[0_1px_0_rgba(255,255,255,0.5),inset_0_1px_0_rgba(0,0,0,0.07)] outline-none",
          "focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]",
          error ? "border-amz-deal" : "border-[#a6a6a6] border-t-[#949494]",
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-amz-muted">{hint}</p>}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-amz-deal">
          <b className="mr-1">!</b>
          {error}
        </p>
      )}
    </div>
  );
}
