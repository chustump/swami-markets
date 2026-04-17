import { NextResponse } from 'next/server';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;

export async function POST(request) {
  try {
    const { messages, systemPrompt, botName } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        reply: `⚠️ ${botName || 'Clawdbot'} can't think right now — the ANTHROPIC_API_KEY environment variable is missing. Add it to .env.local (dev) or the Netlify dashboard (prod) and try again.`,
        missingKey: true,
      });
    }

    const cleanMessages = messages
      .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content.slice(0, 8000),
      }));

    const system = (systemPrompt && String(systemPrompt).trim()) ||
      `You are ${botName || 'Clawdbot'}, a helpful AI assistant.`;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: cleanMessages,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      const msg = data?.error?.message || 'Anthropic API error';
      return NextResponse.json({ error: msg }, { status: r.status });
    }

    const reply = (data.content || []).map((b) => b.text || '').join('').trim();
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('clawdbot/chat error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
