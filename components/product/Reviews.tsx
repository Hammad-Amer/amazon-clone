import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { formatCount } from "@/lib/format";
import type { Review } from "@/lib/types";
import { Stars } from "./Rating";

/**
 * A plausible 5→1 star distribution centred on the average rating.
 * (DummyJSON gives an average and only three written reviews.)
 */
export function ratingDistribution(rating: number): number[] {
  const weights = [5, 4, 3, 2, 1].map((star) => Math.exp(-((star - rating) ** 2) / 1.1) + (star === 5 ? 0.15 : 0));
  const sum = weights.reduce((a, b) => a + b, 0);
  const pct = weights.map((w) => Math.round((w / sum) * 100));
  pct[0] += 100 - pct.reduce((a, b) => a + b, 0); // make it add up to exactly 100
  return pct;
}

export function Reviews({
  productId,
  rating,
  ratingCount,
  reviews,
}: {
  productId: number;
  rating: number;
  ratingCount: number;
  reviews: Review[];
}) {
  const dist = ratingDistribution(rating);
  return (
    <section id="reviews" className="grid gap-8 md:grid-cols-[300px_1fr]">
      <div>
        <h2 className="text-2xl font-bold">Customer reviews</h2>
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={rating} size={20} />
          <span className="text-lg">{rating.toFixed(1)} out of 5</span>
        </div>
        <p className="mt-1 text-sm text-amz-muted">{formatCount(ratingCount)} global ratings</p>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {dist.map((pct, i) => (
              <tr key={i}>
                <td className="w-14 whitespace-nowrap py-1.5 text-amz-link">{5 - i} star</td>
                <td className="px-3">
                  <div
                    className="h-5 w-full overflow-hidden rounded border border-[#d5d9d9] bg-[#f0f2f2] shadow-inner"
                    role="img"
                    aria-label={`${pct}% of reviews have ${5 - i} stars`}
                  >
                    <div className="h-full bg-[#de7921]" style={{ width: `${pct}%` }} />
                  </div>
                </td>
                <td className="w-10 text-right text-amz-link">{pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="my-6 border-amz-border" />
        <h3 className="text-lg font-bold">Review this product</h3>
        <p className="mt-1 text-sm">Share your thoughts with other customers</p>
        <Link
          href={`/dp/${productId}#reviews`}
          className="mt-3 block rounded-full border border-amz-border py-1.5 text-center text-sm shadow-sm hover:bg-gray-50"
        >
          Write a customer review
        </Link>
      </div>

      <div>
        <h3 className="text-lg font-bold">Top reviews from the United States</h3>
        <ul className="mt-4 space-y-6">
          {reviews.map((r, i) => (
            <li key={i}>
              <div className="flex items-center gap-2 text-[13px]">
                <CircleUserRound size={30} strokeWidth={1.2} className="text-[#8d9096]" />
                {r.reviewerName}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Stars rating={r.rating} size={16} />
                <span className="text-sm font-bold">{r.comment}</span>
              </div>
              <p className="mt-1 text-[13px] text-amz-muted">
                Reviewed in the United States on{" "}
                {new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="text-xs font-bold text-[#c45500]">Verified Purchase</p>
              <p className="mt-1 text-sm">
                {r.rating >= 4
                  ? `${r.comment} Exactly as described and arrived quickly. Would buy again.`
                  : r.rating === 3
                    ? `${r.comment} It does the job, but I expected a little more for the price.`
                    : `${r.comment} Didn't live up to the description for me.`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
