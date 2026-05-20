// SwamiBot backtester — JavaScript port of the NinjaScript strategy.
// Runs the same entry/exit logic against synthetic OHLC bars so we can
// search for a parameter set that achieves ≥80% win rate with positive
// expectancy before deploying to NinjaTrader.

// ---- Synthetic price generator ----------------------------------------------
// Regime-switching random walk: trending periods (with drift) interleaved
// with ranging periods (mean reverting). Each bar has realistic OHLC with
// intra-bar excursion drawn from the volatility.
export function generateBars({ n = 50000, seed = 1, startPrice = 5000 } = {}) {
	const rng = mulberry32(seed);
	const bars = [];
	let price = startPrice;
	let regime = "trend";
	let drift = 0;
	let vol = 1.5;
	let regimeBarsLeft = 0;

	for (let i = 0; i < n; i++) {
		if (regimeBarsLeft <= 0) {
			regime = rng() < 0.6 ? "trend" : "range";
			if (regime === "trend") {
				drift = (rng() - 0.5) * 0.25;
				vol = 1.0 + rng() * 1.5;
				regimeBarsLeft = 80 + Math.floor(rng() * 200);
			} else {
				drift = 0;
				vol = 0.6 + rng() * 0.8;
				regimeBarsLeft = 40 + Math.floor(rng() * 100);
			}
		}
		regimeBarsLeft--;

		// Close moves by drift + gaussian noise scaled by vol
		const delta = drift + gauss(rng) * vol;
		const open = price;
		const close = price + delta;
		const excursion = Math.abs(gauss(rng)) * vol * 0.8 + 0.2;
		const high = Math.max(open, close) + excursion;
		const low = Math.min(open, close) - excursion;
		bars.push({ o: open, h: high, l: low, c: close, t: i });
		price = close;
		if (price < 100) price = 100;
	}
	return bars;
}

function mulberry32(a) {
	return function () {
		a |= 0; a = a + 0x6D2B79F5 | 0;
		let t = a;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}

function gauss(rng) {
	// Box-Muller
	let u = 0, v = 0;
	while (u === 0) u = rng();
	while (v === 0) v = rng();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ---- Indicators -------------------------------------------------------------
export function emaSeries(values, period) {
	const out = new Array(values.length).fill(NaN);
	const k = 2 / (period + 1);
	let prev = values[0];
	out[0] = prev;
	for (let i = 1; i < values.length; i++) {
		prev = values[i] * k + prev * (1 - k);
		out[i] = prev;
	}
	return out;
}

export function rsiSeries(values, period) {
	const out = new Array(values.length).fill(NaN);
	let avgGain = 0, avgLoss = 0;
	for (let i = 1; i <= period; i++) {
		const d = values[i] - values[i - 1];
		if (d >= 0) avgGain += d; else avgLoss -= d;
	}
	avgGain /= period; avgLoss /= period;
	out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
	for (let i = period + 1; i < values.length; i++) {
		const d = values[i] - values[i - 1];
		const g = d > 0 ? d : 0;
		const l = d < 0 ? -d : 0;
		avgGain = (avgGain * (period - 1) + g) / period;
		avgLoss = (avgLoss * (period - 1) + l) / period;
		out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
	}
	return out;
}

export function atrSeries(bars, period) {
	const out = new Array(bars.length).fill(NaN);
	const trs = new Array(bars.length).fill(0);
	for (let i = 1; i < bars.length; i++) {
		const b = bars[i], p = bars[i - 1];
		trs[i] = Math.max(b.h - b.l, Math.abs(b.h - p.c), Math.abs(b.l - p.c));
	}
	let sum = 0;
	for (let i = 1; i <= period; i++) sum += trs[i];
	out[period] = sum / period;
	for (let i = period + 1; i < bars.length; i++) {
		out[i] = (out[i - 1] * (period - 1) + trs[i]) / period;
	}
	return out;
}

export function adxSeries(bars, period) {
	const out = new Array(bars.length).fill(NaN);
	const plusDM = new Array(bars.length).fill(0);
	const minusDM = new Array(bars.length).fill(0);
	const trs = new Array(bars.length).fill(0);
	for (let i = 1; i < bars.length; i++) {
		const up = bars[i].h - bars[i - 1].h;
		const dn = bars[i - 1].l - bars[i].l;
		plusDM[i] = up > dn && up > 0 ? up : 0;
		minusDM[i] = dn > up && dn > 0 ? dn : 0;
		trs[i] = Math.max(bars[i].h - bars[i].l, Math.abs(bars[i].h - bars[i - 1].c), Math.abs(bars[i].l - bars[i - 1].c));
	}
	// Wilder smoothing
	let trSum = 0, pSum = 0, mSum = 0;
	for (let i = 1; i <= period; i++) { trSum += trs[i]; pSum += plusDM[i]; mSum += minusDM[i]; }
	const dxs = new Array(bars.length).fill(NaN);
	const pDI = pSum / trSum * 100;
	const mDI = mSum / trSum * 100;
	dxs[period] = Math.abs(pDI - mDI) / (pDI + mDI || 1) * 100;
	for (let i = period + 1; i < bars.length; i++) {
		trSum = trSum - trSum / period + trs[i];
		pSum = pSum - pSum / period + plusDM[i];
		mSum = mSum - mSum / period + minusDM[i];
		const p = pSum / trSum * 100;
		const m = mSum / trSum * 100;
		dxs[i] = Math.abs(p - m) / (p + m || 1) * 100;
	}
	// ADX = smoothed DX
	let adxStart = period * 2;
	if (adxStart >= bars.length) return out;
	let sum = 0;
	for (let i = period + 1; i <= adxStart; i++) sum += dxs[i];
	out[adxStart] = sum / period;
	for (let i = adxStart + 1; i < bars.length; i++) {
		out[i] = (out[i - 1] * (period - 1) + dxs[i]) / period;
	}
	return out;
}

// ---- Strategy ---------------------------------------------------------------
// Mirrors SwamiBot.cs: trend-stack via 3 EMAs, ADX strength filter,
// RSI pullback turning, ATR-based SL/TP, optional breakeven move.
export function runStrategy(bars, params) {
	const closes = bars.map(b => b.c);
	const ef = emaSeries(closes, params.emaFast);
	const es = emaSeries(closes, params.emaSlow);
	const et = emaSeries(closes, params.emaTrend);
	const rsi = rsiSeries(closes, params.rsiPeriod);
	const atr = atrSeries(bars, params.atrPeriod);
	const adx = adxSeries(bars, params.adxPeriod);

	const trades = [];
	let pos = null; // { dir, entry, sl, tp, beMoved }
	let equity = params.startCapital || 10000;
	let peak = equity, maxDD = 0;
	const equityCurve = [equity];

	for (let i = Math.max(params.emaTrend, params.adxPeriod * 2, params.atrPeriod, params.rsiPeriod) + 1; i < bars.length; i++) {
		const bar = bars[i];

		// Check exits first using current bar's high/low range
		if (pos) {
			let exitPrice = null, reason = null;
			if (pos.dir === 1) {
				const hitSL = bar.l <= pos.sl;
				const hitTP = bar.h >= pos.tp;
				if (hitSL && hitTP) { exitPrice = pos.sl; reason = "SL"; } // worst-case assumption
				else if (hitSL) { exitPrice = pos.sl; reason = "SL"; }
				else if (hitTP) { exitPrice = pos.tp; reason = "TP"; }
			} else {
				const hitSL = bar.h >= pos.sl;
				const hitTP = bar.l <= pos.tp;
				if (hitSL && hitTP) { exitPrice = pos.sl; reason = "SL"; }
				else if (hitSL) { exitPrice = pos.sl; reason = "SL"; }
				else if (hitTP) { exitPrice = pos.tp; reason = "TP"; }
			}
			if (exitPrice !== null) {
				const pnl = (exitPrice - pos.entry) * pos.dir * params.qty;
				equity += pnl;
				peak = Math.max(peak, equity);
				maxDD = Math.max(maxDD, peak - equity);
				trades.push({ pnl, reason, win: pnl > 0 });
				pos = null;
				equityCurve.push(equity);
				continue;
			}
			// Breakeven move
			if (params.useBreakeven && !pos.beMoved) {
				const moved = (bar.c - pos.entry) * pos.dir;
				if (moved >= params.beTrigger * pos.atrAtEntry) {
					pos.sl = pos.entry;
					pos.beMoved = true;
				}
			}
		}

		// Entry signals
		if (!pos && !isNaN(ef[i]) && !isNaN(et[i]) && !isNaN(adx[i]) && !isNaN(atr[i])) {
			const uptrend = ef[i] > es[i] && es[i] > et[i] && bar.c > et[i];
			const downtrend = ef[i] < es[i] && es[i] < et[i] && bar.c < et[i];
			const trending = adx[i] >= params.adxMin;
			const longPull = rsi[i] < params.rsiLongPullback && rsi[i] > rsi[i - 1];
			const shortPull = rsi[i] > params.rsiShortPullback && rsi[i] < rsi[i - 1];
			const a = atr[i];
			if (a > 0 && trending) {
				if (uptrend && longPull) {
					pos = {
						dir: 1, entry: bar.c, atrAtEntry: a,
						sl: bar.c - params.slAtr * a,
						tp: bar.c + params.tpAtr * a,
						beMoved: false,
					};
				} else if (downtrend && shortPull) {
					pos = {
						dir: -1, entry: bar.c, atrAtEntry: a,
						sl: bar.c + params.slAtr * a,
						tp: bar.c - params.tpAtr * a,
						beMoved: false,
					};
				}
			}
		}
	}

	const wins = trades.filter(t => t.win).length;
	const losses = trades.length - wins;
	const winRate = trades.length ? wins / trades.length : 0;
	const totalPnL = trades.reduce((s, t) => s + t.pnl, 0);
	const avgWin = wins ? trades.filter(t => t.win).reduce((s, t) => s + t.pnl, 0) / wins : 0;
	const avgLoss = losses ? trades.filter(t => !t.win).reduce((s, t) => s + t.pnl, 0) / losses : 0;
	const expectancy = trades.length ? totalPnL / trades.length : 0;
	const profitFactor = avgLoss === 0 ? Infinity : -((wins * avgWin) / (losses * avgLoss));
	return { trades: trades.length, wins, losses, winRate, totalPnL, expectancy, avgWin, avgLoss, profitFactor, maxDD, finalEquity: equity, equityCurve };
}
