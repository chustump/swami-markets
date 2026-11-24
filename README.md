# Swami Says

A prediction-markets site with a Swami who reacts as you scroll, an Ask Swami
flow, and a Kalshi edge scanner with a published backtest.

## Pages

- `/` — home (scroll scenes), Top 5, H2H, Ask and All tabs. `/?tab=ask` opens a tab directly.
- `/edge` — the Kalshi edge scanner: ranked list, detail view with chart, and the backtest.

## Edge scanner

Everything runs server side, in Netlify functions.

| Piece | What it does |
|---|---|
| `netlify/functions/edge-refresh-background.mjs` | Background function. Sweeps every open Kalshi market closing in the next 30 days (over 70,000, about a minute or two at Kalshi's public rate limit), scores the most-traded liquid ones and stores the ranked result in Netlify Blobs. |
| `netlify/functions/edge-refresh-cron.mjs` | Starts that refresh every 10 minutes on the published site. |
| `GET /api/kalshi/scan` | Serves the stored result. If it is missing or older than 20 minutes (first deploy, deploy previews, local dev) it asks for a refresh and answers with a quick partial scan of the soonest-closing markets, done inside the request. |
| `GET /api/kalshi/market/:ticker` | One market: 7-day chart, order book, recent trades, news. Cached about 3 minutes. |
| `GET /api/kalshi/backtest` | The stored backtest report. |

It is analysis only. The code uses Kalshi's public, unauthenticated market-data
endpoints; there is no order placement and no Kalshi account key anywhere.

**Model** (`src/lib/kalshi/model.js`). The market price is the starting point. A
logistic model adjusts it using the price level, the 24-hour trend, 6-hour
momentum and whether the trend came with a volume surge. Order book lean and
news tone are small extra nudges in the live scanner only. Edge is the model's
probability minus the price you would pay (the ask for YES, 1 − bid for NO)
minus Kalshi's standard taker fee of 7% × price × (1 − price).

**Backtest** (`npm run backtest`). Pulls settled markets from the last ~50 days,
scores each once at a fixed time after it opened using only data available
then, fits on the earlier 60% and reports Brier score, calibration and profit
after fees on the later 40%. It rewrites `src/data/model.js` (the live weights)
and `src/data/backtest.json` (the numbers shown on `/edge`). Rerun it and
commit the two files to refresh them; it takes roughly 15 minutes. Behind a
proxy, run it with `NODE_USE_ENV_PROXY=1`.

## Environment variables (all optional except the first)

| Variable | Used by | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Ask Swami, H2H analysis, tunnel | Required for those features. |
| `XAI_API_KEY`, `MUSE_API_KEY` | `/api/tunnel` | Optional extra models. |
| `NEWS_FEED_URL` | Edge scanner news | RSS search URL with `{q}` where the query goes. Defaults to Google News RSS. |
| `KALSHI_CACHE_SECONDS` | Edge scanner | CDN cache lifetime for scan results. Default 300. |
| `SCAN_BUDGET_MS` | Edge scanner | Time allowed for the in-request fallback scan. Default 8000, which fits Netlify's 10-second function limit. |
| `KALSHI_API_BASE` | Edge scanner | Default `https://api.elections.kalshi.com/trade-api/v2`. |

## Develop

```
npm install
npm run dev
npm test
```
