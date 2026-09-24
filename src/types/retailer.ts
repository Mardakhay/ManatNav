import type { SupportedCurrency } from "./currency";

export interface RetailerPreset {
  id: string;
  name: string;
  defaultCurrency: SupportedCurrency;
  defaultShipping: number;
  shippingNote: string;
}

export const RETAILERS: RetailerPreset[] = [
  {
    id: "custom",
    name: "Custom",
    defaultCurrency: "TRY",
    defaultShipping: 0,
    shippingNote: "Enter your own amount and shipping.",
  },
  {
    id: "trendyol",
    name: "Trendyol",
    defaultCurrency: "TRY",
    defaultShipping: 0,
    shippingNote: "Trendyol often offers free shipping within Turkey on orders above a threshold. Check the listing for cargo fees.",
  },
  {
    id: "amazon",
    name: "Amazon US",
    defaultCurrency: "USD",
    defaultShipping: 0,
    shippingNote: "Amazon US shipping to Azerbaijan varies by seller. Check the product page for international shipping costs.",
  },
  {
    id: "aliexpress",
    name: "AliExpress",
    defaultCurrency: "USD",
    defaultShipping: 0,
    shippingNote: "AliExpress typically ships with free or low-cost standard shipping. Expedited options cost extra.",
  },
  {
    id: "taobao",
    name: "Taobao",
    defaultCurrency: "CNY",
    defaultShipping: 0,
    shippingNote: "Taobao shipping within China is often inexpensive. Use a proxy service for delivery to Azerbaijan.",
  },
];

export const DEFAULT_RETAILER_ID = "custom";
