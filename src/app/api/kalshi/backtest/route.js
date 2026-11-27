import { NextResponse } from 'next/server';
import backtest from '../../../../data/backtest.json';

// GET /api/kalshi/backtest -> the stored backtest report (see scripts/backtest.mjs).
export async function GET() {
  return NextResponse.json(backtest, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
