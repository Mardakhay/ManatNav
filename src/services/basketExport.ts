import type { BasketItem } from "../types/basket";

const HEADER = [
  "Label",
  "Product amount",
  "Currency",
  "Shipping",
  "Service fee",
  "Total before conversion",
  "Estimated AZN",
  "Created at",
];

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? "\"" + text.replace(/"/g, "\"\"") + "\"" : text;
}

export function buildBasketCsv(items: BasketItem[]): string {
  const rows = items.map((item) => [
    item.label,
    item.amount,
    item.currency,
    item.shipping,
    item.serviceFee ?? 0,
    item.amount + item.shipping + (item.serviceFee ?? 0),
    item.convertedAmount,
    new Date(item.createdAt).toISOString(),
  ]);

  return [HEADER, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}
