import { describe, expect, it } from "vitest";
import { parseRateRows } from "../src/services/frankfurter";
import { isBasketItem } from "../src/types/basket";

describe("external data validation", () => {
  it("keeps valid Frankfurter rows and rejects malformed rates", () => {
    const rows = parseRateRows([
      { date: "2026-09-22", base: "AZN", quote: "USD", rate: 0.5883 },
      { date: "2026-09-22", base: "AZN", quote: "USD", rate: 0 },
      { date: "2026-09-22", base: "AZN", quote: "XXX", rate: 1 },
      { date: "2026-09-22", base: "AZN", quote: "EUR", rate: "0.51" },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].quote).toBe("USD");
  });

  it("rejects non-array Frankfurter payloads", () => {
    expect(() => parseRateRows({ rates: [] })).toThrow(
      "Frankfurter returned an unexpected response."
    );
  });
});

describe("basket validation", () => {
  const validItem = {
    id: "item-1",
    label: "Running shoes",
    amount: 100,
    currency: "USD",
    shipping: 10,
    serviceFee: 5,
    convertedAmount: 67.5,
    createdAt: 1_758_528_000_000,
  };

  it("accepts a valid saved item", () => {
    expect(isBasketItem(validItem)).toBe(true);
  });

  it("rejects invalid currency and negative amounts", () => {
    expect(isBasketItem({ ...validItem, currency: "XXX" })).toBe(false);
    expect(isBasketItem({ ...validItem, shipping: -1 })).toBe(false);
  });
});
