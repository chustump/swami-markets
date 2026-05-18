import { NextResponse } from 'next/server';
import { predictPair } from '../../../lib/oracle';

function fallback(pair) {
  const pred = predictPair(pair);
  return NextResponse.json({ raw: JSON.stringify(pred), source: 'heuristic' });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const pair = body.pair;

    if (!pair) {
      return NextResponse.json({ error: 'Pair data required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return fallback(pair);
    }

    const prompt = `You are "The Swami." Analyze (May 2026): ${pair.topic} (${pair.cat})
Poly: YES ${(pair.poly.yes * 100).toFixed(0)}¢ Vol ${pair.poly.vol}
Kalshi: YES ${(pair.kalshi.yes * 100).toFixed(0)}¢ Vol ${pair.kalshi.vol}
Spread: ${pair.spread}¢

JSON no backticks:
{"side":"YES/NO/LEAN YES/LEAN NO","confidence":"High/Medium/Low","reasoning":"One sentence","analysis":"📊 OVERVIEW\\n📱 SENTIMENT\\n📈 HISTORY\\n🎯 EDGE\\n⚠️ RISKS"}`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const d = await r.json();
    if (!r.ok) {
      console.error('Anthropic error, falling back to heuristic:', d.error?.message);
      return fallback(pair);
    }

    const raw = (d.content || []).map(b => b.text || "").join("");
    return NextResponse.json({ raw, source: 'llm' });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
