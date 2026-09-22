import { RefreshCw, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Converter } from "./components/Converter";
import { Header } from "./components/Header";
import { HistoryChart } from "./components/HistoryChart";
import { RateCard } from "./components/RateCard";
import { useCurrencyDashboard } from "./hooks/useCurrencyDashboard";
import type { SupportedCurrency } from "./types/currency";
import { CURRENCIES } from "./types/currency";

function App() {
  const [baseCurrency] = useState<SupportedCurrency>("AZN");
  const dashboard = useCurrencyDashboard(baseCurrency);

  const ratesMap = useMemo(
    () =>
      Object.fromEntries(
        dashboard.rates.map((row) => [row.quote, row.rate])
      ),
    [dashboard.rates]
  );

  return (
    <div className="app-shell">
      <Header lastUpdated={dashboard.lastUpdated} />

      <main className="page">
        <section className="hero">
          <div>
            <div className="eyebrow">AZERBAIJAN · CURRENCY INTELLIGENCE</div>
            <h1>Your money, translated.</h1>
            <p>
              Track what the Azerbaijani manat is worth abroad, convert shopping
              prices, and watch monthly currency trends from one dashboard.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={() => void dashboard.refresh()}
            disabled={dashboard.loading}
          >
            <RefreshCw size={17} className={dashboard.loading ? "spin" : ""} />
            Refresh
          </button>
        </section>

        {dashboard.error && (
          <div className="error-banner">
            {dashboard.error} Check your connection and try again.
          </div>
        )}

        <section className="section-block">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">LIVE SNAPSHOT</div>
              <h2>1 AZN in major currencies</h2>
            </div>
            <span className="section-meta">Base: AZN ₼</span>
          </div>

          <div className="rates-grid">
            {dashboard.loading
              ? ["USD", "EUR", "TRY", "RUB", "GBP"].map((code) => (
                  <div className="rate-card skeleton-card" key={code} />
                ))
              : dashboard.rates.map((row) => (
                  <RateCard
                    key={row.quote}
                    currency={row.quote as SupportedCurrency}
                    rate={row.rate}
                    active={dashboard.selectedHistoryQuote === row.quote}
                    onClick={() =>
                      dashboard.setSelectedHistoryQuote(
                        row.quote as SupportedCurrency
                      )
                    }
                  />
                ))}
          </div>
        </section>

        <section className="two-column">
          <Converter rates={ratesMap} />

          <section className="panel accent-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">PORTFOLIO IDEA</div>
                <h2>Built for local shopping</h2>
                <p>
                  This panel is intentionally simple for the first milestone.
                  Later we can add customs thresholds, delivery fees, saved
                  baskets, and retailer presets.
                </p>
              </div>
              <TrendingUp size={22} />
            </div>

            <div className="mini-stats">
              <div>
                <span>Selected pair</span>
                <strong>AZN / {dashboard.selectedHistoryQuote}</strong>
              </div>
              <div>
                <span>Tracked currency</span>
                <strong>{CURRENCIES[dashboard.selectedHistoryQuote].name}</strong>
              </div>
            </div>
          </section>
        </section>

        <HistoryChart
          rows={dashboard.history}
          quote={dashboard.selectedHistoryQuote}
          loading={dashboard.historyLoading}
        />

        {dashboard.historyError && (
          <div className="muted-note history-note">{dashboard.historyError}</div>
        )}
      </main>
    </div>
  );
}

export default App;
