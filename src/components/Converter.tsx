import { ArrowDownUp, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BasketItem } from "../types/basket";
import type { RetailerPreset } from "../types/retailer";
import { RETAILERS, DEFAULT_RETAILER_ID } from "../types/retailer";
import type { SupportedCurrency } from "../types/currency";
import { CURRENCIES } from "../types/currency";

interface ConverterProps {
  rates: Record<string, number>;
  onSaveToBasket: (item: BasketItem) => void;
}

export function Converter({ rates, onSaveToBasket }: ConverterProps) {
  const [retailerId, setRetailerId] = useState(DEFAULT_RETAILER_ID);
  const [from, setFrom] = useState<SupportedCurrency>("TRY");
  const [to, setTo] = useState<SupportedCurrency>("AZN");
  const [amount, setAmount] = useState("100");
  const [shipping, setShipping] = useState("0");
  const [serviceFee, setServiceFee] = useState("0");
  const [label, setLabel] = useState("");

  const retailer = useMemo(
    () => RETAILERS.find((r) => r.id === retailerId) ?? RETAILERS[0],
    [retailerId]
  );

  const directRate = useMemo(() => {
    if (from === to) return 1;
    if (from === "AZN" && rates[to]) return rates[to];
    if (to === "AZN" && rates[from]) return 1 / rates[from];
    if (rates[from] && rates[to]) return (1 / rates[from]) * rates[to];
    return null;
  }, [from, to, rates]);

  const numericAmount = Number(amount || 0);
  const numericShipping = Number(shipping || 0);
  const numericFee = Number(serviceFee || 0);
  const total = numericAmount + numericShipping + numericFee;
  const converted = directRate === null ? null : total * directRate;

  // Apply retailer preset: set currency + reset shipping when retailer changes
  useEffect(() => {
    if (retailer.id !== DEFAULT_RETAILER_ID) {
      setFrom(retailer.defaultCurrency);
      setShipping(String(retailer.defaultShipping));
      setLabel(retailer.name);
    }
  }, [retailer]);

  // Reset shipping when currency changes (unless a retailer preset is active)
  useEffect(() => {
    if (retailer.id === DEFAULT_RETAILER_ID) {
      setShipping("0");
    }
  }, [from, retailer.id]);

  function applyPreset(preset: RetailerPreset) {
    setRetailerId(preset.id);
  }

  function handleSave() {
    if (converted === null) return;
    onSaveToBasket({
      id: crypto.randomUUID(),
      label: label.trim() || `${retailer.name} order`,
      amount: numericAmount,
      currency: from,
      shipping: numericShipping + numericFee,
      convertedAmount: converted,
      createdAt: Date.now(),
    });
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">SHOPPING TOOL</div>
          <h2>Convert before you buy</h2>
          <p>See what your overseas order costs in Azerbaijani manat.</p>
        </div>
        <div className="panel-icon">
          <ShoppingBag size={20} />
        </div>
      </div>

      <div className="retailer-presets">
        {RETAILERS.map((preset) => (
          <button
            key={preset.id}
            className={`retailer-chip ${retailerId === preset.id ? "active" : ""}`}
            onClick={() => applyPreset(preset)}
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
          aria-label="Swap currencies"
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
              ? "—"
              : `${converted.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })} ${CURRENCIES[to].symbol}`}
          </strong>
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
        />
        <button
          className="save-button"
          onClick={handleSave}
          disabled={converted === null}
        >
          <Plus size={16} />
          Save to basket
        </button>
      </div>

      <div className="muted-note">
        Rates are reference rates from Frankfurter. Final card/bank conversion may differ.
      </div>
    </section>
  );
}
