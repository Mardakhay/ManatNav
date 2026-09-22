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

interface ConverterProps {
  rates: Record<string, number>;
  onSaveToBasket: (item: BasketItem) => void;
}

function parseNonNegativeNumber(value: string): number | null {
  if (value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function formatAmount(value: number, currency: SupportedCurrency): string {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${CURRENCIES[currency].symbol}`;
}

export function Converter({ rates, onSaveToBasket }: ConverterProps) {
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
    <section className="panel" aria-label="Currency converter">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">SHOPPING TOOL</div>
          <h2>Convert before you buy</h2>
          <p>See what your overseas order costs in Azerbaijani manat.</p>
        </div>
        <div className="panel-icon" aria-hidden="true">
          <ShoppingBag size={20} />
        </div>
      </div>

      <div className="retailer-presets" role="group" aria-label="Retailer presets">
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

      <div className="converter-grid">
        <label>
          Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-label="Amount to convert"
          />
        </label>

        <label>
          From
          <select value={from} onChange={(event) => setFrom(event.target.value as SupportedCurrency)}>
            {Object.keys(CURRENCIES).map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </label>

        <button
          className="swap-button"
          aria-label="Swap from and to currencies"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        >
          <ArrowDownUp size={18} />
        </button>

        <label>
          To
          <select value={to} onChange={(event) => setTo(event.target.value as SupportedCurrency)}>
            {Object.keys(CURRENCIES).map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </label>

        <div className="conversion-result">
          <span>Estimated result</span>
          <strong>
            {converted === null
              ? total === null
                ? "Enter valid amounts"
                : "Rate unavailable"
              : `${converted.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })} ${CURRENCIES[to].symbol}`}
          </strong>
        </div>
      </div>

      <div className="cost-breakdown" aria-label="Shopping cost breakdown">
        <div>
          <span>Product</span>
          <strong>{numericAmount === null ? "—" : formatAmount(numericAmount, from)}</strong>
        </div>
        <div>
          <span>Shipping</span>
          <strong>{numericShipping === null ? "—" : formatAmount(numericShipping, from)}</strong>
        </div>
        <div>
          <span>Service / proxy fee</span>
          <strong>{numericFee === null ? "—" : formatAmount(numericFee, from)}</strong>
        </div>
        <div className="cost-breakdown-total">
          <span>Total before conversion</span>
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
            aria-label={`Shipping cost in ${from}`}
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
            aria-label={`Service or proxy fee in ${from}`}
          />
        </label>
      </div>

      {retailer.shippingNote && retailer.id !== DEFAULT_RETAILER_ID && (
        <div className="muted-note retailer-note">{retailer.shippingNote}</div>
      )}

      <div className="save-row">
        <input
          type="text"
          placeholder="Label this item (optional)"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="save-label-input"
          aria-label="Item label (optional)"
        />
        <button
          className="save-button"
          onClick={handleSave}
          disabled={!canSave}
          aria-label="Save to basket"
        >
          <Plus size={16} />
          Save to basket
        </button>
        <button
          className="share-button"
          onClick={() => void handleShare()}
          aria-label="Copy shareable calculation link"
        >
          {shareStatus === "copied" ? <Check size={16} /> : <Copy size={16} />}
          {shareStatus === "copied" ? "Copied" : "Share link"}
        </button>
      </div>

      {shareStatus === "ready" && (
        <div className="muted-note share-note" role="status">
          Share link is ready in the address bar. Copy it to share this calculation.
        </div>
      )}

      <div className="muted-note">
        Rates are reference rates from Frankfurter. Final card/bank conversion may differ.
      </div>
    </section>
  );
}
