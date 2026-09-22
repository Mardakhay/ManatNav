import { describe, expect, it } from "vitest";
import { buildBasketCsv } from "../src/services/basketExport";

describe("basket CSV export", () => {
  it("exports totals and escapes labels safely", () => {
    const csv = buildBasketCsv([{
      id: "item-1",
      label: "Shoes, \"new\"",
      amount: 100,
      currency: "USD",
      shipping: 10,
      serviceFee: 5,
      convertedAmount: 67.5,
      createdAt: Date.parse("2026-09-22T10:00:00.000Z"),
    }]);

    expect(csv).toContain("\"Shoes, \"\"new\"\"\"");
    expect(csv).toContain("100,USD,10,5,115,67.5");
  });

  it("exports the header for an empty basket", () => {
    expect(buildBasketCsv([])).toBe(
      "Label,Product amount,Currency,Shipping,Service fee,Total before conversion,Estimated AZN,Created at"
    );
  });
});
