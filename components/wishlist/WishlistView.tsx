"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Price } from "@/components/product/Price";
import { Stars } from "@/components/product/Rating";
import { Button, ButtonLink } from "@/components/ui/Button";
import { formatCount } from "@/lib/format";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/misc";
import { useHydrated } from "@/store/StoreHydrator";

export function WishlistView() {
  const hydrated = useHydrated();
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const add = useCart((s) => s.add);
  const user = useAuth((s) => s.user);

  if (!hydrated) return <div className="mx-auto h-80 max-w-4xl animate-pulse rounded-2xl bg-white" />;

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-[0_2px_12px_rgba(11,36,71,0.07)] p-5">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#e3ecf7] pb-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            <Heart size={22} className="fill-amz-deal text-amz-deal" aria-hidden />
            {user ? `${user.name.split(" ")[0]}'s` : "Your"} Wish List
          </h1>
          <p className="text-sm text-amz-muted">
            {items.length} {items.length === 1 ? "item" : "items"} · Private
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="brand"
            size="sm"
            onClick={() => {
              items.forEach((p) => add(p));
              toast.success(`Added ${items.length} items to your cart`);
            }}
          >
            Add all to cart
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-sky">
            <Heart size={40} strokeWidth={1.4} className="text-brand" />
          </span>
          <p className="mt-3 text-lg font-extrabold tracking-tight">Your Wish List is empty</p>
          <p className="mt-1 text-sm text-amz-muted">Tap &quot;Add to List&quot; on any product to save it here.</p>
          <ButtonLink href="/deals" variant="brand" className="mt-4">
            Discover today&apos;s deals
          </ButtonLink>
        </div>
      ) : (
        <ul>
          {items.map((p) => (
            <li key={p.id} className="flex gap-4 border-b border-[#e3ecf7] py-4 last:border-0">
              <Link href={`/dp/${p.id}`} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-sky sm:h-32 sm:w-32">
                <Image src={p.thumbnail} alt={p.title} fill sizes="128px" className="object-contain p-2 mix-blend-multiply" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:gap-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/dp/${p.id}`} className="line-clamp-2 font-bold hover:text-brand hover:underline">
                    {p.title}
                  </Link>
                  {p.brand && <p className="text-sm text-amz-muted">by {p.brand}</p>}
                  <div className="flex items-center gap-1 text-sm">
                    <Stars rating={p.rating} size={14} />
                    <span className="text-amz-muted">{formatCount(p.ratingCount)}</span>
                  </div>
                  <Price amount={p.price} size="sm" />
                </div>
                <div className="flex shrink-0 flex-row gap-2 sm:w-44 sm:flex-col">
                  <Button
                    size="sm"
                    variant="brand"
                    onClick={() => {
                      add(p);
                      remove(p.id);
                      toast.success("Moved to cart", { description: p.title });
                    }}
                  >
                    Move to Cart
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => remove(p.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
