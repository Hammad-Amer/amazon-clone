const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(amount: number): string {
  return usd.format(amount);
}

/** Splits 38.5 into { whole: "38", fraction: "50" } for Amazon-style superscript cents. */
export function splitPrice(amount: number): { whole: string; fraction: string } {
  const [whole, fraction] = amount.toFixed(2).split(".");
  return { whole: Number(whole).toLocaleString("en-US"), fraction };
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}

/** "1K+ bought in past month" style label, or null when there's nothing to brag about. */
export function boughtLabel(n: number): string | null {
  if (n <= 0) return null;
  return `${formatCount(n)}+ bought in past month`;
}

export function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

/** "Sun, Oct 4" */
export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** "Sunday, October 4" */
export function formatLongDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export const FREE_SHIPPING_THRESHOLD = 35;
