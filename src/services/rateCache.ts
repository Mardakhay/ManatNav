import { parseRateRows } from "./frankfurter";
import type { LatestRateRow } from "../types/currency";

const LATEST_RATES_CACHE_KEY = "manatnav:latest-rates-cache";

export interface CachedLatestRates {
  rows: LatestRateRow[];
  savedAt: string;
}

export function validateCachedLatestRates(value: unknown): value is CachedLatestRates {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.rows) || typeof candidate.savedAt !== "string") return false;
  if (Number.isNaN(Date.parse(candidate.savedAt))) return false;

  const validRows = parseRateRows(candidate.rows);
  return validRows.length === candidate.rows.length && validRows.length > 0;
}

export function readLatestRatesCache(): CachedLatestRates | null {
  try {
    const stored = localStorage.getItem(LATEST_RATES_CACHE_KEY);
    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);
    if (!validateCachedLatestRates(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function writeLatestRatesCache(rows: LatestRateRow[]): void {
  try {
    localStorage.setItem(
      LATEST_RATES_CACHE_KEY,
      JSON.stringify({ rows, savedAt: new Date().toISOString() })
    );
  } catch {
    // Ignore unavailable storage and quota errors.
  }
}
