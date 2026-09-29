export const TEST_CARD = { number: "4242 4242 4242 4242", expiry: "12/30", cvv: "123" };

export const digitsOnly = (s: string) => s.replace(/\D/g, "");

/** Groups digits in fours as the user types: "4242424242" -> "4242 4242 42". */
export function formatCardNumber(input: string): string {
  return digitsOnly(input).slice(0, 19).replace(/(.{4})(?=.)/g, "$1 ");
}

export function luhnValid(number: string): boolean {
  const d = digitsOnly(number);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function cardBrand(number: string): string {
  const d = digitsOnly(number);
  if (/^4/.test(d)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "American Express";
  if (/^6/.test(d)) return "Discover";
  return "Card";
}

/** Accepts "MM/YY"; valid through the end of that month. */
export function expiryValid(expiry: string, now = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  return new Date(year, month, 1) > now;
}

export function formatExpiry(input: string): string {
  const d = digitsOnly(input).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
