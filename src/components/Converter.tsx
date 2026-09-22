import { ArrowDownUp, Check, Copy, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BasketItem } from "../types/basket";
import type { RetailerPreset } from "../types/retailer";
import { RETAILERS, DEFAULT_RETAILER_ID } from "../types/retailer";
import { getConversionRate } from "../services/conversion";
import {
  buildCalculationShareUrl,
  readCalculationFromUrl,
} from "../services/share";
import type { SupportedCurrency } from "../types/currency";
import { CURRENCIES } from "../types/currency";
import { useLanguage } from "../contexts/LanguageContext";

interface ConverterProps {
  rates: Record<string, number>;
  onSaveToBasket: (item: BasketItem) => void;
}

function parseNonNegativeNumber(value: string): number | null {
  if (value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

const QUICK_AMOUNTS = [25, 50, 100, 250] as const;

function formatAmount(value: number, currency: SupportedCurrency): string {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${CURRENCIES[currency].symbol}`;
}

export function Converter({ rates, onSaveToBasket }: ConverterProps) {
  const { t } = useLanguage();
  const sharedState = useMemo(() => readCalculationFromUrl(), []);
  const initialRetailerId = sharedState?.retailerId ?? DEFAULT_RETAILER_ID;
  const initialRetailer =
    RETAILERS.find((preset) => preset.id === initialRetailerId) ?? RETAILERS[0];
  const [retailerId, setRetailerId] = useState(initialRetailer.id);
  const [from, setFrom] = useState<SupportedCurrency>(
    sharedState?.from ?? initialRetailer.defaultCurrency
  );
  const [to, setTo] = useState<SupportedCurrency>(sharedState?.to ?? "AZN");
  const [amount, setAmount] = useState(sharedState?.amount ?? "100");
  const [shipping, setShipping] = useState(sharedState?.shipping ?? "0");
  const [serviceFee, setServiceFee] = useState(sharedState?.serviceFee ?? "0");
  const [label, setLabel] = useState(sharedState?.label ?? "");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "ready">("idle");
  const initializedRetailerRef = useRef(false);

  const retailer = useMemo(
    () => RETAILERS.find((r) => r.id === retailerId) ?? RETAILERS[0],
    [retailerId]
  );

  const directRate = useMemo(() => {
    return getConversionRate(from, to, rates);
  }, [from, to, rates]);

  const numericAmount = parseNonNegativeNumber(amount);
  const numericShipping = parseNonNegativeNumber(shipping);
  const numericFee = parseNonNegativeNumber(serviceFee);
  const total =
    numericAmount !== null && numericShipping !== null && numericFee !== null
      ? numericAmount + numericShipping + numericFee
      : null;
  const converted = directRate === null || total === null ? null : total * directRate;

  const canSave =
    converted !== null &&
    numericAmount !== null &&
    numericAmount > 0 &&
    directRate !== null;

  useEffect(() => {
    if (!initializedRetailerRef.current) {
      initializedRetailerRef.current = true;
      return;
    }

    setFrom(retailer.defaultCurrency);
    setShipping(String(retailer.defaultShipping));
    setServiceFee("0");
    setLabel(retailer.id === DEFAULT_RETAILER_ID ? "" : retailer.name);
  }, [retailer]);

  async function handleShare() {
    const shareUrl = buildCalculationShareUrl({
      retailerId: retailer.id,
      from,
      to,
      amount,
      shipping,
      serviceFee,
      label,
    });

    if (!shareUrl) return;
    window.history.replaceState(null, "", shareUrl);

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("copied");
        return;
      } catch {
        setShareStatus("ready");
        return;
      }
    }

    setShareStatus("ready");
  }

  function applyPreset(preset: RetailerPreset) {
    setRetailerId(preset.id);
  }

  function handleSave() {
    if (
      !canSave ||
      converted === null ||
      directRate === null ||
      numericAmount === null ||
      numericShipping === null ||
      numericFee === null
    ) return;
    onSaveToBasket({
      id: crypto.randomUUID(),
      label: label.trim() || `${retailer.name} order`,
      amount: numericAmount,
      currency: from,
      shipping: numericShipping,
      serviceFee: numericFee,
      convertedAmount: converted,
      createdAt: Date.now(),
    });
  }

  return (
    <section className="panel" aria-label={t("shoppingTool")}>
      <div className="panel-heading">
        <div>
          <div className="eyebrow">{t("shoppingTool")}</div>
          <h2>{t("converterTitle")}</h2>
          <p>{t("converterDescription")}</p>
        </div>
        <div className="panel-icon" aria-hidden="true">
          <ShoppingBag size={20} />
        </div>
      </div>

      <div className="retailer-presets" role="group" aria-label={t("retailerPresets")}>
        {RETAILERS.map((preset) => (
          <button
            key={preset.id}
            className={`retailer-chip ${retailerId === preset.id ? "active" : ""}`}
            onClick={() => applyPreset(preset)}
            aria-pressed={retailerId === preset.id}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="quick-amounts" role="group" aria-label={t("quickAmount")}>
        <span className="quick-amounts-label">{t("quickAmount")}</span>
        {QUICK_AMOUNTS.map((quickAmount) => (
          <button
            key={quickAmount}
            className={`quick-amount ${amount === String(quickAmount) ? "active" : ""}`}
            onClick={() => setAmount(String(quickAmount))}
            aria-pressed={amount === String(quickAmount)}
          >
            {quickAmount}
          </button>
        ))}
      </div>

      <div className="converter-grid">
        <label>
          {t("amount")}
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-label={t("amount")}
          />
        </label>

        <label>
          {t("from")}
          <select value={from} onChange={(event) => setFrom(event.target.value as SupportedCurrency)}>
            {Object.keys(CURRENCIES).map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </label>

        <button
          className="swap-button"
          aria-label={t("swapCurrencies")}
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        >
          <ArrowDownUp size={18} />
        </button>

        <label>
          {t("to")}
          <select value={to} onChange={(event) => setTo(event.target.value as SupportedCurrency)}>
            {Object.keys(CURRENCIES).map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </label>

        <div className="conversion-result">
          <span>{t("estimatedResult")}</span>
          <strong>
            {converted === null
              ? total === null
                ? t("enterValidAmounts")
                : t("rateUnavailable")
              : `${converted.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })} ${CURRENCIES[to].symbol}`}
          </strong>
        </div>
      </div>

      <div className="cost-breakdown" aria-label={t("costBreakdown")}>
        <div>
          <span>{t("product")}</span>
          <strong>{numericAmount === null ? "—" : formatAmount(numericAmount, from)}</strong>
        </div>
        <div>
          <span>{t("shipping")}</span>
          <strong>{numericShipping === null ? "—" : formatAmount(numericShipping, from)}</strong>
        </div>
        <div>
          <span>{t("serviceFee")}</span>
          <strong>{numericFee === null ? "—" : formatAmount(numericFee, from)}</strong>
        </div>
        <div className="cost-breakdown-total">
          <span>{t("totalBeforeConversion")}</span>
          <strong>{total === null ? "—" : formatAmount(total, from)}</strong>
        </div>
      </div>

      <div className="shipping-grid">
        <label>
          Shipping ({from})
          <input
            type="number"
            min="0"
            step="0.01"
            value={shipping}
            onChange={(event) => setShipping(event.target.value)}
            aria-label={`${t("shipping")} (${from})`}
          />
        </label>

        <label>
          Service / proxy fee ({from})
          <input
            type="number"
            min="0"
            step="0.01"
            value={serviceFee}
            onChange={(event) => setServiceFee(event.target.value)}
            aria-label={`${t("serviceFee")} (${from})`}
          />
        </label>
      </div>

      {retailer.shippingNote && retailer.id !== DEFAULT_RETAILER_ID && (
        <div className="muted-note retailer-note">{retailer.shippingNote}</div>
      )}

      <div className="save-row">
        <input
          type="text"
          placeholder={t("itemLabel")}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="save-label-input"
          aria-label={t("itemLabel")}
        />
        <button
          className="save-button"
          onClick={handleSave}
          disabled={!canSave}
          aria-label={t("saveToBasket")}
        >
          <Plus size={16} />
          {t("saveToBasket")}
        </button>
        <button
          className="share-button"
          onClick={() => void handleShare()}
          aria-label={t("shareLink")}
        >
          {shareStatus === "copied" ? <Check size={16} /> : <Copy size={16} />}
          {shareStatus === "copied" ? t("copied") : t("shareLink")}
        </button>
      </div>

      {shareStatus === "ready" && (
        <div className="muted-note share-note" role="status">
          {t("shareReady")}
        </div>
      )}

      <div className="muted-note">
        {t("referenceRateNote")}
      </div>
    </section>
  );
}
