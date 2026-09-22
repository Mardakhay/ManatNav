import type { SupportedCurrency } from "../types/currency";
import { CURRENCIES } from "../types/currency";
import { useLanguage } from "../contexts/LanguageContext";
import { formatNumber } from "../i18n/format";

interface RateCardProps {
  currency: SupportedCurrency;
  rate: number;
  onClick?: () => void;
  active?: boolean;
}

export function RateCard({ currency, rate, onClick, active }: RateCardProps) {
  const meta = CURRENCIES[currency];
  const { language, t } = useLanguage();
  const formattedRate = formatNumber(rate, language, { maximumFractionDigits: 4 });

  return (
    <button
      className={`rate-card ${active ? "active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={t("selectHistory", { rate: formattedRate, value: meta.name })}
    >
      <div className="rate-card-top">
        <span className="currency-code">{currency}</span>
        <span className="currency-symbol">{meta.symbol}</span>
      </div>

      <div className="rate-card-value">
        {rate.toLocaleString("en-US", { maximumFractionDigits: 4 })}
      </div>

      <div className="rate-card-foot">{t("rateFoot", { value: currency })}</div>
    </button>
  );
}
