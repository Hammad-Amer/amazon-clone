import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Labelled input with a soft rounded box, blue focus ring and an inline error message. */
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
          "h-9 w-full rounded-lg border bg-surface px-3 text-sm outline-none transition-shadow",
          "focus:border-brand focus:shadow-[0_0_0_3px_rgba(47,128,237,0.2)]",
          error ? "border-amz-deal" : "border-field",
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
