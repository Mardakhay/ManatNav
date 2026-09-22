import type { SupportedCurrency } from "./currency";

export interface BasketItem {
  id: string;
  label: string;
  amount: number;
  currency: SupportedCurrency;
  shipping: number;
  convertedAmount: number;
  createdAt: number;
}

export const BASKET_STORAGE_KEY = "manatnav:basket";
