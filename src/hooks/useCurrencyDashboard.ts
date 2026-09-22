import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLatestRates, fetchTimeSeries } from "../services/frankfurter";
import {
  CURRENCIES,
  SUPPORTED_CURRENCIES,
  type HistoricalRateRow,
  type LatestRateRow,
  type SupportedCurrency,
} from "../types/currency";

const DEFAULT_QUOTES = SUPPORTED_CURRENCIES.filter((currency) => currency !== "AZN");

export function useCurrencyDashboard(baseCurrency: SupportedCurrency) {
  const [rates, setRates] = useState<LatestRateRow[]>([]);
  const [history, setHistory] = useState<HistoricalRateRow[]>([]);
  const [selectedHistoryQuote, setSelectedHistoryQuote] =
    useState<SupportedCurrency>("USD");
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const latestControllerRef = useRef<AbortController | null>(null);
  const historyControllerRef = useRef<AbortController | null>(null);

  const loadLatest = useCallback(async () => {
    latestControllerRef.current?.abort();
    const controller = new AbortController();
    latestControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const rows = await fetchLatestRates(baseCurrency, DEFAULT_QUOTES, controller.signal);
      if (controller.signal.aborted) return;
      setRates(rows);
      setLastUpdated(rows[0]?.date ?? null);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "Unable to load rates.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
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
        controller.signal
      );
      if (controller.signal.aborted) return;
      setHistory(rows);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setHistoryError(
        caught instanceof Error ? caught.message : "Unable to load historical data."
      );
    } finally {
      if (!controller.signal.aborted) setHistoryLoading(false);
    }
  }, [baseCurrency, selectedHistoryQuote]);

  useEffect(() => {
    void loadLatest();
    return () => latestControllerRef.current?.abort();
  }, [loadLatest]);

  useEffect(() => {
    void loadHistory();
    return () => historyControllerRef.current?.abort();
  }, [loadHistory]);

  return {
    rates,
    history,
    selectedHistoryQuote,
    setSelectedHistoryQuote,
    loading,
    historyLoading,
    error,
    historyError,
    lastUpdated,
    refresh: loadLatest,
    currencyMeta: CURRENCIES[baseCurrency],
  };
}
