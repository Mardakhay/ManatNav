import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "./currency";

export interface BasketItem {
  id: string;
  label: string;
  amount: number;
  currency: SupportedCurrency;
  shipping: number;
  serviceFee?: number;
  convertedAmount: number;
  createdAt: number;
}

export const BASKET_STORAGE_KEY = "manatnav:basket";

export function isBasketItem(value: unknown): value is BasketItem {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.label === "string" &&
    candidate.label.length > 0 &&
    typeof candidate.amount === "number" &&
    Number.isFinite(candidate.amount) &&
    candidate.amount >= 0 &&
    SUPPORTED_CURRENCIES.includes(candidate.currency as SupportedCurrency) &&
    typeof candidate.shipping === "number" &&
    Number.isFinite(candidate.shipping) &&
    candidate.shipping >= 0 &&
    (candidate.serviceFee === undefined ||
      (typeof candidate.serviceFee === "number" &&
        Number.isFinite(candidate.serviceFee) &&
        candidate.serviceFee >= 0)) &&
    typeof candidate.convertedAmount === "number" &&
    Number.isFinite(candidate.convertedAmount) &&
    candidate.convertedAmount >= 0 &&
    typeof candidate.createdAt === "number" &&
    Number.isFinite(candidate.createdAt)
  );
}
