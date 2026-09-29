"use client";

import { useEffect } from "react";
import { useAuth } from "./auth";
import { useCart } from "./cart";
import { useHistory, useHydration, useLocation, useWishlist } from "./misc";
import { useOrders } from "./orders";
import { useReviews } from "./reviews";

const stores = [useCart, useAuth, useOrders, useHistory, useWishlist, useLocation, useReviews];

/**
 * Stores use `skipHydration` so server HTML and the first client render match;
 * this rehydrates them from localStorage right after mount.
 */
export function StoreHydrator() {
  useEffect(() => {
    Promise.all(stores.map((s) => s.persist.rehydrate())).then(() =>
      useHydration.setState({ hydrated: true }),
    );
  }, []);
  return null;
}

export const useHydrated = () => useHydration((s) => s.hydrated);
