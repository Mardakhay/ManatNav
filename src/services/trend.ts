import type { SupportedCurrency } from "../types/currency";

export interface TrendData {
  quote: SupportedCurrency;
  changePercent: number;
  direction: "up" | "down" | "flat";
  sparkline: number[];
}

export interface TrendSummary {
  latest: number;
  first: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
  sparkline: number[];
}

export function computeTrend(rates: number[]): TrendSummary | null {
  if (rates.length < 2) return null;

  const first = rates[0];
  const latest = rates[rates.length - 1];
  const changePercent = first !== 0 ? ((latest - first) / first) * 100 : 0;
  const direction =
    Math.abs(changePercent) < 0.01 ? "flat" : changePercent > 0 ? "up" : "down";

  return {
    latest,
    first,
    changePercent,
    direction,
    sparkline: rates,
  };
}

export function formatTrendPercent(value: number, language: "en" | "az"): string {
  const sign = value > 0 ? "+" : "";
  const formatted = value.toLocaleString(language === "az" ? "az-AZ" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${formatted}%`;
}
