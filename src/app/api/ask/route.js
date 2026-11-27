import { NextResponse } from 'next/server';
import { askClaude } from '../../../lib/claude';

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

    const raw = await askClaude(prompt, 2000);
    return NextResponse.json({ raw });
  } catch (error) {
    console.error('Ask error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
