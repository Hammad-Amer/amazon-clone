"use client";

import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Drawer";
import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";
import { combineRatings, isVerifiedPurchase, newReviewId, seedHelpfulCount, type UserReview } from "@/lib/reviews";
import type { Review } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { useOrders } from "@/store/orders";
import { useReviews } from "@/store/reviews";
import { useHydrated } from "@/store/StoreHydrator";
import { Stars } from "./Rating";
import { ReviewForm, type ReviewValues } from "./ReviewForm";

type Entry = {
  key: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpfulBase: number;
  own?: UserReview;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

function seedBody(r: Review): string {
  if (r.rating >= 4) return `${r.comment} Exactly as described and arrived quickly. Would buy again.`;
  if (r.rating === 3) return `${r.comment} It does the job, but I expected a little more for the price.`;
  return `${r.comment} Didn't live up to the description for me.`;
}

/** Reviews written in this browser for a product. Empty until stores rehydrate, so SSR matches. */
function useProductReviews(productId: number): UserReview[] {
  const hydrated = useHydrated();
  const all = useReviews((s) => s.reviews);
  return hydrated ? all.filter((r) => r.productId === productId) : [];
}

/** The rating line under the product title, kept in step with reviews written here. */
export function LiveRating({ productId, rating, ratingCount }: { productId: number; rating: number; ratingCount: number }) {
  const mine = useProductReviews(productId);
  const stats = combineRatings(rating, ratingCount, mine.map((r) => r.rating));
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
      <span>{stats.rating.toFixed(1)}</span>
      <Stars rating={stats.rating} />
      <a href="#reviews" className="text-brand hover:text-brand-hover hover:underline">
        {formatCount(stats.count)} ratings
      </a>
    </div>
  );
}

export function Reviews({
  productId,
  productTitle,
  rating,
  ratingCount,
  reviews,
}: {
  productId: number;
  productTitle: string;
  rating: number;
  ratingCount: number;
  reviews: Review[];
}) {
  const user = useAuth((s) => s.user);
  const orders = useOrders((s) => s.orders);
  const { upsert, remove, helpful, markHelpful } = useReviews();
  const local = useProductReviews(productId);
  const [open, setOpen] = useState(false);
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const stats = combineRatings(rating, ratingCount, local.map((r) => r.rating));
  const own = user ? local.find((r) => r.email === user.email) : undefined;

  const entries: Entry[] = [
    ...(own ? [own] : []),
    ...local.filter((r) => r !== own).sort((a, b) => b.date.localeCompare(a.date)),
  ].map((r) => ({ key: r.id, name: r.name, rating: r.rating, title: r.title, body: r.body, date: r.date, verified: r.verified, helpfulBase: 0, own: r === own ? r : undefined }));
  reviews.forEach((r, i) =>
    entries.push({ key: `seed-${productId}-${i}`, name: r.reviewerName, rating: r.rating, title: r.comment, body: seedBody(r), date: r.date, verified: true, helpfulBase: seedHelpfulCount(productId, i) }),
  );
  const shown = starFilter ? entries.filter((e) => Math.round(e.rating) === starFilter) : entries;

  const submit = (v: ReviewValues) => {
    if (!user) return;
    const review: UserReview = {
      id: own?.id ?? newReviewId(),
      productId,
      email: user.email,
      name: user.name,
      ...v,
      date: new Date().toISOString(),
      verified: isVerifiedPurchase(orders, user.email, productId),
    };
    upsert(review);
    setOpen(false);
    setStarFilter(null);
    toast.success(own ? "Your review has been updated" : "Thanks! Your review has been posted");
    setTimeout(() => document.getElementById(`review-${review.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const deleteOwn = (r: UserReview) => {
    remove(r.id);
    toast("Review deleted", { action: { label: "Undo", onClick: () => upsert(r) } });
  };

  return (
    <section id="reviews" className="grid scroll-mt-4 gap-8 md:grid-cols-[300px_1fr]">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Customer reviews</h2>
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={stats.rating} size={20} />
          <span className="text-lg">{stats.rating.toFixed(1)} out of 5</span>
        </div>
        <p className="mt-1 text-sm text-amz-muted">{formatCount(stats.count)} global ratings</p>
        <ul className="mt-4 text-sm">
          {stats.distribution.map((pct, i) => {
              const star = 5 - i;
              const active = starFilter === star;
              return (
                <li key={star} className="py-0.5">
                    <button
                      type="button"
                      onClick={() => setStarFilter(active ? null : star)}
                      aria-pressed={active}
                      aria-label={`${pct}% of reviews have ${star} stars. ${active ? "Show all reviews" : `Show ${star} star reviews`}`}
                      className={cn(
                        "group flex w-full items-center rounded-lg py-1 text-left hover:bg-sky",
                        active && "bg-sky-tint ring-1 ring-brand",
                      )}
                    >
                      <span className="w-14 shrink-0 whitespace-nowrap pl-1.5 font-medium text-brand">{star} star</span>
                      <span className="flex-1 px-3">
                        <span className="block h-3 w-full overflow-hidden rounded-full bg-sky-tint">
                          <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                        </span>
                      </span>
                      <span className="w-10 shrink-0 pr-1.5 text-right text-amz-muted">{pct}%</span>
                    </button>
                </li>
              );
            })}
        </ul>
        <hr className="my-6 border-[#e3ecf7]" />
        <h3 className="text-lg font-bold">Review this product</h3>
        <p className="mt-1 text-sm">Share your thoughts with other customers</p>
        {user ? (
          <Button variant="brand" className="mt-3 w-full" onClick={() => setOpen(true)}>
            {own ? "Edit your review" : "Write a customer review"}
          </Button>
        ) : (
          <Link
            href={`/signin?next=${encodeURIComponent(`/dp/${productId}`)}`}
            className="mt-3 block rounded-full bg-brand py-2 text-center text-sm font-medium text-white hover:bg-brand-hover"
          >
            Write a customer review
          </Link>
        )}
      </div>

      <div>
        <h3 className="text-lg font-extrabold tracking-tight">Top reviews from the United States</h3>
        {starFilter && (
          <p className="mt-2 text-sm" role="status">
            Showing {shown.length} review{shown.length === 1 ? "" : "s"} with {starFilter} star{starFilter === 1 ? "" : "s"} ·{" "}
            <button type="button" onClick={() => setStarFilter(null)} className="font-medium text-brand hover:text-brand-hover hover:underline">
              Clear filter
            </button>
          </p>
        )}
        {shown.length === 0 ? (
          <p className="mt-4 text-sm text-amz-muted">No {starFilter} star reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {shown.map((e) => {
              const marked = !!helpful[e.key];
              const count = e.helpfulBase + (marked ? 1 : 0);
              return (
                <li key={e.key} id={e.own ? `review-${e.own.id}` : undefined} className={cn(e.own && "scroll-mt-24 rounded-2xl bg-sky p-4 ring-1 ring-[#bcd6f7]")}>
                  <div className="flex items-center gap-2 text-[13px]">
                    <CircleUserRound size={30} strokeWidth={1.2} className="text-[#7b93b5]" />
                    {e.name}
                    {e.own && <span className="rounded-full bg-amz-nav px-2 py-0.5 text-[11px] font-bold text-white">Your review</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars rating={e.rating} size={16} />
                    <span className="text-sm font-bold">{e.title}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-amz-muted">Reviewed in the United States on {formatDate(e.date)}</p>
                  {e.verified && <p className="text-xs font-bold text-[#1a7f37]">✓ Verified Purchase</p>}
                  <p className="mt-1 whitespace-pre-line text-sm">{e.body}</p>
                  {count > 0 && (
                    <p className="mt-2 text-[13px] text-amz-muted">
                      {count === 1 ? "One person" : `${count} people`} found this helpful
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-[13px]">
                    {e.own ? (
                      <>
                        <button type="button" onClick={() => setOpen(true)} className="font-medium text-brand hover:text-brand-hover hover:underline">
                          Edit
                        </button>
                        <span className="text-amz-border">|</span>
                        <button type="button" onClick={() => deleteOwn(e.own!)} className="font-medium text-brand hover:text-brand-hover hover:underline">
                          Delete
                        </button>
                      </>
                    ) : marked ? (
                      <span className="text-[#1a7f37]">✓ Thank you for your feedback.</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markHelpful(e.key)}
                        className="rounded-full px-5 py-1 ring-1 ring-[#bcd6f7] hover:bg-sky-tint hover:text-brand"
                      >
                        Helpful
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={own ? "Edit your review" : "Create review"} size="lg">
        <p className="mb-4 line-clamp-2 text-sm text-amz-muted">{productTitle}</p>
        <ReviewForm
          key={own?.id ?? "new"}
          initial={own && { rating: own.rating, title: own.title, body: own.body }}
          onSubmit={submit}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </section>
  );
}
