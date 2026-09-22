# ManatNav

AZN-focused currency dashboard built with React + TypeScript + Vite.

## What is included

- Latest exchange rates with AZN as the base currency
- TRY / USD / EUR / RUB / GBP quick cards
- Interactive currency converter
- Retailer presets (Trendyol, Amazon US, AliExpress)
- Configurable shipping and service/proxy fee inputs
- Saved basket with localStorage persistence
- 12-month grouped historical chart
- Loading, error, and refresh states
- Responsive layout for desktop and mobile

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

## Next milestones

1. Add current Azerbaijan customs/duty rules only after verifying official sources.
2. Add URL/shareable calculation state.
3. Add tests for conversion logic and API parsing.
