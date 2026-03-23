import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ raw: '{"side":"???","confidence":"—","probability":"—","reasoning":"Missing API Key. Please add ANTHROPIC_API_KEY to your environment variables!","analysis":"⚠️ The Oracle is unable to connect to the mystical plane because the Anthropic API Key is missing. Please add it to your .env.local file or Netlify dashboard."}' }, { status: 200 });
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
      throw new Error(d.error?.message || 'Anthropic API Error');
    }

    const raw = (d.content || []).map(b => b.text || "").join("");
    return NextResponse.json({ raw });
  } catch (error) {
    console.error('Ask error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
