import { useCallback, useEffect, useState } from "react";
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

  const loadLatest = useCallback(async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const rows = await fetchLatestRates(baseCurrency, DEFAULT_QUOTES, controller.signal);
      setRates(rows);
      setLastUpdated(rows[0]?.date ?? null);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "Unable to load rates.");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [baseCurrency]);

  const loadHistory = useCallback(async () => {
    const controller = new AbortController();

    try {
      setHistoryLoading(true);
      setHistoryError(null);

      const rows = await fetchTimeSeries(
        baseCurrency,
        selectedHistoryQuote,
        controller.signal
      );
      setHistory(rows);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setHistoryError(
        caught instanceof Error ? caught.message : "Unable to load historical data."
      );
    } finally {
      setHistoryLoading(false);
    }

    return () => controller.abort();
  }, [baseCurrency, selectedHistoryQuote]);

  useEffect(() => {
    void loadLatest();
  }, [loadLatest]);

  useEffect(() => {
    void loadHistory();
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
