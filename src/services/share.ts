import { DEFAULT_RETAILER_ID, RETAILERS } from "../types/retailer";
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from "../types/currency";

export interface CalculationShareState {
  retailerId: string;
  from: SupportedCurrency;
  to: SupportedCurrency;
  amount: string;
  shipping: string;
  serviceFee: string;
  label: string;
}

export function readCalculationFromUrl(): Partial<CalculationShareState> | null {
  if (typeof window === "undefined") return null;

  const params = new URL(window.location.href).searchParams;
  const state: Partial<CalculationShareState> = {};
  const retailerId = params.get("retailer");
  const from = params.get("from");
  const to = params.get("to");

  if (retailerId && RETAILERS.some((retailer) => retailer.id === retailerId)) {
    state.retailerId = retailerId;
  }
  if (isSupportedCurrency(from)) state.from = from;
  if (isSupportedCurrency(to)) state.to = to;

  setStringParam(state, "amount", params.get("amount"));
  setStringParam(state, "shipping", params.get("shipping"));
  setStringParam(state, "serviceFee", params.get("fee"));
  setStringParam(state, "label", params.get("label"));

  return Object.keys(state).length > 0 ? state : null;
}

export function buildCalculationShareUrl(state: CalculationShareState): string {
  if (typeof window === "undefined") return "";

  const url = new URL(window.location.href);
  url.search = "";
  setQueryParam(url, "retailer", state.retailerId, DEFAULT_RETAILER_ID);
  setQueryParam(url, "from", state.from, "TRY");
  setQueryParam(url, "to", state.to, "AZN");
  setQueryParam(url, "amount", state.amount, "100");
  setQueryParam(url, "shipping", state.shipping, "0");
  setQueryParam(url, "fee", state.serviceFee, "0");
  setQueryParam(url, "label", state.label);
  return url.toString();
}

function isSupportedCurrency(value: string | null): value is SupportedCurrency {
  return value !== null && SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);
}

function setStringParam(
  state: Partial<CalculationShareState>,
  key: keyof Pick<CalculationShareState, "amount" | "shipping" | "serviceFee" | "label">,
  value: string | null
) {
  if (value !== null) state[key] = value;
}

function setQueryParam(url: URL, key: string, value: string, defaultValue?: string) {
  if (value && value !== defaultValue) url.searchParams.set(key, value);
}
