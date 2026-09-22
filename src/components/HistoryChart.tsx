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

  const latestRate = rows.at(-1)?.rate;
  const firstDate = rows[0]?.date;
  const lastDate = rows.at(-1)?.date;

  function formatMonth(date: string | undefined): string {
    if (!date) return "—";

    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? date
      : parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  return (
    <section className="panel" aria-label="Historical exchange rates">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">HISTORY</div>
          <h2>AZN vs {quote}</h2>
          <p>Monthly reference rate over the last 12 months.</p>
        </div>

        <div className="legend-value">
          {latestRate !== undefined
            ? latestRate.toLocaleString("en-US", { maximumFractionDigits: 4 })
            : "—"}
          <small>{CURRENCIES[quote].symbol} / AZN</small>
        </div>
      </div>

      <div className="chart-wrap">
        {loading ? (
          <div className="chart-state" role="status">Loading history…</div>
        ) : rows.length ? (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="chart"
            role="img"
            aria-label={`Historical AZN to ${quote} rate chart, latest value ${latestRate?.toLocaleString("en-US", { maximumFractionDigits: 4 }) ?? "unavailable"}`}
          >
            <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} className="axis" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} className="axis" />
            <text x={paddingX} y={paddingY - 8} className="chart-label">
              {max.toLocaleString("en-US", { maximumFractionDigits: 4 })}
            </text>
            <text x={paddingX} y={height - paddingY - 8} className="chart-label">
              {min.toLocaleString("en-US", { maximumFractionDigits: 4 })}
            </text>
            <text x={paddingX} y={height - 7} className="chart-date-label">
              {formatMonth(firstDate)}
            </text>
            <text x={width - paddingX} y={height - 7} textAnchor="end" className="chart-date-label">
              {formatMonth(lastDate)}
            </text>
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
