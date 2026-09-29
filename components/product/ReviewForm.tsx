"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { REVIEW_MIN_LENGTH, REVIEW_TITLE_MAX, validateReview } from "@/lib/reviews";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";
const STAR_LABELS = ["I hate it", "I don't like it", "It's okay", "I like it", "I love it"];

export type ReviewValues = { rating: number; title: string; body: string };

/** Accessible star picker: a radio group with hover preview and arrow-key support. */
function StarPicker({ value, onChange, error }: { value: number; onChange: (n: number) => void; error: string | null }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div>
      <p id="star-label" className="mb-1 text-[13px] font-bold">
        Overall rating
      </p>
      <div className="flex items-center gap-3">
        <div
          role="radiogroup"
          aria-labelledby="star-label"
          aria-describedby={error ? "star-error" : undefined}
          className="flex"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}: ${STAR_LABELS[n - 1]}`}
              tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
              onMouseEnter={() => setHover(n)}
              onClick={() => onChange(n)}
              onKeyDown={(e) => {
                const next = e.key === "ArrowRight" || e.key === "ArrowUp" ? Math.min(5, (value || 0) + 1) : e.key === "ArrowLeft" || e.key === "ArrowDown" ? Math.max(1, value - 1) : 0;
                if (next) {
                  e.preventDefault();
                  onChange(next);
                  (e.currentTarget.parentElement?.children[next - 1] as HTMLElement | undefined)?.focus();
                }
              }}
              className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-brand"
            >
              <svg width={32} height={32} viewBox="0 0 24 24" aria-hidden>
                <path
                  d={STAR}
                  style={{ fill: n <= shown ? "#de7921" : "var(--color-surface)" }}
                  stroke={n <= shown ? "#de7921" : "#8d9096"}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
        <span className="text-sm text-amz-muted" aria-hidden>
          {shown ? STAR_LABELS[shown - 1] : ""}
        </span>
      </div>
      {error && (
        <p id="star-error" className="mt-1 text-xs text-amz-deal">
          <b className="mr-1">!</b>
          {error}
        </p>
      )}
    </div>
  );
}

export function ReviewForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: ReviewValues;
  onSubmit: (v: ReviewValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<ReviewValues>(initial ?? { rating: 0, title: "", body: "" });
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validateReview(values) : { rating: null, title: null, body: null };
  const length = values.body.trim().length;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        const errs = validateReview(values);
        if (errs.rating || errs.title || errs.body) return;
        onSubmit({ rating: values.rating, title: values.title.trim(), body: values.body.trim() });
      }}
    >
      <StarPicker value={values.rating} onChange={(rating) => setValues((v) => ({ ...v, rating }))} error={errors.rating} />
      <Field
        label="Add a headline"
        name="review-title"
        placeholder="What's most important to know?"
        maxLength={REVIEW_TITLE_MAX}
        value={values.title}
        onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
        error={errors.title}
      />
      <div>
        <label htmlFor="review-body" className="mb-1 block text-[13px] font-bold">
          Add a written review
        </label>
        <textarea
          id="review-body"
          rows={5}
          value={values.body}
          onChange={(e) => setValues((v) => ({ ...v, body: e.target.value }))}
          placeholder="What did you like or dislike? What did you use this product for?"
          aria-invalid={!!errors.body}
          aria-describedby="review-body-hint"
          className={cn(
            "w-full rounded-lg border px-2.5 py-2 text-[13px] outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(47,128,237,0.2)]",
            errors.body ? "border-amz-deal" : "border-field",
          )}
        />
        <p id="review-body-hint" className={cn("mt-1 text-xs", errors.body ? "text-amz-deal" : "text-amz-muted")}>
          {errors.body ?? (length < REVIEW_MIN_LENGTH ? `${REVIEW_MIN_LENGTH - length} more characters needed` : `${length} characters`)}
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="brand">{initial ? "Update review" : "Submit"}</Button>
      </div>
    </form>
  );
}
