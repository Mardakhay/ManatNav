import type { HistoricalRateRow, LatestRateRow, SupportedCurrency } from "../types/currency";

const API_URL = "https://api.frankfurter.dev/v2";

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Frankfurter request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export async function fetchLatestRates(
  base: SupportedCurrency,
  quotes: SupportedCurrency[],
  signal?: AbortSignal
): Promise<LatestRateRow[]> {
  const filteredQuotes = quotes.filter((currency) => currency !== base);
  if (filteredQuotes.length === 0) return [];

  const url = new URL(`${API_URL}/rates`);
  url.searchParams.set("base", base);
  url.searchParams.set("quotes", filteredQuotes.join(","));

  return getJson<LatestRateRow[]>(url.toString(), signal);
}

export async function fetchTimeSeries(
  base: SupportedCurrency,
  quote: SupportedCurrency,
  signal?: AbortSignal
): Promise<HistoricalRateRow[]> {
  const today = new Date();
  const from = new Date(today);
  from.setFullYear(today.getFullYear() - 1);

  const url = new URL(`${API_URL}/rates`);
  url.searchParams.set("base", base);
  url.searchParams.set("quotes", quote);
  url.searchParams.set("from", toISODate(from));
  url.searchParams.set("to", toISODate(today));
  url.searchParams.set("group", "month");

  return getJson<HistoricalRateRow[]>(url.toString(), signal);
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
