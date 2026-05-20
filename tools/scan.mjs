// Diagnostic scan: print top configs by win rate, by expectancy, etc.
import { generateBars, runStrategy } from "./backtest.mjs";

const bars = generateBars({ n: 40000, seed: 1 });

const baseParams = {
	emaFast: 9, emaSlow: 21, emaTrend: 50,
	adxPeriod: 14, rsiPeriod: 14, atrPeriod: 14,
	useBreakeven: true,
	qty: 1, startCapital: 10000,
};

const grid = [];
for (const tp of [0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75]) {
	for (const sl of [1.0, 1.5, 2.0, 2.5, 3.0]) {
		for (const adxMin of [15, 20, 25, 30]) {
			for (const rsiL of [35, 40, 45, 50]) {
				for (const rsiS of [50, 55, 60, 65]) {
					for (const beTrigger of [0.2, 0.35, 0.5]) {
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

const results = [];
for (const p of grid) {
	const r = runStrategy(bars, p);
	if (r.trades >= 30) results.push({ p, r });
}

console.log(`Configs with ≥30 trades: ${results.length}`);
console.log();
console.log("=== TOP 10 BY WIN RATE ===");
results.sort((a, b) => b.r.winRate - a.r.winRate).slice(0, 10).forEach(({ p, r }) => {
	console.log(`WR ${(r.winRate * 100).toFixed(1)}% | trades ${r.trades} | exp ${r.expectancy.toFixed(2)} | tp ${p.tpAtr} sl ${p.slAtr} adx ${p.adxMin} rsiL ${p.rsiLongPullback} rsiS ${p.rsiShortPullback} be ${p.beTrigger}`);
});

console.log();
console.log("=== TOP 10 BY WIN RATE (with positive expectancy) ===");
results.filter(({ r }) => r.expectancy > 0)
	.sort((a, b) => b.r.winRate - a.r.winRate).slice(0, 10).forEach(({ p, r }) => {
		console.log(`WR ${(r.winRate * 100).toFixed(1)}% | trades ${r.trades} | exp ${r.expectancy.toFixed(2)} | PnL ${r.totalPnL.toFixed(0)} | tp ${p.tpAtr} sl ${p.slAtr} adx ${p.adxMin} rsiL ${p.rsiLongPullback} rsiS ${p.rsiShortPullback} be ${p.beTrigger}`);
	});

console.log();
console.log("=== TOP 10 BY EXPECTANCY ===");
results.sort((a, b) => b.r.expectancy - a.r.expectancy).slice(0, 10).forEach(({ p, r }) => {
	console.log(`exp ${r.expectancy.toFixed(2)} | WR ${(r.winRate * 100).toFixed(1)}% | trades ${r.trades} | tp ${p.tpAtr} sl ${p.slAtr} adx ${p.adxMin} rsiL ${p.rsiLongPullback} rsiS ${p.rsiShortPullback} be ${p.beTrigger}`);
});
