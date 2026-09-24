import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchLatestRates,
  fetchTimeSeries,
  fetchTrendRates,
  type HistoryRange,
} from "../services/frankfurter";
import {
  CURRENCIES,
  SUPPORTED_CURRENCIES,
  type HistoricalRateRow,
  type LatestRateRow,
  type SupportedCurrency,
} from "../types/currency";
import {
  readHistoricalRatesCache,
  readLatestRatesCache,
  writeHistoricalRatesCache,
  writeLatestRatesCache,
} from "../services/rateCache";
import { computeTrend, type TrendSummary } from "../services/trend";

const DEFAULT_QUOTES = SUPPORTED_CURRENCIES.filter((currency) => currency !== "AZN");

export function useCurrencyDashboard(baseCurrency: SupportedCurrency) {
  const [rates, setRates] = useState<LatestRateRow[]>([]);
  const [history, setHistory] = useState<HistoricalRateRow[]>([]);
  const [selectedHistoryQuote, setSelectedHistoryQuote] =
    useState<SupportedCurrency>("USD");
  const [historyRange, setHistoryRange] = useState<HistoryRange>(12);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [ratesStale, setRatesStale] = useState(false);
  const [ratesCachedAt, setRatesCachedAt] = useState<string | null>(null);
  const [historyStale, setHistoryStale] = useState(false);
  const [historyCachedAt, setHistoryCachedAt] = useState<string | null>(null);
  const [trends, setTrends] = useState<Record<string, TrendSummary>>({});

  const latestControllerRef = useRef<AbortController | null>(null);
  const historyControllerRef = useRef<AbortController | null>(null);
  const trendControllerRef = useRef<AbortController | null>(null);

  const loadLatest = useCallback(async () => {
    latestControllerRef.current?.abort();
    const controller = new AbortController();
    latestControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const rows = await fetchLatestRates(baseCurrency, DEFAULT_QUOTES, controller.signal);
      if (controller.signal.aborted || latestControllerRef.current !== controller) return;
      setRates(rows);
      setLastUpdated(rows[0]?.date ?? null);
      setRatesStale(false);
      setRatesCachedAt(null);
      writeLatestRatesCache(rows);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      if (latestControllerRef.current !== controller) return;
      const cached = readLatestRatesCache();
      if (cached) {
        setRates(cached.rows);
        setLastUpdated(cached.rows[0]?.date ?? cached.savedAt);
        setRatesStale(true);
        setRatesCachedAt(cached.savedAt);
        setError("Live exchange rates are temporarily unavailable.");
      } else {
        setError(caught instanceof Error ? caught.message : "Unable to load rates.");
      }
    } finally {
      if (latestControllerRef.current === controller) {
        latestControllerRef.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }, [baseCurrency]);

  const loadHistory = useCallback(async () => {
    historyControllerRef.current?.abort();
    const controller = new AbortController();
    historyControllerRef.current = controller;

    try {
      setHistoryLoading(true);
      setHistoryError(null);

      const rows = await fetchTimeSeries(
        baseCurrency,
        selectedHistoryQuote,
        historyRange,
        controller.signal
      );
      if (controller.signal.aborted || historyControllerRef.current !== controller) return;
      setHistory(rows);
      setHistoryStale(false);
      setHistoryCachedAt(null);
      writeHistoricalRatesCache(baseCurrency, selectedHistoryQuote, historyRange, rows);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      if (historyControllerRef.current !== controller) return;
      const cached = readHistoricalRatesCache(baseCurrency, selectedHistoryQuote, historyRange);
      if (cached) {
        setHistory(cached.rows);
        setHistoryStale(true);
        setHistoryCachedAt(cached.savedAt);
        setHistoryError("Live historical data is temporarily unavailable.");
      } else {
        setHistoryError(
          caught instanceof Error ? caught.message : "Unable to load historical data."
        );
      }
    } finally {
      if (historyControllerRef.current === controller) {
        historyControllerRef.current = null;
        if (!controller.signal.aborted) setHistoryLoading(false);
      }
    }
  }, [baseCurrency, historyRange, selectedHistoryQuote]);

  const loadTrends = useCallback(async () => {
    trendControllerRef.current?.abort();
    const controller = new AbortController();
    trendControllerRef.current = controller;

    try {
      const grouped = await fetchTrendRates(baseCurrency, DEFAULT_QUOTES, 14, controller.signal);
      if (controller.signal.aborted || trendControllerRef.current !== controller) return;

      const computed: Record<string, TrendSummary> = {};
      for (const [quote, rateSeries] of Object.entries(grouped)) {
        const summary = computeTrend(rateSeries);
        if (summary) computed[quote] = summary;
      }
      setTrends(computed);
    } catch {
      // Trend data is supplementary; silently skip on failure.
    } finally {
      if (trendControllerRef.current === controller) {
        trendControllerRef.current = null;
      }
    }
  }, [baseCurrency]);

  useEffect(() => {
    void loadLatest();
    void loadTrends();
    return () => {
      latestControllerRef.current?.abort();
      trendControllerRef.current?.abort();
    };
  }, [loadLatest, loadTrends]);

  useEffect(() => {
    void loadHistory();
    return () => historyControllerRef.current?.abort();
  }, [loadHistory]);

  useEffect(() => {
    const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

    function handleVisibilityChange() {
      if (!document.hidden) {
        void loadLatest();
        void loadTrends();
      }
    }

    function handleInterval() {
      if (!document.hidden) {
        void loadLatest();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = window.setInterval(handleInterval, AUTO_REFRESH_INTERVAL);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [loadLatest, loadTrends]);

  return {
    rates,
    history,
    selectedHistoryQuote,
    setSelectedHistoryQuote,
    historyRange,
    setHistoryRange,
    loading,
    historyLoading,
    error,
    historyError,
    lastUpdated,
    ratesStale,
    ratesCachedAt,
    historyStale,
    historyCachedAt,
    refresh: loadLatest,
    trends,
    currencyMeta: CURRENCIES[baseCurrency],
  };
}
