import { ArrowDownUp, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SupportedCurrency } from "../types/currency";
import { CURRENCIES } from "../types/currency";

interface ConverterProps {
  rates: Record<string, number>;
}

export function Converter({ rates }: ConverterProps) {
  const [from, setFrom] = useState<SupportedCurrency>("TRY");
  const [to, setTo] = useState<SupportedCurrency>("AZN");
  const [amount, setAmount] = useState("100");
  const [shipping, setShipping] = useState("0");

  const directRate = useMemo(() => {
    if (from === to) return 1;

    if (from === "AZN" && rates[to]) return rates[to];

    if (to === "AZN" && rates[from]) return 1 / rates[from];

    if (rates[from] && rates[to]) return (1 / rates[from]) * rates[to];

    return null;
  }, [from, to, rates]);

  const total = Number(amount || 0) + (from === "AZN" ? Number(shipping || 0) : 0);
  const converted = directRate === null ? null : total * directRate;

  useEffect(() => {
    setShipping("0");
  }, [from]);

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

      <div className="shopping-extra">
        <label>
          Shipping in {from}
          <input
            type="number"
            min="0"
            step="0.01"
            value={shipping}
            onChange={(event) => setShipping(event.target.value)}
          />
        </label>
        <div className="muted-note">
          Rates are reference rates from Frankfurter. Final card/bank conversion may differ.
        </div>
      </div>
    </section>
  );
}
