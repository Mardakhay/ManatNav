import type { SupportedCurrency } from "../types/currency";
import { CURRENCIES } from "../types/currency";

interface RateCardProps {
  currency: SupportedCurrency;
  rate: number;
  onClick?: () => void;
  active?: boolean;
}

export function RateCard({ currency, rate, onClick, active }: RateCardProps) {
  const meta = CURRENCIES[currency];

  return (
    <button className={`rate-card ${active ? "active" : ""}`} onClick={onClick}>
      <div className="rate-card-top">
        <span className="currency-code">{currency}</span>
        <span className="currency-symbol">{meta.symbol}</span>
      </div>

      <div className="rate-card-value">
        {rate.toLocaleString("en-US", { maximumFractionDigits: 4 })}
      </div>

      <div className="rate-card-foot">1 AZN → {currency}</div>
    </button>
  );
}
