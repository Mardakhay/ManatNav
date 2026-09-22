import {
  SUPPORTED_CURRENCIES,
  type HistoricalRateRow,
  type LatestRateRow,
  type SupportedCurrency,
} from "../types/currency";

export const HISTORY_RANGES = [3, 6, 12] as const;
export type HistoryRange = (typeof HISTORY_RANGES)[number];

const API_URL = "https://api.frankfurter.dev/v2";

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Frankfurter request failed (${response.status}).`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Frankfurter returned an invalid response.");
  }
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

  const rows = parseRateRows(await getJson(url.toString(), signal));

  if (rows.length === 0) {
    throw new Error("No current rates were returned.");
  }

  return rows;
}

export async function fetchTimeSeries(
  base: SupportedCurrency,
  quote: SupportedCurrency,
  months: HistoryRange = 12,
  signal?: AbortSignal
): Promise<HistoricalRateRow[]> {
  const today = new Date();
  const from = new Date(today);
  from.setMonth(today.getMonth() - months);

  const url = new URL(`${API_URL}/rates`);
  url.searchParams.set("base", base);
  url.searchParams.set("quotes", quote);
  url.searchParams.set("from", toISODate(from));
  url.searchParams.set("to", toISODate(today));
  url.searchParams.set("group", "month");

  return parseRateRows(await getJson(url.toString(), signal));
}

function parseRateRows(payload: unknown): Array<LatestRateRow | HistoricalRateRow> {
  if (!Array.isArray(payload)) {
    throw new Error("Frankfurter returned an unexpected response.");
  }

  return payload.filter(isRateRow);
}

function isRateRow(row: unknown): row is LatestRateRow | HistoricalRateRow {
  if (!row || typeof row !== "object") return false;

  const candidate = row as Record<string, unknown>;
  return (
    typeof candidate.date === "string" &&
    typeof candidate.base === "string" &&
    typeof candidate.quote === "string" &&
    SUPPORTED_CURRENCIES.includes(candidate.base as SupportedCurrency) &&
    SUPPORTED_CURRENCIES.includes(candidate.quote as SupportedCurrency) &&
    typeof candidate.rate === "number" &&
    Number.isFinite(candidate.rate) &&
    candidate.rate > 0
  );
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
