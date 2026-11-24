import Anthropic from '@anthropic-ai/sdk';

// The one place the Claude model is chosen. Set CLAUDE_MODEL in the environment
// to change it without a code change.
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';

let client;

// Sends one prompt and returns the reply text. Throws an Error whose message is
// safe to show to a visitor.
export async function askClaude(prompt, maxTokens = 2000) {
  client ||= new Anthropic();
  try {
    const res = await client.beta.messages.create({
      model: CLAUDE_MODEL,
      // This model always thinks before answering and that counts toward
      // max_tokens, so the cap is roomier than the visible answer needs.
      max_tokens: maxTokens,
      output_config: { effort: 'low' },
      // If the model declines a question, Anthropic retries it on a fallback model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{ role: 'user', content: prompt }],
    });
    if (res.stop_reason === 'refusal') throw new Error('The Swami declined to answer that one.');
    return res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) throw new Error('The Anthropic API key was rejected.');
    if (error instanceof Anthropic.NotFoundError) throw new Error(`Claude model "${CLAUDE_MODEL}" was not found. Check CLAUDE_MODEL.`);
    if (error instanceof Anthropic.RateLimitError) throw new Error('The Swami is busy. Try again in a moment.');
    if (error instanceof Anthropic.APIError) throw new Error(`Anthropic API error (${error.status ?? 'network'}).`);
    throw error;
  }
}
