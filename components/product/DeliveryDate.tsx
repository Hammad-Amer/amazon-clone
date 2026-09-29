"use client";

import { useSyncExternalStore } from "react";
import { addDays, formatLongDate, formatShortDate } from "@/lib/format";

const subscribe = () => () => {};

/**
 * Delivery dates depend on "today", so they're computed on the client only;
 * statically generated pages would otherwise show the build date.
 */
export function DeliveryDate({ days, long = false }: { days: number; long?: boolean }) {
  const label = useSyncExternalStore(
    subscribe,
    () => {
      const d = addDays(new Date(), days);
      return long ? formatLongDate(d) : formatShortDate(d);
    },
    () => null,
  );
  return <b className="font-bold">{label ?? " ".repeat(8)}</b>;
}
