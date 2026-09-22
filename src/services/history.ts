import type { HistoricalRateRow } from "../types/currency";

export interface HistorySummary {
  latest: number | null;
  lowest: number | null;
  highest: number | null;
  average: number | null;
}

export function summarizeHistory(rows: HistoricalRateRow[]): HistorySummary {
  if (rows.length === 0) {
    return { latest: null, lowest: null, highest: null, average: null };
  }

  const values = rows.map((row) => row.rate);
  return {
    latest: values.at(-1) ?? null,
    lowest: Math.min(...values),
    highest: Math.max(...values),
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
  };
}
