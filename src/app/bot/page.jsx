"use client";
import { useMemo, useState } from "react";

// SwamiBot — strategy companion page.
// Lets you model expected win rate and equity curve from TP/SL choices
// before optimizing the NinjaScript strategy in NinjaTrader.

const T = {
	bg: "#060710", sf: "#0c0e16", card: "#11131c", border: "#1b1f30",
	text: "#e6e8f0", soft: "#a2a6bc", muted: "#636882", dim: "#3c3f54",
	green: "#00e5b0", red: "#ff5274", yellow: "#ffc84a", purple: "#a66dff", orange: "#ff8c42",
};

function simulate({ trades, winRate, riskUsd, rewardRiskRatio, startCapital, seed }) {
	let rng = mulberry32(seed);
	let cap = startCapital;
	const curve = [cap];
	let wins = 0;
	let maxEquity = cap;
	let maxDrawdown = 0;
	for (let i = 0; i < trades; i++) {
		const win = rng() < winRate;
		if (win) { cap += riskUsd * rewardRiskRatio; wins++; }
		else { cap -= riskUsd; }
		curve.push(cap);
		if (cap > maxEquity) maxEquity = cap;
		const dd = maxEquity - cap;
		if (dd > maxDrawdown) maxDrawdown = dd;
		if (cap <= 0) break;
	}
	return {
		final: cap,
		curve,
		wins,
		losses: trades - wins,
		actualWinRate: wins / trades,
		expectancy: winRate * rewardRiskRatio - (1 - winRate),
		maxDrawdown,
	};
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

function Curve({ data, w = 600, h = 180 }) {
	if (!data.length) return null;
	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = max - min || 1;
	const pts = data.map((v, i) => {
		const x = (i / (data.length - 1)) * w;
		const y = h - ((v - min) / range) * h;
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(" ");
	const last = data[data.length - 1];
	const first = data[0];
	const stroke = last >= first ? T.green : T.red;
	return (
		<svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
			<polyline points={pts} fill="none" stroke={stroke} strokeWidth="2" />
		</svg>
	);
}

function Slider({ label, value, min, max, step, onChange, suffix = "" }) {
	return (
		<label style={{ display: "block", marginBottom: 14 }}>
			<div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.soft, marginBottom: 6 }}>
				<span>{label}</span>
				<span style={{ color: T.text, fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
					{typeof value === "number" ? value.toFixed(step < 1 ? 2 : 0) : value}{suffix}
				</span>
			</div>
			<input
				type="range" min={min} max={max} step={step} value={value}
				onChange={(e) => onChange(parseFloat(e.target.value))}
				style={{ width: "100%", accentColor: T.orange }}
			/>
		</label>
	);
}

export default function BotPage() {
	const [winRatePct, setWinRatePct] = useState(70);
	const [rrRatio, setRrRatio] = useState(0.5);
	const [trades, setTrades] = useState(200);
	const [riskUsd, setRiskUsd] = useState(150);
	const [startCapital, setStartCapital] = useState(10000);
	const [seed, setSeed] = useState(42);

	const sim = useMemo(() => simulate({
		trades, winRate: winRatePct / 100, riskUsd, rewardRiskRatio: rrRatio, startCapital, seed,
	}), [trades, winRatePct, riskUsd, rrRatio, startCapital, seed]);

	const pnl = sim.final - startCapital;
	const pnlPct = (pnl / startCapital) * 100;
	const expectancyUsd = sim.expectancy * riskUsd;

	const breakEvenWinRate = 1 / (1 + rrRatio); // probability such that EV = 0
	const isProfitable = sim.expectancy > 0;

	return (
		<div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'DM Sans', system-ui, sans-serif", padding: "32px 16px" }}>
			<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
			<div style={{ maxWidth: 980, margin: "0 auto" }}>
				<a href="/" style={{ color: T.muted, fontSize: 12, textDecoration: "none" }}>← Back to Swami Markets</a>
				<h1 style={{ fontSize: 28, fontWeight: 800, color: T.orange, marginTop: 14, marginBottom: 4 }}>SwamiBot — NinjaTrader Strategy</h1>
				<div style={{ fontSize: 13, color: T.soft, marginBottom: 24 }}>
					Confluence trend-pullback strategy for NinjaTrader 8. Use this simulator
					to understand the math behind a high-win-rate strategy before optimizing
					in the Strategy Analyzer.
				</div>

				<div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
					<div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: T.yellow, marginBottom: 8 }}>⚠ THE 80% WIN-RATE TRADEOFF</div>
					<div style={{ fontSize: 13, color: T.soft, lineHeight: 1.6 }}>
						You can engineer almost any win rate by adjusting take-profit relative to stop-loss.
						The smaller TP is vs SL, the more often you win — but each loss is larger than each win.
						The only metric that matters is <b style={{ color: T.text }}>expectancy</b>: <code>win_rate × reward_per_win − loss_rate × loss_per_loss</code>.
						If expectancy is positive, the strategy makes money long-term. If negative, even an 80% win rate loses money over time.
					</div>
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
					<div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
						<div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: 1, marginBottom: 14 }}>STRATEGY PARAMETERS</div>
						<Slider label="Target win rate" value={winRatePct} min={30} max={95} step={1} onChange={setWinRatePct} suffix="%" />
						<Slider label="Reward : risk ratio (TP/SL)" value={rrRatio} min={0.1} max={3} step={0.05} onChange={setRrRatio} />
						<Slider label="Trades simulated" value={trades} min={20} max={1000} step={10} onChange={setTrades} />
						<Slider label="Risk per trade (USD)" value={riskUsd} min={25} max={1000} step={25} onChange={setRiskUsd} suffix=" $" />
						<Slider label="Starting capital (USD)" value={startCapital} min={1000} max={100000} step={1000} onChange={setStartCapital} suffix=" $" />
						<button
							onClick={() => setSeed(Math.floor(Math.random() * 1e9))}
							style={{ width: "100%", background: T.sf, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 6 }}
						>
							🎲 Re-run with new seed
						</button>
					</div>

					<div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
						<div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: 1, marginBottom: 14 }}>RESULT</div>
						<Stat label="Expectancy per trade" value={`${expectancyUsd >= 0 ? "+" : ""}$${expectancyUsd.toFixed(2)}`} color={expectancyUsd >= 0 ? T.green : T.red} />
						<Stat label="Break-even win rate for this RR" value={`${(breakEvenWinRate * 100).toFixed(1)}%`} color={winRatePct / 100 >= breakEvenWinRate ? T.green : T.red} />
						<Stat label="Final capital" value={`$${sim.final.toFixed(0)}`} color={pnl >= 0 ? T.green : T.red} />
						<Stat label="P&L" value={`${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)} (${pnlPct.toFixed(1)}%)`} color={pnl >= 0 ? T.green : T.red} />
						<Stat label="Max drawdown" value={`-$${sim.maxDrawdown.toFixed(0)}`} color={T.red} />
						<Stat label="Wins / losses" value={`${sim.wins} / ${sim.losses}`} color={T.text} />
						<Stat label="Realized win rate" value={`${(sim.actualWinRate * 100).toFixed(1)}%`} color={T.text} />
						<div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: isProfitable ? T.green + "14" : T.red + "14", border: `1px solid ${(isProfitable ? T.green : T.red)}33`, fontSize: 12, color: isProfitable ? T.green : T.red, fontWeight: 600 }}>
							{isProfitable
								? "✓ Positive expectancy — strategy is mathematically profitable."
								: "✗ Negative expectancy — strategy loses money long-term despite high win rate."}
						</div>
					</div>
				</div>

				<div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
					<div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: 1, marginBottom: 10 }}>EQUITY CURVE</div>
					<Curve data={sim.curve} />
				</div>

				<div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
					<div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: 1, marginBottom: 10 }}>INSTALLATION</div>
					<ol style={{ fontSize: 13, color: T.soft, lineHeight: 1.8, paddingLeft: 18 }}>
						<li>Copy <code style={{ color: T.orange }}>ninjatrader/Strategies/SwamiBot.cs</code> into <code>Documents\NinjaTrader 8\bin\Custom\Strategies\</code></li>
						<li>Open NinjaTrader → <b>Tools → Edit NinjaScript → Strategy</b> → right-click → <b>Compile</b> (F5)</li>
						<li>Open a chart (5-min ES, NQ, MES, or MNQ recommended) → <b>Strategies</b> tab → enable <b>SwamiBot</b></li>
						<li>Run in <b>Strategy Analyzer</b> first, then on <b>Sim101</b>, before going live.</li>
						<li>See <code>ninjatrader/README.md</code> for full parameter tuning guide.</li>
					</ol>
				</div>
			</div>
		</div>
	);
}

function Stat({ label, value, color }) {
	return (
		<div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
			<span style={{ color: T.muted }}>{label}</span>
			<span style={{ color, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>{value}</span>
		</div>
	);
}
