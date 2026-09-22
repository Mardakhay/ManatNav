import type { SupportedCurrency } from "../types/currency";

export type RateTable = Record<string, number>;

export function getConversionRate(
  from: SupportedCurrency,
  to: SupportedCurrency,
  rates: RateTable
): number | null {
  if (from === to) return 1;

  const aznToFrom = from === "AZN" ? 1 : getRate(rates, from);
  const aznToTo = to === "AZN" ? 1 : getRate(rates, to);

  if (aznToFrom === null || aznToTo === null) return null;
  return aznToTo / aznToFrom;
}

export function convertAmount(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  rates: RateTable
): number | null {
  if (!Number.isFinite(amount) || amount < 0) return null;

  const rate = getConversionRate(from, to, rates);
  return rate === null ? null : amount * rate;
}

function getRate(rates: RateTable, currency: SupportedCurrency): number | null {
  const rate = rates[currency];
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}
