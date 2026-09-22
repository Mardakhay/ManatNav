import { describe, expect, it } from "vitest";
import { convertAmount, getConversionRate } from "../src/services/conversion";

const rates = {
  USD: 2,
  EUR: 4,
  TRY: 40,
};

describe("currency conversion", () => {
  it("converts from AZN to a quoted currency", () => {
    expect(getConversionRate("AZN", "USD", rates)).toBe(2);
    expect(convertAmount(25, "AZN", "USD", rates)).toBe(50);
  });

  it("converts a quoted currency back to AZN", () => {
    expect(getConversionRate("USD", "AZN", rates)).toBe(0.5);
    expect(convertAmount(10, "USD", "AZN", rates)).toBe(5);
  });

  it("uses the correct cross-currency ratio", () => {
    expect(getConversionRate("USD", "TRY", rates)).toBe(20);
    expect(convertAmount(3, "USD", "TRY", rates)).toBe(60);
  });

  it("rejects invalid amounts and unavailable rates", () => {
    expect(convertAmount(-1, "USD", "AZN", rates)).toBeNull();
    expect(convertAmount(Number.NaN, "USD", "AZN", rates)).toBeNull();
    expect(getConversionRate("GBP", "AZN", rates)).toBeNull();
  });
});
