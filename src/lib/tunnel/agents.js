import Anthropic from '@anthropic-ai/sdk';

// Each agent is { name, ask(system, user) -> { text, tokensIn, tokensOut } }.
// An agent whose key is not set is left out; the tunnel runs with whoever is present.

// Muse (Meta Model API) and Grok (xAI) both speak the OpenAI chat-completions format.
function openAiCompatible({ name, baseUrl, apiKey, model, maxTokens }) {
  return {
    name,
    model,
    async ask(system, user) {
      const r = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(`${name}: ${d.error?.message || `HTTP ${r.status}`}`);
      return {
        text: d.choices?.[0]?.message?.content || '',
        tokensIn: d.usage?.prompt_tokens || 0,
        tokensOut: d.usage?.completion_tokens || 0,
      };
    },
  };
}

function claude({ model, maxTokens }) {
  const client = new Anthropic();
  return {
    name: 'Claude',
    model,
    async ask(system, user) {
      const res = await client.beta.messages.create({
        model,
        // Thinking is always on for this model and counts against max_tokens,
        // so the cap leaves room for it; low effort keeps the spend down.
        max_tokens: maxTokens,
        output_config: { effort: 'low' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system,
        messages: [{ role: 'user', content: user }],
      });
      if (res.stop_reason === 'refusal') throw new Error('Claude: declined the question');
      const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
      return { text, tokensIn: res.usage.input_tokens, tokensOut: res.usage.output_tokens };
    },
  };
}

export function agentsFromEnv(env = process.env) {
  const maxTokens = parseInt(env.TUNNEL_MAX_TOKENS || '400', 10);
  const agents = [];
  if (env.MUSE_API_KEY) {
    agents.push(
      openAiCompatible({
        name: 'Muse',
        baseUrl: env.MUSE_BASE_URL || 'https://api.meta.ai/v1',
        apiKey: env.MUSE_API_KEY,
        model: env.MUSE_MODEL || 'muse-spark-1.1',
        maxTokens,
      })
    );
  }
  if (env.XAI_API_KEY) {
    agents.push(
      openAiCompatible({
        name: 'Grok',
        baseUrl: env.GROK_BASE_URL || 'https://api.x.ai/v1',
        apiKey: env.XAI_API_KEY,
        model: env.GROK_MODEL || 'grok-4.7',
        maxTokens,
      })
    );
  }
  if (env.ANTHROPIC_API_KEY) {
    agents.push(
      claude({
        model: env.CLAUDE_MODEL || 'claude-opus-5-5',
        maxTokens: Math.max(maxTokens, 1024),
      })
    );
  }
  return agents;
}
