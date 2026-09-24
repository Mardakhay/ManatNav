# ManatNav

AZN-focused currency and international-shopping dashboard built with React + TypeScript + Vite.

## What is included

- Live exchange rates with AZN as the base currency, covering USD, EUR, TRY, RUB, GBP, CNY, GEL, and AED
- Auto-refreshing rates (every 5 minutes and on tab refocus), plus a manual refresh button
- 14-day trend arrows and sparkline on each currency card
- Interactive currency converter between any two supported currencies
- Retailer presets (Custom, Trendyol, Amazon US, AliExpress, Taobao) with per-retailer default currency and shipping notes
- Quick-amount shortcuts for common order sizes
- Configurable shipping and service/proxy fee inputs
- Explicit product, shipping, fee, and total cost breakdown
- Saved basket with localStorage persistence, editing, duplication, multi-select removal, and CSV export
- Shareable calculation links via URL state, clipboard, and Web Share fallback
- 3-, 6-, and 12-month grouped historical chart with summary insights
- Official Azerbaijan customs reference links without invented duty calculations
- English and Azerbaijani interface with localized dates and numbers
- Light/dark theme with persistent preference
- Installable PWA with offline app-shell caching, install prompt, and update banner
- Keyboard shortcuts: `R` refresh, `S` swap currencies, `/` focus the amount field
- Loading, error, and refresh states, with last-known rates/history and explicit stale-data messaging when offline
- Responsive layout for desktop, tablet, and mobile
- Runtime validation for exchange-rate and saved-basket data
- Deterministic conversion, sharing, localization, history, trend, rate-cache, data-validation, and basket-export tests (8 test files)

## Stack

- React 19
- TypeScript
- Vite 7
- Lucide React
- Frankfurter v2 API
- Vitest

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Other scripts

```bash
npm run build         # type-check and build for production
npm run test          # run the Vitest suite
npm run test:browser  # basic browser accessibility check
```

## Product notes

- Rates are reference values from Frankfurter and may differ from card, bank, or retailer rates.
- Retailer shipping values are app defaults or estimates unless the listing provides a final amount.
- The customs panel is informational only and links to current official sources; it is not a legal or duty-rate calculator.
- No backend, account, or API secret is required for the current browser-only product.
2. Explore service-worker offline behavior after further product validation.
3. Add richer automated visual regression checks as the UI grows.
