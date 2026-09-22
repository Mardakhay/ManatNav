import type { HistoricalRateRow, SupportedCurrency } from "../types/currency";
import { CURRENCIES } from "../types/currency";
import { HISTORY_RANGES, type HistoryRange } from "../services/frankfurter";
import { useLanguage } from "../contexts/LanguageContext";
import { formatDate, formatNumber } from "../i18n/format";
import { summarizeHistory } from "../services/history";

interface HistoryChartProps {
  rows: HistoricalRateRow[];
  quote: SupportedCurrency;
  loading: boolean;
  range: HistoryRange;
  onRangeChange: (range: HistoryRange) => void;
}

export function HistoryChart({ rows, quote, loading, range, onRangeChange }: HistoryChartProps) {
  const { language, t } = useLanguage();
  const width = 760;
  const height = 280;
  const paddingLeft = 64;
  const paddingRight = 22;
  const paddingTop = 28;
  const paddingBottom = 38;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const values = rows.map((row) => row.rate);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const span = max - min || 1;

  const points = rows.map((row, index) => {
    const x = paddingLeft + (index / Math.max(rows.length - 1, 1)) * plotWidth;
    const y = paddingTop + (1 - (row.rate - min) / span) * plotHeight;
    return `${x},${y}`;
  }).join(" ");

  const latestRate = rows.at(-1)?.rate;
  const firstDate = rows[0]?.date;
  const lastDate = rows.at(-1)?.date;
  const summary = summarizeHistory(rows);

  function formatSummary(value: number | null): string {
    return value === null ? "—" : formatNumber(value, language, { maximumFractionDigits: 4 });
  }

  function formatMonth(date: string | undefined): string {
    if (!date) return "—";

    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? date
      : formatDate(parsed, language, { month: "short", year: "numeric" });
  }

  return (
    <section className="panel" aria-label={t("historicalRates")}>
      <div className="panel-heading">
        <div>
          <div className="eyebrow">{t("historyEyebrow")}</div>
          <h2>{t("historyTitle", { value: quote })}</h2>
          <p>{t("historyDescription", { value: range })}</p>
        </div>

        <div className="legend-value">
          {latestRate !== undefined
            ? formatNumber(latestRate, language, { maximumFractionDigits: 4 })
            : "—"}
          <small>{CURRENCIES[quote].symbol} / AZN</small>
        </div>
      </div>

      <div className="history-range-controls" role="group" aria-label={t("historyRange")}>
        <span>{t("historyRange")}</span>
        {HISTORY_RANGES.map((option) => (
          <button
            key={option}
            className={range === option ? "active" : ""}
            onClick={() => onRangeChange(option)}
            aria-pressed={range === option}
          >
            {option}M
          </button>
        ))}
      </div>

      <div className="history-summary" aria-label={t("historicalRates")}>
        <div className="history-stat">
          <span>{t("latestRate")}</span>
          <strong>{formatSummary(summary.latest)}</strong>
        </div>
        <div className="history-stat">
          <span>{t("lowestRate")}</span>
          <strong>{formatSummary(summary.lowest)}</strong>
        </div>
        <div className="history-stat">
          <span>{t("highestRate")}</span>
          <strong>{formatSummary(summary.highest)}</strong>
        </div>
        <div className="history-stat">
          <span>{t("averageRate")}</span>
          <strong>{formatSummary(summary.average)}</strong>
        </div>
      </div>

      <div className="chart-wrap">
        {loading ? (
          <div className="chart-state" role="status">{t("loadingHistory")}</div>
        ) : rows.length ? (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="chart"
            role="img"
            aria-label={`Historical AZN to ${quote} rate chart, latest value ${latestRate === undefined ? "unavailable" : formatNumber(latestRate, language, { maximumFractionDigits: 4 })}`}
          >
            <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} className="axis" />
            <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} className="axis" />
            <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} className="grid-line" />
            <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} className="grid-line" />
            <text x={paddingLeft - 10} y={paddingTop + 4} textAnchor="end" className="chart-label">
              {formatNumber(max, language, { maximumFractionDigits: 4 })}
            </text>
            <text x={paddingLeft - 10} y={height - paddingBottom + 4} textAnchor="end" className="chart-label">
              {formatNumber(min, language, { maximumFractionDigits: 4 })}
            </text>
            <text x={paddingLeft} y={height - 10} className="chart-date-label">
              {formatMonth(firstDate)}
            </text>
            <text x={width - paddingRight} y={height - 10} textAnchor="end" className="chart-date-label">
              {formatMonth(lastDate)}
            </text>
            <polyline points={points} fill="none" className="chart-line" />
            {rows.map((row, index) => {
              const x = paddingLeft + (index / Math.max(rows.length - 1, 1)) * plotWidth;
              const y = paddingTop + (1 - (row.rate - min) / span) * plotHeight;
              return (
                <circle
                  key={row.date}
                  cx={x}
                  cy={y}
                  r="3.8"
                  className="chart-dot"
                  tabIndex={0}
                  aria-label={`${formatMonth(row.date)}: ${formatNumber(row.rate, language, { maximumFractionDigits: 4 })} ${CURRENCIES[quote].symbol} per AZN`}
                >
                  <title>
                    {formatMonth(row.date)}: {formatNumber(row.rate, language, { maximumFractionDigits: 4 })} {CURRENCIES[quote].symbol} per AZN
                  </title>
                </circle>
              );
            })}
          </svg>
        ) : (
          <div className="chart-state">{t("noHistory")}</div>
        )}
      </div>
    </section>
  );
}
