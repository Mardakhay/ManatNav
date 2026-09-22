# ManatNav

AZN-focused currency dashboard built with React + TypeScript + Vite.

## What is included

- Latest exchange rates with AZN as the base currency
- TRY / USD / EUR / RUB / GBP quick cards
- Interactive currency converter
- Retailer presets (Trendyol, Amazon US, AliExpress)
- Configurable shipping and service/proxy fee inputs
- Explicit product, shipping, fee, and total cost breakdown
- Saved basket with localStorage persistence
- Shareable calculation links via URL state
- 12-month grouped historical chart with date and range labels
- Loading, error, and refresh states
- Responsive layout for desktop and mobile
- Runtime validation for exchange-rate and saved-basket data

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
- Customs and duty calculations are intentionally not included until current official Azerbaijan sources are verified.

## Next milestones

1. Add deterministic tests for conversion, API parsing, and localStorage validation.
2. Improve historical chart interaction with hover details and richer summaries.
3. Add verified Azerbaijan-specific customs guidance only after sourcing current official rules.
