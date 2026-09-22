import type { Language } from "./copy";

export function getLocale(language: Language): string {
  return language === "az" ? "az-AZ" : "en-US";
}

export function formatNumber(
  value: number,
  language: Language,
  options: Intl.NumberFormatOptions = {}
): string {
  return value.toLocaleString(getLocale(language), options);
}

export function formatDate(
  value: string | Date,
  language: Language,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Date(value).toLocaleDateString(getLocale(language), options);
}
