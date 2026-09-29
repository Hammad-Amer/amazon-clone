import { describe, expect, it } from "vitest";
import { cardBrand, expiryValid, formatCardNumber, formatExpiry, luhnValid } from "./payment";
import { orderProgress, orderTotals } from "./orders";

describe("payment helpers", () => {
  it("validates card numbers with the Luhn check", () => {
    expect(luhnValid("4242 4242 4242 4242")).toBe(true);
    expect(luhnValid("4242 4242 4242 4241")).toBe(false);
    expect(luhnValid("1234")).toBe(false);
  });

  it("detects the card brand", () => {
    expect(cardBrand("4242")).toBe("Visa");
    expect(cardBrand("5555 5555")).toBe("Mastercard");
    expect(cardBrand("3782")).toBe("American Express");
  });

  it("validates expiry against the current month", () => {
    const now = new Date(2026, 8, 30); // Sep 30, 2026
    expect(expiryValid("09/26", now)).toBe(true);
    expect(expiryValid("08/26", now)).toBe(false);
    expect(expiryValid("13/27", now)).toBe(false);
    expect(expiryValid("1227", now)).toBe(false);
  });

  it("formats card number and expiry while typing", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatExpiry("1230")).toBe("12/30");
    expect(formatExpiry("1")).toBe("1");
  });
});

describe("orderTotals", () => {
  it("adds shipping and 8% tax, rounded to cents", () => {
    expect(orderTotals(100, 9.99)).toEqual({ subtotal: 100, shippingCost: 9.99, tax: 8, total: 117.99 });
    expect(orderTotals(19.99, 0)).toEqual({ subtotal: 19.99, shippingCost: 0, tax: 1.6, total: 21.59 });
  });
});

describe("orderProgress", () => {
  const order = { createdAt: "2026-09-01T00:00:00.000Z", deliveryBy: "2026-09-11T00:00:00.000Z" };
  it("moves through the shipment steps over time", () => {
    expect(orderProgress(order, new Date("2026-09-01T12:00:00.000Z"))).toBe(0);
    expect(orderProgress(order, new Date("2026-09-04T00:00:00.000Z"))).toBe(1);
    expect(orderProgress(order, new Date("2026-09-09T00:00:00.000Z"))).toBe(2);
    expect(orderProgress(order, new Date("2026-09-11T00:00:00.000Z"))).toBe(3);
  });
});
