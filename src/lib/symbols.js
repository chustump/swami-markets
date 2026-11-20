export const SYMBOLS = [
  { id: "BTCUSD", name: "Bitcoin", type: "crypto", binance: "BTCUSDT", coinbase: "BTC-USD", base: 90000 },
  { id: "ETHUSD", name: "Ethereum", type: "crypto", binance: "ETHUSDT", coinbase: "ETH-USD", base: 3200 },
  { id: "SOLUSD", name: "Solana", type: "crypto", binance: "SOLUSDT", coinbase: "SOL-USD", base: 180 },
  { id: "XRPUSD", name: "XRP", type: "crypto", binance: "XRPUSDT", coinbase: "XRP-USD", base: 2.2 },
  { id: "SPY", name: "S&P 500 ETF", type: "stock", yahoo: "SPY", base: 600 },
  { id: "QQQ", name: "Nasdaq 100 ETF", type: "stock", yahoo: "QQQ", base: 520 },
  { id: "AAPL", name: "Apple", type: "stock", yahoo: "AAPL", base: 230 },
  { id: "NVDA", name: "Nvidia", type: "stock", yahoo: "NVDA", base: 140 },
  { id: "TSLA", name: "Tesla", type: "stock", yahoo: "TSLA", base: 340 },
  { id: "GLD", name: "Gold ETF", type: "stock", yahoo: "GLD", base: 250 },
];

export const TIMEFRAMES = [
  { id: "15m", label: "15m", sec: 900 },
  { id: "1h", label: "1H", sec: 3600 },
  { id: "4h", label: "4H", sec: 14400 },
  { id: "1d", label: "1D", sec: 86400 },
];
