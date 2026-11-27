import { NextResponse } from 'next/server';
import { detail } from '../../../../../lib/kalshi/scan';
import { cached, cacheHeaders } from '../../../../../lib/kalshi/cache';

export const dynamic = 'force-dynamic';

// GET /api/kalshi/market/:ticker -> one market with chart, order book, trades and news.
export async function GET(_request, { params }) {
  const ticker = String(params.ticker || '').toUpperCase();
  if (!/^[A-Z0-9._-]{3,80}$/.test(ticker)) {
    return NextResponse.json({ error: 'Unknown market' }, { status: 400 });
  }
  try {
    const data = await cached(`m:${ticker}`, 180000, () => detail(ticker));
    return NextResponse.json(data, { headers: cacheHeaders(180) });
  } catch (error) {
    console.error('Market error:', error);
    return NextResponse.json({ error: 'Could not load that market from Kalshi.' }, { status: 502 });
  }
}
