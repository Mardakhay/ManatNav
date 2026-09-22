import type { HistoricalRateRow, SupportedCurrency } from "../types/currency";
import { CURRENCIES } from "../types/currency";

interface HistoryChartProps {
  rows: HistoricalRateRow[];
  quote: SupportedCurrency;
  loading: boolean;
}

export function HistoryChart({ rows, quote, loading }: HistoryChartProps) {
  const width = 760;
  const height = 280;
  const paddingX = 28;
  const paddingY = 24;

  const values = rows.map((row) => row.rate);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const span = max - min || 1;

  const points = rows.map((row, index) => {
    const x = paddingX + (index / Math.max(rows.length - 1, 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((row.rate - min) / span) * (height - paddingY * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">HISTORY</div>
          <h2>AZN vs {quote}</h2>
          <p>Monthly reference rate over the last 12 months.</p>
        </div>

        <div className="legend-value">
          {rows.at(-1)?.rate?.toLocaleString("en-US", { maximumFractionDigits: 4 }) ?? "—"}
          <small>{CURRENCIES[quote].symbol} / AZN</small>
        </div>
      </div>

      <div className="chart-wrap">
        {loading ? (
          <div className="chart-state">Loading history…</div>
        ) : rows.length ? (
          <svg viewBox={`0 0 ${width} ${height}`} className="chart" role="img" aria-label={`Historical AZN to ${quote} rate`}>
            <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} className="axis" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} className="axis" />
            <polyline points={points} fill="none" className="chart-line" />
            {rows.map((row, index) => {
              const x = paddingX + (index / Math.max(rows.length - 1, 1)) * (width - paddingX * 2);
              const y = height - paddingY - ((row.rate - min) / span) * (height - paddingY * 2);
              return <circle key={row.date} cx={x} cy={y} r="3.8" className="chart-dot" />;
            })}
          </svg>
        ) : (
          <div className="chart-state">No historical data returned.</div>
        )}
      </div>
    </section>
  );
}
