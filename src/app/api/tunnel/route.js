import { NextResponse } from 'next/server';
import { agentsFromEnv } from '../../../lib/tunnel/agents';
import { runTunnel } from '../../../lib/tunnel/tunnel';

// POST { question } -> the same { raw } shape /api/ask returns, plus tunnel details.
export async function POST(request) {
  try {
    const { question } = await request.json();
    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    const agents = agentsFromEnv();
    if (!agents.length) {
      return NextResponse.json(
        { error: 'No tunnel agents configured. Set MUSE_API_KEY, XAI_API_KEY or ANTHROPIC_API_KEY.' },
        { status: 503 }
      );
    }

    const result = await runTunnel(question.trim(), agents, {
      maxSpread: parseInt(process.env.TUNNEL_MAX_SPREAD || '15', 10),
    });
    const { side, confidence, probability, reasoning, analysis, ...tunnel } = result;
    return NextResponse.json({
      raw: JSON.stringify({ side, confidence, probability, reasoning, analysis }),
      tunnel,
    });
  } catch (error) {
    console.error('Tunnel error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
