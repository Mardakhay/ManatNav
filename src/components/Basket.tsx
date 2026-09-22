import { Package, Trash2 } from "lucide-react";
import type { BasketItem } from "../types/basket";
import { CURRENCIES } from "../types/currency";

interface BasketProps {
  items: BasketItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function Basket({ items, onRemove, onClear }: BasketProps) {
  const total = items.reduce((sum, item) => sum + item.convertedAmount, 0);

  return (
    <section className="panel accent-panel basket-panel" aria-label="Shopping basket">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">SAVED BASKET</div>
          <h2>Your shopping basket</h2>
          <p>Saved calculations persist in your browser between visits.</p>
        </div>
        <div className="panel-icon" aria-hidden="true">
          <Package size={20} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="basket-empty">
          No items saved yet. Convert a price and save it to build your basket.
        </div>
      ) : (
        <>
          <ul className="basket-list">
            {items.map((item) => (
              <li key={item.id} className="basket-item">
                <div className="basket-item-info">
                  <strong>{item.label}</strong>
                  <span className="basket-item-detail">
                    {item.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
                    {CURRENCIES[item.currency]?.symbol ?? ""}
                    {item.shipping > 0 && ` + ${item.shipping.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${CURRENCIES[item.currency]?.symbol ?? ""}`}
                  </span>
                </div>
                <div className="basket-item-right">
                  <strong>
                    {item.convertedAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
                    ₼
                  </strong>
                  <button
                    className="icon-button"
                    aria-label={`Remove ${item.label}`}
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="basket-total">
            <span>Total estimated cost</span>
            <strong>
              {total.toLocaleString("en-US", { maximumFractionDigits: 2 })} ₼
            </strong>
          </div>

          <button
            className="clear-basket-button"
            onClick={() => {
              if (window.confirm("Remove all items from your basket?")) {
                onClear();
              }
            }}
          >
            Clear basket
          </button>
        </>
      )}
    </section>
  );
}
