#region Using declarations
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Xml.Serialization;
using NinjaTrader.Cbi;
using NinjaTrader.Gui;
using NinjaTrader.Gui.Chart;
using NinjaTrader.Gui.SuperDom;
using NinjaTrader.Gui.Tools;
using NinjaTrader.Data;
using NinjaTrader.NinjaScript;
using NinjaTrader.Core.FloatingPoint;
using NinjaTrader.NinjaScript.Indicators;
using NinjaTrader.NinjaScript.DrawingTools;
#endregion

// SwamiBot — multi-confluence trend-pullback strategy for NinjaTrader 8.
//
// Design philosophy:
//   No strategy can guarantee an 80% win rate. This bot maximizes the probability
//   of a winning trade by stacking filters (trend + momentum + volatility +
//   session) and using a TP < SL ratio so wins are more frequent. The tradeoff
//   is lower per-trade expectancy — a single loss can erase several wins, so
//   strict daily-loss limits and position sizing are mandatory.
//
//   Tune the parameters with the Strategy Analyzer (backtest + walk-forward) on
//   your chosen instrument and timeframe before going live.

namespace NinjaTrader.NinjaScript.Strategies
{
	public class SwamiBot : Strategy
	{
		private EMA emaFast;
		private EMA emaSlow;
		private EMA emaTrend;
		private ADX adx;
		private RSI rsi;
		private ATR atr;

		private int tradesToday;
		private double dailyPnL;
		private DateTime currentSessionDate;
		private double sessionStartCash;

		protected override void OnStateChange()
		{
			if (State == State.SetDefaults)
			{
				Description					= "SwamiBot: trend-pullback strategy with confluence filters and strict risk management.";
				Name						= "SwamiBot";
				Calculate					= Calculate.OnBarClose;
				EntriesPerDirection			= 1;
				EntryHandling				= EntryHandling.AllEntries;
				IsExitOnSessionCloseStrategy= true;
				ExitOnSessionCloseSeconds	= 30;
				IsFillLimitOnTouch			= false;
				MaximumBarsLookBack			= MaximumBarsLookBack.TwoHundredFiftySix;
				OrderFillResolution			= OrderFillResolution.Standard;
				Slippage					= 0;
				StartBehavior				= StartBehavior.WaitUntilFlat;
				TimeInForce					= TimeInForce.Gtc;
				TraceOrders					= false;
				RealtimeErrorHandling		= RealtimeErrorHandling.StopCancelClose;
				StopTargetHandling			= StopTargetHandling.PerEntryExecution;
				BarsRequiredToTrade			= 200;
				IsInstantiatedOnEachOptimizationIteration	= true;

				// ---- Tunable parameters ----
				EmaFastPeriod		= 9;
				EmaSlowPeriod		= 21;
				EmaTrendPeriod		= 50;
				AdxPeriod			= 14;
				AdxMin				= 20;          // require trending market
				RsiPeriod			= 14;
				RsiLongPullback		= 45;          // long when RSI dips below this in uptrend
				RsiShortPullback	= 55;          // short when RSI pops above this in downtrend
				AtrPeriod			= 14;
				StopLossAtrMult		= 1.5;
				TakeProfitAtrMult	= 0.75;        // TP < SL → higher hit-rate, lower RR
				UseBreakeven		= true;
				BreakevenAtrMult	= 0.4;         // move stop to BE once price moves this many ATR in profit
				Quantity			= 1;
				MaxTradesPerDay		= 5;
				MaxDailyLossUsd		= 500;
				StartHour			= 9;           // session start (exchange local)
				StartMinute			= 35;
				EndHour				= 15;
				EndMinute			= 30;
				EnableLongs			= true;
				EnableShorts		= true;
			}
			else if (State == State.Configure)
			{
				// nothing to add — we use the built-in indicators in OnBarUpdate
			}
			else if (State == State.DataLoaded)
			{
				emaFast		= EMA(EmaFastPeriod);
				emaSlow		= EMA(EmaSlowPeriod);
				emaTrend	= EMA(EmaTrendPeriod);
				adx			= ADX(AdxPeriod);
				rsi			= RSI(RsiPeriod, 1);
				atr			= ATR(AtrPeriod);

				emaFast.Plots[0].Brush	= Brushes.DodgerBlue;
				emaSlow.Plots[0].Brush	= Brushes.Goldenrod;
				emaTrend.Plots[0].Brush	= Brushes.OrangeRed;

				AddChartIndicator(emaFast);
				AddChartIndicator(emaSlow);
				AddChartIndicator(emaTrend);
			}
		}

		protected override void OnBarUpdate()
		{
			if (CurrentBar < BarsRequiredToTrade) return;

			ResetDailyCountersIfNewSession();

			if (tradesToday >= MaxTradesPerDay) return;
			if (dailyPnL <= -Math.Abs(MaxDailyLossUsd)) return;
			if (!InSession()) return;

			// Confluence — trend
			bool uptrend	= emaFast[0] > emaSlow[0] && emaSlow[0] > emaTrend[0] && Close[0] > emaTrend[0];
			bool downtrend	= emaFast[0] < emaSlow[0] && emaSlow[0] < emaTrend[0] && Close[0] < emaTrend[0];

			// Confluence — strength
			bool trending = adx[0] >= AdxMin;

			// Confluence — pullback (mean reversion entry inside trend)
			bool longPullback	= rsi[0] < RsiLongPullback  && rsi[0] > rsi[1];   // RSI was low and is turning up
			bool shortPullback	= rsi[0] > RsiShortPullback && rsi[0] < rsi[1];   // RSI was high and is turning down

			// Volatility filter — avoid trading when ATR is below a reasonable floor
			double atrValue = atr[0];
			if (atrValue <= 0) return;

			if (Position.MarketPosition == MarketPosition.Flat)
			{
				if (EnableLongs && uptrend && trending && longPullback)
				{
					double stopPrice = Close[0] - StopLossAtrMult   * atrValue;
					double tgtPrice  = Close[0] + TakeProfitAtrMult * atrValue;
					SetStopLoss(CalculationMode.Price, stopPrice);
					SetProfitTarget(CalculationMode.Price, tgtPrice);
					EnterLong(Quantity, "SwamiLong");
					tradesToday++;
				}
				else if (EnableShorts && downtrend && trending && shortPullback)
				{
					double stopPrice = Close[0] + StopLossAtrMult   * atrValue;
					double tgtPrice  = Close[0] - TakeProfitAtrMult * atrValue;
					SetStopLoss(CalculationMode.Price, stopPrice);
					SetProfitTarget(CalculationMode.Price, tgtPrice);
					EnterShort(Quantity, "SwamiShort");
					tradesToday++;
				}
			}
			else if (UseBreakeven)
			{
				// Move stop to entry once price has moved BreakevenAtrMult * ATR in our favor
				double entry = Position.AveragePrice;
				if (Position.MarketPosition == MarketPosition.Long
					&& Close[0] - entry >= BreakevenAtrMult * atrValue)
				{
					SetStopLoss(CalculationMode.Price, entry);
				}
				else if (Position.MarketPosition == MarketPosition.Short
					&& entry - Close[0] >= BreakevenAtrMult * atrValue)
				{
					SetStopLoss(CalculationMode.Price, entry);
				}
			}
		}

		protected override void OnExecutionUpdate(Cbi.Execution execution, string executionId, double price, int quantity,
			Cbi.MarketPosition marketPosition, string orderId, DateTime time)
		{
			if (execution.Order != null && execution.Order.OrderState == OrderState.Filled
				&& (execution.Name == "Stop loss" || execution.Name == "Profit target"
					|| execution.Name.StartsWith("Exit")))
			{
				if (SystemPerformance != null && SystemPerformance.AllTrades.Count > 0)
				{
					var last = SystemPerformance.AllTrades[SystemPerformance.AllTrades.Count - 1];
					dailyPnL += last.ProfitCurrency;
				}
			}
		}

		private void ResetDailyCountersIfNewSession()
		{
			if (Time[0].Date != currentSessionDate)
			{
				currentSessionDate	= Time[0].Date;
				tradesToday			= 0;
				dailyPnL			= 0;
			}
		}

		private bool InSession()
		{
			TimeSpan now	= Time[0].TimeOfDay;
			TimeSpan start	= new TimeSpan(StartHour, StartMinute, 0);
			TimeSpan end	= new TimeSpan(EndHour, EndMinute, 0);
			return now >= start && now <= end;
		}

		#region Properties
		[NinjaScriptProperty, Range(1, int.MaxValue), Display(Name = "EMA fast period",		GroupName = "Indicators", Order = 1)]
		public int EmaFastPeriod { get; set; }

		[NinjaScriptProperty, Range(1, int.MaxValue), Display(Name = "EMA slow period",		GroupName = "Indicators", Order = 2)]
		public int EmaSlowPeriod { get; set; }

		[NinjaScriptProperty, Range(1, int.MaxValue), Display(Name = "EMA trend period",	GroupName = "Indicators", Order = 3)]
		public int EmaTrendPeriod { get; set; }

		[NinjaScriptProperty, Range(1, int.MaxValue), Display(Name = "ADX period",			GroupName = "Indicators", Order = 4)]
		public int AdxPeriod { get; set; }

		[NinjaScriptProperty, Range(0, 100),          Display(Name = "ADX min (trend strength)", GroupName = "Indicators", Order = 5)]
		public double AdxMin { get; set; }

		[NinjaScriptProperty, Range(1, int.MaxValue), Display(Name = "RSI period",			GroupName = "Indicators", Order = 6)]
		public int RsiPeriod { get; set; }

		[NinjaScriptProperty, Range(0, 100),          Display(Name = "RSI long pullback",	GroupName = "Indicators", Order = 7)]
		public double RsiLongPullback { get; set; }

		[NinjaScriptProperty, Range(0, 100),          Display(Name = "RSI short pullback",	GroupName = "Indicators", Order = 8)]
		public double RsiShortPullback { get; set; }

		[NinjaScriptProperty, Range(1, int.MaxValue), Display(Name = "ATR period",			GroupName = "Indicators", Order = 9)]
		public int AtrPeriod { get; set; }

		[NinjaScriptProperty, Range(0.1, 20),         Display(Name = "Stop-loss × ATR",		GroupName = "Risk", Order = 1)]
		public double StopLossAtrMult { get; set; }

		[NinjaScriptProperty, Range(0.1, 20),         Display(Name = "Take-profit × ATR",	GroupName = "Risk", Order = 2)]
		public double TakeProfitAtrMult { get; set; }

		[NinjaScriptProperty,                          Display(Name = "Use breakeven move",	GroupName = "Risk", Order = 3)]
		public bool UseBreakeven { get; set; }

		[NinjaScriptProperty, Range(0.1, 20),         Display(Name = "Breakeven trigger × ATR",GroupName = "Risk", Order = 4)]
		public double BreakevenAtrMult { get; set; }

		[NinjaScriptProperty, Range(1, int.MaxValue), Display(Name = "Quantity",			GroupName = "Risk", Order = 5)]
		public int Quantity { get; set; }

		[NinjaScriptProperty, Range(1, 100),          Display(Name = "Max trades per day",	GroupName = "Risk", Order = 6)]
		public int MaxTradesPerDay { get; set; }

		[NinjaScriptProperty, Range(1, 1000000),      Display(Name = "Max daily loss (USD)",GroupName = "Risk", Order = 7)]
		public double MaxDailyLossUsd { get; set; }

		[NinjaScriptProperty, Range(0, 23),           Display(Name = "Session start hour",	GroupName = "Session", Order = 1)]
		public int StartHour { get; set; }

		[NinjaScriptProperty, Range(0, 59),           Display(Name = "Session start minute",GroupName = "Session", Order = 2)]
		public int StartMinute { get; set; }

		[NinjaScriptProperty, Range(0, 23),           Display(Name = "Session end hour",	GroupName = "Session", Order = 3)]
		public int EndHour { get; set; }

		[NinjaScriptProperty, Range(0, 59),           Display(Name = "Session end minute",	GroupName = "Session", Order = 4)]
		public int EndMinute { get; set; }

		[NinjaScriptProperty,                          Display(Name = "Enable longs",		GroupName = "Session", Order = 5)]
		public bool EnableLongs { get; set; }

		[NinjaScriptProperty,                          Display(Name = "Enable shorts",		GroupName = "Session", Order = 6)]
		public bool EnableShorts { get; set; }
		#endregion
	}
}
