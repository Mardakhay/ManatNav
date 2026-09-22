# ManatNav

AZN-focused currency dashboard built with React + TypeScript + Vite.

## What is included

- Latest exchange rates with AZN as the base currency
- TRY / USD / EUR / RUB / GBP quick cards
- Interactive currency converter
- Retailer presets (Trendyol, Amazon US, AliExpress)
- Configurable shipping and service/proxy fee inputs
- Explicit product, shipping, fee, and total cost breakdown
- Saved basket with localStorage persistence, duplication, and editing
- Shareable calculation links via URL state, clipboard, and Web Share fallback
- 3-, 6-, and 12-month grouped historical chart with summary insights
- English and Azerbaijani interface with localized dates and numbers
- Light/dark theme with persistent preference
- Installable PWA manifest for supported browsers
- Official Azerbaijan customs reference links without invented duty calculations
- Loading, error, and refresh states
- Last-known latest and historical rates with explicit stale-data messaging
- Responsive layout for desktop, tablet, and mobile
- Runtime validation for exchange-rate and saved-basket data
- Deterministic conversion, sharing, localization, history, API, and data-validation tests

## Stack

- React
- TypeScript
- Vite
- Lucide React
- Frankfurter v2 API

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Product notes

- Rates are reference values from Frankfurter and may differ from card, bank, or retailer rates.
- Retailer shipping values are app defaults or estimates unless the listing provides a final amount.
- The customs panel is informational only and links to current official sources; it is not a legal or duty-rate calculator.
- No backend, account, or API secret is required for the current browser-only product.

## Next milestones

1. Add sourced retailer metadata without inventing retailer policies.
2. Explore service-worker offline behavior after further product validation.
3. Add richer automated visual regression checks as the UI grows.
