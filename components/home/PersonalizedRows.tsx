"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/store/auth";
import { useHistory } from "@/store/misc";
import { ordersFor, useOrders } from "@/store/orders";
import type { ProductSummary } from "@/lib/types";
import { ProductRow } from "./ProductRow";

/** Rows driven by this browser's history and orders; renders nothing for a fresh visitor. */
export function PersonalizedRows() {
  const viewed = useHistory((s) => s.viewed);
  const user = useAuth((s) => s.user);
  const allOrders = useOrders((s) => s.orders);
  const [inspired, setInspired] = useState<ProductSummary[]>([]);

  const buyAgain = useMemo(() => {
    const seen = new Set<number>();
    return ordersFor(allOrders, user?.email)
      .flatMap((o) => o.items.map((i) => i.product))
      .filter((p) => !seen.has(p.id) && seen.add(p.id));
  }, [allOrders, user?.email]);

  const historyKey = viewed.slice(0, 5).map((p) => p.id).join(",");
  useEffect(() => {
    if (!historyKey) return;
    fetch(`/api/recommendations?ids=${historyKey}`)
      .then((r) => r.json())
      .then(setInspired)
      .catch(() => {});
  }, [historyKey]);

  return (
    <>
      <ProductRow framed title="Keep shopping for" subtitle="Based on items you viewed" variant="detail" products={viewed} />
      {user && <ProductRow framed title="Buy it again" href="/orders" variant="detail" products={buyAgain} />}
      {historyKey && <ProductRow framed title="Inspired by your browsing history" products={inspired} />}
    </>
  );
}
