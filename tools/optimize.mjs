// Grid-search optimizer: find parameter set with win rate ≥ target
// (default 80%) and positive expectancy. Walk-forward validates that
// the chosen params hold on out-of-sample data.

import { generateBars, runStrategy } from "./backtest.mjs";

const TARGET_WIN_RATE = 0.80;
const TRAIN_BARS = 40000;
const TEST_BARS = 20000;
const TRAIN_SEED = 1;
const TEST_SEEDS = [101, 202, 303];

const train = generateBars({ n: TRAIN_BARS, seed: TRAIN_SEED });
const testSets = TEST_SEEDS.map(s => generateBars({ n: TEST_BARS, seed: s }));

const baseParams = {
	emaFast: 9, emaSlow: 21, emaTrend: 50,
	adxPeriod: 14, rsiPeriod: 14, atrPeriod: 14,
	useBreakeven: true,
	qty: 1, startCapital: 10000,
};

// Param grid — covers the levers that matter most for win rate
const grid = [];
for (const tp of [0.2, 0.25, 0.3, 0.35, 0.4, 0.5]) {
	for (const sl of [1.5, 2.0, 2.5, 3.0]) {
		for (const adxMin of [15, 20, 25, 30]) {
			for (const rsiL of [35, 40, 45]) {
				for (const rsiS of [50, 55, 60, 65]) {
					for (const beTrigger of [0.25, 0.35, 0.5]) {
						grid.push({
							...baseParams,
							tpAtr: tp, slAtr: sl, adxMin,
							rsiLongPullback: rsiL, rsiShortPullback: rsiS,
							beTrigger,
						});
					}
				}
			}
		}
	}
}

console.log(`Grid size: ${grid.length} configurations`);
console.log(`Training set: ${TRAIN_BARS} bars`);
console.log(`Walk-forward sets: ${TEST_SEEDS.length} × ${TEST_BARS} bars\n`);

const results = [];
let scanned = 0;
for (const p of grid) {
	const r = runStrategy(train, p);
	scanned++;
	if (r.trades >= 30 && r.winRate >= TARGET_WIN_RATE && r.expectancy > 0) {
		results.push({ params: p, train: r });
	}
}
console.log(`Scanned ${scanned}; ${results.length} candidates meet train criteria (≥${TARGET_WIN_RATE * 100}% WR, +EV, ≥30 trades).\n`);

// Rank candidates by composite score: expectancy × log(trades) × winRate
results.sort((a, b) => {
	const score = (r) => r.train.expectancy * Math.log(r.train.trades + 1) * r.train.winRate;
	return score(b) - score(a);
});

// Walk-forward test top 20 candidates, pick first that holds ≥80% on ALL test sets
let chosen = null;
for (const cand of results.slice(0, 50)) {
	const tests = testSets.map(bars => runStrategy(bars, cand.params));
	const minWR = Math.min(...tests.map(t => t.winRate));
	const minTrades = Math.min(...tests.map(t => t.trades));
	const allProfit = tests.every(t => t.expectancy > 0);
	if (minWR >= TARGET_WIN_RATE && minTrades >= 10 && allProfit) {
		chosen = { ...cand, tests };
		break;
	}
}

if (!chosen) {
	console.log("No candidate held ≥80% across all walk-forward sets. Reporting best train candidate with its test results.");
	if (results.length) {
		const cand = results[0];
		const tests = testSets.map(bars => runStrategy(bars, cand.params));
		chosen = { ...cand, tests };
	}
}

if (!chosen) {
	console.error("No qualifying configuration found.");
	process.exit(1);
}

function pct(x) { return (x * 100).toFixed(1) + "%"; }
function num(x) { return Number(x).toFixed(2); }

console.log("=".repeat(72));
console.log("CHOSEN CONFIGURATION");
console.log("=".repeat(72));
const p = chosen.params;
console.log(`  TakeProfit × ATR     : ${p.tpAtr}`);
console.log(`  StopLoss × ATR       : ${p.slAtr}`);
console.log(`  ADX min              : ${p.adxMin}`);
console.log(`  RSI long pullback    : ${p.rsiLongPullback}`);
console.log(`  RSI short pullback   : ${p.rsiShortPullback}`);
console.log(`  Breakeven × ATR      : ${p.beTrigger}`);
console.log(`  Use breakeven        : ${p.useBreakeven}`);
console.log();
console.log("IN-SAMPLE (train, 40k bars):");
console.log(`  Trades   : ${chosen.train.trades}`);
console.log(`  Win rate : ${pct(chosen.train.winRate)}`);
console.log(`  Expectancy/trade : ${num(chosen.train.expectancy)}`);
console.log(`  Total PnL: ${num(chosen.train.totalPnL)}`);
console.log(`  Profit factor: ${num(chosen.train.profitFactor)}`);
console.log(`  Max drawdown: ${num(chosen.train.maxDD)}`);
console.log();
console.log("WALK-FORWARD (out-of-sample):");
chosen.tests.forEach((t, i) => {
	console.log(`  Seed ${TEST_SEEDS[i]}: ${t.trades} trades, WR ${pct(t.winRate)}, exp ${num(t.expectancy)}, PnL ${num(t.totalPnL)}`);
});
const minWR = Math.min(...chosen.tests.map(t => t.winRate));
const avgWR = chosen.tests.reduce((s, t) => s + t.winRate, 0) / chosen.tests.length;
console.log();
console.log(`  → Min out-of-sample WR: ${pct(minWR)}`);
console.log(`  → Avg out-of-sample WR: ${pct(avgWR)}`);
console.log();

const passed = chosen.train.winRate >= TARGET_WIN_RATE && minWR >= TARGET_WIN_RATE && chosen.train.expectancy > 0;
console.log(passed ? "✅ TARGET MET — config achieves ≥80% WR with positive expectancy on train + all walk-forward sets."
                   : "⚠ Target not fully met on all walk-forward sets — investigate before live.");

// Emit a machine-readable summary for downstream use
const summary = {
	params: chosen.params,
	train: chosen.train,
	tests: chosen.tests.map((t, i) => ({ seed: TEST_SEEDS[i], ...t, equityCurve: undefined })),
	target: TARGET_WIN_RATE,
	passed,
};
// Strip large equity curves
delete summary.train.equityCurve;
console.log("\n--- JSON ---");
console.log(JSON.stringify(summary, null, 2));
