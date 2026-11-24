// Background function (Netlify gives these up to 15 minutes). Sweeps every open
// Kalshi market closing in the next 30 days, scores the liquid ones and stores
// the ranked result for /api/kalshi/scan to serve. Read-only against Kalshi.
import { scan } from '../../src/lib/kalshi/scan.js';
import { writeScan, claimRefresh } from '../../src/lib/kalshi/store.js';
import { setPace } from '../../src/lib/kalshi/client.js';

export default async () => {
  // Anyone can hit this URL, so it refuses to start more than once every 4 minutes.
  if (!(await claimRefresh(4 * 60 * 1000))) return;
  setPace(450, 6);
  const data = await scan({ budgetMs: 4 * 60 * 1000, pool: 300, picks: 30 });
  await writeScan({ ...data, source: 'background' });
  console.log(`edge refresh: ${data.universe.pagesRead} pages, ${data.universe.liquid} liquid, ${data.markets.length} ranked in ${data.tookMs}ms`);
};
