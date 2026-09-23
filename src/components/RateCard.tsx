import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { SupportedCurrency } from "../types/currency";
import { CURRENCIES } from "../types/currency";
import { useLanguage } from "../contexts/LanguageContext";
import { formatNumber } from "../i18n/format";
import { Sparkline } from "./Sparkline";
import { formatTrendPercent, type TrendSummary } from "../services/trend";

interface RateCardProps {
  currency: SupportedCurrency;
  rate: number;
  onClick?: () => void;
  active?: boolean;
  trend?: TrendSummary;
}

export function RateCard({ currency, rate, onClick, active, trend }: RateCardProps) {
  const meta = CURRENCIES[currency];
  const { language, t } = useLanguage();
  const formattedRate = formatNumber(rate, language, { maximumFractionDigits: 4 });

  const trendIcon = trend?.direction === "up"
    ? <ArrowUp size={11} />
    : trend?.direction === "down"
      ? <ArrowDown size={11} />
      : trend?.direction === "flat"
        ? <Minus size={11} />
        : null;

  const trendLabel = trend
    ? trend.direction === "up"
      ? t("trendUp", { value: formatTrendPercent(trend.changePercent, language) })
      : trend.direction === "down"
        ? t("trendDown", { value: formatTrendPercent(Math.abs(trend.changePercent), language) })
        : t("trendFlat")
    : null;

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

      <div className="rate-card-bottom">
        <div className="rate-card-trend-row">
          {trend && trendIcon && (
            <span
              className={`rate-card-trend trend-${trend.direction}`}
              aria-label={trendLabel ?? undefined}
            >
              {trendIcon}
              <span className="rate-card-trend-pct">{trendLabel}</span>
            </span>
          )}
          <span className="rate-card-foot">{t("rateFoot", { value: currency })}</span>
        </div>
        {trend && <Sparkline data={trend.sparkline} />}
      </div>
    </button>
  );
}
