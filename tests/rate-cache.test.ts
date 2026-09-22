import { afterEach, describe, expect, it } from "vitest";
import {
  readHistoricalRatesCache,
  readLatestRatesCache,
  validateCachedHistoricalRates,
  validateCachedLatestRates,
  writeHistoricalRatesCache,
  writeLatestRatesCache,
} from "../src/services/rateCache";

const validRow = { date: "2026-09-22", base: "AZN", quote: "USD", rate: 0.5883 };

const originalStorage = globalThis.localStorage;

afterEach(() => {
  if (originalStorage) {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: originalStorage });
  } else {
    Reflect.deleteProperty(globalThis, "localStorage");
  }
});

describe("latest-rate cache validation", () => {
  it("accepts a cache containing valid rates and timestamp", () => {
    expect(validateCachedLatestRates({ rows: [validRow], savedAt: "2026-09-22T10:00:00.000Z" })).toBe(true);
  });

  it("rejects malformed or empty cache payloads", () => {
    expect(validateCachedLatestRates({ rows: [], savedAt: "2026-09-22T10:00:00.000Z" })).toBe(false);
    expect(validateCachedLatestRates({ rows: [{ ...validRow, rate: -1 }], savedAt: "bad" })).toBe(false);
  });

  it("round-trips valid rates through browser storage", () => {
    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });

    writeLatestRatesCache([validRow]);

    expect(readLatestRatesCache()?.rows).toEqual([validRow]);
  });

  it("validates historical cache payloads", () => {
    expect(validateCachedHistoricalRates({ rows: [validRow], savedAt: "2026-09-22T10:00:00.000Z" })).toBe(true);
    expect(validateCachedHistoricalRates({ rows: [], savedAt: "2026-09-22T10:00:00.000Z" })).toBe(false);
  });

  it("round-trips a historical series by currency and range", () => {
    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });

    writeHistoricalRatesCache("AZN", "USD", 3, [validRow]);

    expect(readHistoricalRatesCache("AZN", "USD", 3)?.rows).toEqual([validRow]);
  });
});
