import { NextResponse } from 'next/server';
import { predictQuestion } from '../../../lib/oracle';

function fallback(question) {
  const pred = predictQuestion(question);
  return NextResponse.json({ raw: JSON.stringify(pred), source: 'heuristic' });
}

export async function POST(request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return fallback(question);
    }

    const prompt = `You are "The Swami" — prediction oracle.
Predict: "${question.trim()}"
JSON no backticks:
{"side":"YES/NO/LEAN YES/LEAN NO/TOSS-UP","confidence":"High/Medium/Low","probability":"XX%","reasoning":"One sentence","analysis":"4-6 sentences: smart money, history, social sentiment, your take."}`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const d = await r.json();
    if (!r.ok) {
      console.error('Anthropic error, falling back to heuristic:', d.error?.message);
      return fallback(question);
    }

    const raw = (d.content || []).map(b => b.text || "").join("");
    return NextResponse.json({ raw, source: 'llm' });
  } catch (error) {
    console.error('Ask error:', error);
    try {
      const body = await request.clone().json().catch(() => ({}));
      if (body?.question) return fallback(body.question);
    } catch {}
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
