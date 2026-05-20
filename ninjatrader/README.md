# SwamiBot — NinjaTrader 8 Trading Bot

A trend-pullback automated strategy for NinjaTrader 8, written in NinjaScript (C#).
It stacks multiple confluence filters (trend, momentum, volatility, session) and
enforces strict risk management.

## Honest expectations

**No strategy can guarantee an 80% win rate over time.** Anyone telling you
otherwise is selling something. Win rate is a function of how tight your
take-profit is relative to your stop-loss — you can engineer a high hit rate by
making TP small vs SL, but that lowers expectancy per trade and one loss can
erase several wins. What actually matters is *expectancy* (avg_win × win_rate −
avg_loss × loss_rate) and *max drawdown*.

SwamiBot is configured by default with `TakeProfitAtrMult = 0.75` and
`StopLossAtrMult = 1.5` (TP is half of SL). On a well-trending instrument and
session that historically pushes win rate toward 65-75%. To target a higher win
rate, lower `TakeProfitAtrMult` further (e.g. 0.4) — but always validate with
backtests on multiple market regimes before going live.

## What the bot does

1. **Trend filter** — three EMAs (9 / 21 / 50) must be stacked in the trade
   direction, and price must be on the right side of the 50 EMA.
2. **Strength filter** — ADX(14) must be ≥ 20 (no chop).
3. **Entry trigger** — RSI(14) pulls back inside the trend and turns back in
   the trend direction (mean-reversion in trend).
4. **Stop / target** — both sized in ATR multiples (volatility-adaptive).
5. **Breakeven move** — stop moves to entry once price runs `0.4 × ATR` in
   profit, eliminating loss on most winners that retrace.
6. **Daily limits** — max trades per day, max daily loss in USD, session
   window. Anything outside the session is skipped; once daily loss is hit,
   the bot stops trading until tomorrow.

## Installation

1. In NinjaTrader 8: **Tools → Import → NinjaScript Add-On…**
   *or* manually copy `Strategies/SwamiBot.cs` into:
   ```
   Documents\NinjaTrader 8\bin\Custom\Strategies\
   ```
2. **Tools → Edit NinjaScript → Strategy** → right-click → **Compile** (F5).
   Fix any red errors before continuing.
3. Open a chart of the instrument you want to trade (recommend liquid futures:
   `ES`, `NQ`, `MES`, `MNQ`, `CL`, or FX majors). Choose a timeframe — 5-minute
   is a good starting point for futures intraday.
4. **Right-click chart → Strategies → SwamiBot → enable**.
5. Set parameters, then run in the **Strategy Analyzer** first (backtest) and
   in **Sim101** (paper account) before going live.

## How to optimize for higher win rate

In Strategy Analyzer → **Optimize**, tune these in this order:

| Parameter            | Range to sweep        | Effect                                |
|----------------------|-----------------------|---------------------------------------|
| `TakeProfitAtrMult`  | 0.3 → 1.0 step 0.1    | Lower = higher win rate, lower RR     |
| `StopLossAtrMult`    | 1.0 → 3.0 step 0.25   | Higher = fewer stop-outs, bigger loss |
| `AdxMin`             | 15 → 30 step 5        | Higher = only strong trends           |
| `RsiLongPullback`    | 35 → 50 step 5        | Lower = deeper pullbacks (fewer/better)|
| `RsiShortPullback`   | 50 → 65 step 5        | Mirror of above                       |
| `StartHour/Minute` and `EndHour/Minute` | Restrict to e.g. 09:35–11:30 | Avoids lunch chop |

Optimize on roughly 60% of your historical data, then **walk-forward test** on
the remaining 40% to avoid overfitting. A strategy that looks great in-sample
but blows up out-of-sample is the #1 retail-algo failure mode.

## Going live safely

1. Backtest ≥ 6 months on the chart's primary instrument.
2. Walk-forward test on data the optimizer didn't see.
3. Run on **Sim101** for at least two weeks of live market hours.
4. Start live with the minimum contract size (e.g. `MES` micro instead of `ES`).
5. Keep `MaxDailyLossUsd` conservative — it's the only thing that prevents a
   bad market regime from blowing your account.

## Roadmap

- News-time blackout window
- Multi-timeframe trend confirmation (e.g. 1h trend filter on a 5m chart)
- Volume profile / VWAP entry refinement
- Discord/email alerts on entry/exit
- Performance dashboard in the existing Next.js app
