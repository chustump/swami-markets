import { NextResponse } from 'next/server';
import { scan } from '../../../../lib/kalshi/scan';
import { cached, cacheHeaders } from '../../../../lib/kalshi/cache';
import { readScan } from '../../../../lib/kalshi/store';

export const dynamic = 'force-dynamic';

const TTL = parseInt(process.env.KALSHI_CACHE_SECONDS || '300', 10);
const BUDGET = parseInt(process.env.SCAN_BUDGET_MS || '8000', 10);
const FRESH_MS = 20 * 60 * 1000;

// GET /api/kalshi/scan -> ranked Kalshi markets with model edge. Read-only.
//
// Normally this serves the full sweep stored by the background refresh. When
// that is missing or old (first deploy, deploy previews, local dev) it asks for
// a refresh and answers with a quick partial scan done inside the request.
export async function GET(request) {
  try {
    const stored = await readScan();
    if (stored && stored.ageMs < FRESH_MS) {
      return NextResponse.json(stored.data, { headers: cacheHeaders(Math.min(TTL, 120)) });
    }
    if (process.env.NETLIFY || process.env.URL) {
      const origin = new URL(request.url).origin;
      fetch(`${origin}/.netlify/functions/edge-refresh-background`, { method: 'POST' }).catch(() => {});
    }
    const data = await cached('scan', TTL * 1000, async () => ({ ...(await scan({ budgetMs: BUDGET })), source: 'request' }));
    return NextResponse.json(data, { headers: cacheHeaders(data.universe.complete ? TTL : 60) });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'The scanner could not reach Kalshi. Try again in a minute.' }, { status: 502 });
  }
}
