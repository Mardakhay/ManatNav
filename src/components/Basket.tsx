import { Copy, Package, Trash2 } from "lucide-react";
import type { BasketItem } from "../types/basket";
import { CURRENCIES } from "../types/currency";
import { useLanguage } from "../contexts/LanguageContext";
import { formatNumber } from "../i18n/format";

interface BasketProps {
  items: BasketItem[];
  onRemove: (id: string) => void;
  onDuplicate: (item: BasketItem) => void;
  onClear: () => void;
}

export function Basket({ items, onRemove, onDuplicate, onClear }: BasketProps) {
  const { language, t } = useLanguage();
  const total = items.reduce((sum, item) => sum + item.convertedAmount, 0);

  return (
    <section className="panel accent-panel basket-panel" aria-label={t("basketTitle")}>
      <div className="panel-heading">
        <div>
          <div className="eyebrow">{t("savedBasket")}</div>
          <h2>{t("basketTitle")}</h2>
          <p>{t("basketDescription")}</p>
        </div>
        <div className="panel-icon" aria-hidden="true">
          <Package size={20} />
        </div>
      </div>

      <div className="basket-count" aria-live="polite">
        {items.length} {items.length === 1 ? t("savedItem") : t("savedItems")}
      </div>

      {items.length === 0 ? (
        <div className="basket-empty">
          {t("noItems")}
        </div>
      ) : (
        <>
          <ul className="basket-list">
            {items.map((item) => (
              <li key={item.id} className="basket-item">
                <div className="basket-item-info">
                  <strong>{item.label}</strong>
                  <span className="basket-item-detail">{t("product")}: {formatBasketAmount(item.amount, item.currency, language)}</span>
                  {item.shipping > 0 && (
                    <span className="basket-item-detail">{t("shipping")}: {formatBasketAmount(item.shipping, item.currency, language)}</span>
                  )}
                  {item.serviceFee !== undefined && item.serviceFee > 0 && (
                    <span className="basket-item-detail">{t("serviceFee")}: {formatBasketAmount(item.serviceFee, item.currency, language)}</span>
                  )}
                  <span className="basket-item-total">
                    {t("orderTotal")}: {formatBasketAmount(
                      item.amount + item.shipping + (item.serviceFee ?? 0),
                      item.currency,
                      language
                    )}
                  </span>
                </div>
                <div className="basket-item-right">
                  <strong>
                    {formatNumber(item.convertedAmount, language, { maximumFractionDigits: 2 })}{" "}
                    ₼
                  </strong>
                  <div className="basket-actions">
                    <button
                      className="icon-button duplicate-button"
                      aria-label={t("duplicate", { value: item.label })}
                      onClick={() => onDuplicate(item)}
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={t("remove", { value: item.label })}
                      onClick={() => onRemove(item.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="basket-total" aria-live="polite">
            <span>{t("totalEstimatedCost")}</span>
            <strong>
              {formatNumber(total, language, { maximumFractionDigits: 2 })} ₼
            </strong>
          </div>

          <button
            className="clear-basket-button"
            onClick={() => {
              if (window.confirm(t("confirmClearBasket"))) {
                onClear();
              }
            }}
          >
            {t("clearBasket")}
          </button>
        </>
      )}
    </section>
  );
}

function formatBasketAmount(
  amount: number,
  currency: BasketItem["currency"],
  language: "en" | "az"
): string {
  return `${formatNumber(amount, language, { maximumFractionDigits: 2 })} ${CURRENCIES[currency]?.symbol ?? currency}`;
}
