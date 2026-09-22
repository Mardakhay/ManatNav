import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { useLanguage } from "./contexts/LanguageContext";
import { CustomsGuide } from "./components/CustomsGuide";
import { formatDate } from "./i18n/format";

type Theme = "light" | "dark";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function App() {
  const { language, t } = useLanguage();
  const [baseCurrency] = useState<SupportedCurrency>("AZN");
  const dashboard = useCurrencyDashboard(baseCurrency);
  const [theme, setTheme] = useLocalStorage<Theme>("manatnav:theme", "light", isTheme);
  const [basket, setBasket, resetBasket] = useLocalStorage<BasketItem[]>(
    BASKET_STORAGE_KEY,
    [],
    (value): value is BasketItem[] =>
      Array.isArray(value) && value.every(isBasketItem)
  );
  const [editingItem, setEditingItem] = useState<BasketItem | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const ratesMap = useMemo(
    () =>
      Object.fromEntries(
        dashboard.rates.map((row) => [row.quote, row.rate])
      ),
    [dashboard.rates]
  );

  function saveBasketItem(item: BasketItem, replacingId?: string) {
    setBasket((prev) =>
      replacingId
        ? prev.map((savedItem) => savedItem.id === replacingId ? item : savedItem)
        : [...prev, item]
    );
    setEditingItem(null);
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

  function editBasketItem(item: BasketItem) {
    setEditingItem(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <Header
        lastUpdated={dashboard.lastUpdated}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
      />

      <main className="page">
        <section className="hero">
          <div>
            <div className="eyebrow">{t("heroEyebrow")}</div>
            <h1>{t("heroTitle")}</h1>
            <p>
              {t("heroDescription")}
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={() => void dashboard.refresh()}
            disabled={dashboard.loading}
            aria-label={t("refresh")}
          >
            <RefreshCw size={17} className={dashboard.loading ? "spin" : ""} />
            {t("refresh")}
          </button>
        </section>

        {dashboard.error && (
          <div className="error-banner" role="alert">
            {dashboard.error} {t("updatedCheckConnection")}
          </div>
        )}

        {dashboard.ratesStale && dashboard.ratesCachedAt && (
          <div className="stale-banner" role="status">
            {t("cachedRates", { value: formatDate(dashboard.ratesCachedAt, language) })}
          </div>
        )}

        <section className="section-block">
          <div className="section-title-row">
            <div>
              <div className="eyebrow">{t("liveSnapshot")}</div>
              <h2>{t("majorCurrencies")}</h2>
            </div>
            <span className="section-meta">{t("base")}</span>
          </div>

          <div className="rates-grid">
            {dashboard.loading
              ? ["USD", "EUR", "TRY", "RUB", "GBP"].map((code) => (
                  <div className="rate-card skeleton-card" key={code} aria-hidden="true" />
                ))
              : dashboard.rates.length === 0 && !dashboard.error
                ? <div className="chart-state" style={{ gridColumn: "1 / -1" }}>{t("noRateData")}</div>
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
          <Converter
            rates={ratesMap}
            onSaveToBasket={saveBasketItem}
            editingItem={editingItem}
            onCancelEdit={() => setEditingItem(null)}
          />
          <Basket
            items={basket}
            onRemove={removeFromBasket}
            onEdit={editBasketItem}
            onDuplicate={duplicateBasketItem}
            onClear={resetBasket}
          />
        </section>

        <HistoryChart
          rows={dashboard.history}
          quote={dashboard.selectedHistoryQuote}
          loading={dashboard.historyLoading}
          range={dashboard.historyRange}
          onRangeChange={dashboard.setHistoryRange}
        />

        <CustomsGuide />

        {dashboard.historyError && (
          <div className="muted-note history-note" role="alert">
            {dashboard.historyError} {t("updatedCheckConnection")}
          </div>
        )}

        <footer className="footer">
          <span>ManatNav — {CURRENCIES[baseCurrency].name} dashboard</span>
          <span>{t("footerRates")}</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
