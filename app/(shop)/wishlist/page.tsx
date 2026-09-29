import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = { title: "Your Wish List" };

export default function WishlistPage() {
  return (
    <div className="px-3 py-5 md:px-5">
      <WishlistView />
    </div>
  );
}
