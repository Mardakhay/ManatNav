import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Basket } from "./components/Basket";
import { Converter } from "./components/Converter";
import { Header } from "./components/Header";
import { HistoryChart } from "./components/HistoryChart";
import { RateCard } from "./components/RateCard";
import { useCurrencyDashboard } from "./hooks/useCurrencyDashboard";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { BasketItem } from "./types/basket";
import { BASKET_STORAGE_KEY, isBasketItem } from "./types/basket";
import type { SupportedCurrency } from "./types/currency";
import { CURRENCIES } from "./types/currency";

function App() {
  const [baseCurrency] = useState<SupportedCurrency>("AZN");
  const dashboard = useCurrencyDashboard(baseCurrency);
  const [basket, setBasket, resetBasket] = useLocalStorage<BasketItem[]>(
    BASKET_STORAGE_KEY,
    [],
    (value): value is BasketItem[] =>
      Array.isArray(value) && value.every(isBasketItem)
  );

  const ratesMap = useMemo(
    () =>
      Object.fromEntries(
        dashboard.rates.map((row) => [row.quote, row.rate])
      ),
    [dashboard.rates]
  );

  function addToBasket(item: BasketItem) {
    setBasket((prev) => [...prev, item]);
  }

  function removeFromBasket(id: string) {
    setBasket((prev) => prev.filter((item) => item.id !== id));
  }

  function duplicateBasketItem(item: BasketItem) {
    setBasket((prev) => [
      ...prev,
      { ...item, id: crypto.randomUUID(), createdAt: Date.now() },
    ]);
  }

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
            aria-label="Refresh exchange rates"
          >
            <RefreshCw size={17} className={dashboard.loading ? "spin" : ""} />
            Refresh
          </button>
        </section>

        {dashboard.error && (
          <div className="error-banner" role="alert">
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
                  <div className="rate-card skeleton-card" key={code} aria-hidden="true" />
                ))
              : dashboard.rates.length === 0 && !dashboard.error
                ? <div className="chart-state" style={{ gridColumn: "1 / -1" }}>No rate data available right now.</div>
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
          <Converter rates={ratesMap} onSaveToBasket={addToBasket} />
          <Basket
            items={basket}
            onRemove={removeFromBasket}
            onDuplicate={duplicateBasketItem}
            onClear={resetBasket}
          />
        </section>

        <HistoryChart
          rows={dashboard.history}
          quote={dashboard.selectedHistoryQuote}
          loading={dashboard.historyLoading}
        />

        {dashboard.historyError && (
          <div className="muted-note history-note" role="alert">
            {dashboard.historyError}
          </div>
        )}

        <footer className="footer">
          <span>ManatNav — {CURRENCIES[baseCurrency].name} dashboard</span>
          <span>Reference rates from Frankfurter · Not financial advice</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
