import { Copy, Download, Package, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { BasketItem } from "../types/basket";
import { CURRENCIES } from "../types/currency";
import { useLanguage } from "../contexts/LanguageContext";
import { formatNumber } from "../i18n/format";

interface BasketProps {
  items: BasketItem[];
  onRemove: (id: string) => void;
  onRemoveMany: (ids: string[]) => void;
  onEdit: (item: BasketItem) => void;
  onDuplicate: (item: BasketItem) => void;
  onClear: () => void;
  onExport: () => void;
}

export function Basket({ items, onRemove, onRemoveMany, onEdit, onDuplicate, onClear, onExport }: BasketProps) {
  const { language, t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const total = items.reduce((sum, item) => sum + item.convertedAmount, 0);
  const selectedCount = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)).length,
    [items, selectedIds]
  );
  const allSelected = items.length > 0 && selectedCount === items.length;

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((item) => item.id)));
  }

  function removeSelected() {
    onRemoveMany(Array.from(selectedIds));
    setSelectedIds(new Set());
  }

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

      {items.length > 0 && (
        <div className="basket-bulk-toolbar">
          <label className="basket-select-all">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            {t("selectAll")}
          </label>
          {selectedCount > 0 && (
            <>
              <span className="basket-selected-count">{t("selectedCount", { value: selectedCount })}</span>
              <button className="basket-text-button" onClick={() => setSelectedIds(new Set())}>
                {t("clearSelection")}
              </button>
              <button className="basket-remove-selected" onClick={removeSelected}>
                <Trash2 size={14} />
                {t("removeSelected")}
              </button>
            </>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="basket-empty">
          {t("noItems")}
        </div>
      ) : (
        <>
          <ul className="basket-list">
            {items.map((item) => (
              <li key={item.id} className="basket-item">
                <label className="basket-item-select">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelected(item.id)}
                    aria-label={t("selectItem", { value: item.label })}
                  />
                </label>
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
                      className="icon-button edit-button"
                      aria-label={t("edit", { value: item.label })}
                      onClick={() => onEdit(item)}
                    >
                      <Pencil size={15} />
                    </button>
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

          <div className="basket-footer-actions">
            <button className="export-basket-button" onClick={onExport}>
              <Download size={14} />
              {t("exportBasket")}
            </button>
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
          </div>
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
