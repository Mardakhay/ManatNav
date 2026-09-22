export const SUPPORTED_CURRENCIES = ["AZN", "USD", "EUR", "TRY", "RUB", "GBP"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export interface LatestRateRow {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

export interface HistoricalRateRow {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

export interface CurrencyMeta {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyMeta> = {
  AZN: { code: "AZN", name: "Azerbaijani Manat", symbol: "₼", locale: "az-AZ" },
  USD: { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  EUR: { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
  TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺", locale: "tr-TR" },
  RUB: { code: "RUB", name: "Russian Ruble", symbol: "₽", locale: "ru-RU" },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" }
};
