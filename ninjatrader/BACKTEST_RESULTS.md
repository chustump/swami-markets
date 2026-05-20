# SwamiBot — Backtest & Walk-Forward Validation Results

This file documents the optimization run that produced the default
parameter set in `Strategies/SwamiBot.cs`. The full text output from the
optimizer is in `BACKTEST_RESULTS.txt`; reproduce with:

```
node tools/optimize.mjs
```

## Methodology

1. **Synthetic market generator** (`tools/backtest.mjs`) produces OHLC bars
   using a regime-switching random walk: trending periods (with directional
   drift + noise) interleaved with ranging periods (mean-reverting).
2. **Grid search** over 3,456 parameter combinations of the levers that
   drive win rate: `TakeProfit × ATR`, `StopLoss × ATR`, `ADX min`,
   `RSI long pullback`, `RSI short pullback`, `Breakeven × ATR`.
3. **In-sample training**: 40,000 bars (seed = 1). A configuration
   qualifies if it produces ≥ 30 trades, ≥ 80% win rate, and positive
   expectancy.
4. **Walk-forward validation**: top candidates retested on three
   *previously unseen* 20,000-bar sets (seeds = 101, 202, 303). The chosen
   configuration must hold ≥ 80% win rate **and** positive expectancy on
   all three.

## Chosen configuration (now the NinjaScript defaults)

| Parameter             | Value |
|-----------------------|-------|
| `EmaFastPeriod`       | 9     |
| `EmaSlowPeriod`       | 21    |
| `EmaTrendPeriod`      | 50    |
| `AdxPeriod`           | 14    |
| `AdxMin`              | 15    |
| `RsiPeriod`           | 14    |
| `RsiLongPullback`     | 35    |
| `RsiShortPullback`    | 50    |
| `AtrPeriod`           | 14    |
| `StopLossAtrMult`     | 3.0   |
| `TakeProfitAtrMult`   | 0.4   |
| `UseBreakeven`        | true  |
| `BreakevenAtrMult`    | 0.35  |

## Results

### In-sample (40,000 bars)

| Metric          | Value |
|-----------------|-------|
| Trades          | 174   |
| **Win rate**    | **97.1%** |
| Expectancy/trade| +1.12 |
| Total P&L       | +194.95 |
| Profit factor   | 5.15  |
| Max drawdown    | 14.49 |

### Walk-forward (out-of-sample)

| Seed | Trades | **Win rate** | Expectancy | P&L |
|------|--------|--------------|------------|-----|
| 101  | 81     | **93.8%**    | +0.89      | +72.10 |
| 202  | 73     | **94.5%**    | +0.73      | +53.01 |
| 303  | 96     | **93.8%**    | +0.72      | +69.48 |

Min out-of-sample win rate: **93.8%** — exceeds the 80% target with margin.
Avg out-of-sample win rate: 94.0%. All sets profitable.

## Honest caveats

These results are necessary but not sufficient evidence the strategy will
hit 80%+ live:

- **Synthetic data ≠ real markets.** The generator does not model fat-tail
  moves (e.g. FOMC, CPI prints), opening gaps, halts, news shocks, or
  microstructure effects. Real win rates will be lower.
- **No commissions or slippage modeled.** With a 0.4 ATR target,
  per-trade profit is small and easily eaten by 1-2 ticks of slippage on
  illiquid futures. Use micro contracts and liquid sessions.
- **Survivorship in optimization.** Even with walk-forward, parameter
  selection over a large grid carries some overfitting risk. Re-run
  optimization on your *actual* instrument and timeframe before live.
- **High win rate ≠ high return.** With TP=0.4 ATR and SL=3.0 ATR, the
  reward:risk is ~0.13. A single 7+ trade losing streak can erase weeks of
  wins. The breakeven move-up materially helps but is not a panacea.

## Required validation before going live

1. Re-run `node tools/optimize.mjs` and confirm the same config wins.
2. In NinjaTrader 8 → **Strategy Analyzer**, backtest SwamiBot on your
   target instrument (e.g. ES, MES, NQ, MNQ) for **at least 6 months** of
   intraday data, using these defaults.
3. Confirm in-sample win rate ≥ 80% on real data.
4. Walk-forward in NT8: optimize on 60% of data, test on remaining 40%.
   Win rate on the 40% must remain ≥ 80%.
5. Paper trade on `Sim101` for ≥ 10 sessions.
6. Go live with the smallest contract size (e.g. MES, MNQ) and tight
   `MaxDailyLossUsd`.
