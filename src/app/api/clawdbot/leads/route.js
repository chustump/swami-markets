import { NextResponse } from 'next/server';

export const maxDuration = 60;

const MODEL = 'claude-sonnet-4-6';
const MAX_ITERATIONS = 10;

function buildTools(useWebSearch) {
  const tools = [
    {
      name: 'save_lead',
      description:
        'Record one qualified lead. Call this once per lead as soon as you have enough information. Be specific and verifiable.',
      input_schema: {
        type: 'object',
        properties: {
          company: { type: 'string', description: 'Company / organization name' },
          website: { type: 'string', description: 'Primary website URL' },
          contact_name: { type: 'string', description: 'Specific person to contact, if known' },
          contact_title: { type: 'string', description: 'Job title of the contact' },
          contact_hint: {
            type: 'string',
            description:
              'Where / how to reach them (LinkedIn URL, email, contact form URL, etc.)',
          },
          why_relevant: {
            type: 'string',
            description: 'One- or two-sentence explanation of why this is a strong fit.',
          },
          outreach_angle: {
            type: 'string',
            description: 'A concrete hook or opener you would use in cold outreach.',
          },
          score: {
            type: 'number',
            description: 'Fit score 1 (weak) to 10 (perfect)',
          },
          sources: {
            type: 'array',
            items: { type: 'string' },
            description: 'URLs of sources that informed this lead.',
          },
        },
        required: ['company', 'why_relevant', 'score'],
      },
    },
    {
      name: 'finish_research',
      description:
        'Call this once the requested number of leads is saved (or when you are confident no more strong fits exist). Provide a short methodology summary.',
      input_schema: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description:
              'Short summary of methodology, what worked, and recommended next steps.',
          },
        },
        required: ['summary'],
      },
    },
  ];
  if (useWebSearch) {
    tools.unshift({
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: 8,
    });
  }
  return tools;
}

function buildSystemPrompt({ product, icp, geography, count }) {
  return `You are an autonomous lead-generation agent.

PRODUCT / SERVICE: ${product}

IDEAL CUSTOMER PROFILE: ${icp || 'Not specified — infer one based on the product, then state it back in your first message.'}

GEOGRAPHY: ${geography || 'Worldwide'}

OBJECTIVE: Identify ${count} concrete, well-qualified leads.

PROCESS (follow strictly):
1. Briefly think about the ICP and what signals indicate a strong fit.
2. Use web_search aggressively to find real companies that match. Vary queries.
3. For each promising company: search again to identify a specific decision-maker (name + title) and a credible way to reach them.
4. As soon as you have enough on a company, call save_lead with full details. Don't batch.
5. After saving ${count} leads (or sooner if you cannot find more strong fits), call finish_research with a 2-3 sentence summary.

QUALITY BAR:
- Every company must be a real, currently-operating organization.
- why_relevant must reference specific facts (not generic platitudes).
- outreach_angle must connect THIS company's situation to THIS product.
- Always include at least one source URL.

Be efficient. Do not over-explain between tool calls.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const product = (body.product || '').trim();
    const icp = (body.icp || '').trim();
    const geography = (body.geography || '').trim();
    const count = Math.max(1, Math.min(10, Number(body.count) || 5));

    if (!product) {
      return NextResponse.json({ error: 'product description is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        leads: [],
        log: [
          {
            type: 'error',
            text: '⚠️ Missing ANTHROPIC_API_KEY. Add it to .env.local (dev) or Netlify env vars (prod) and try again.',
          },
        ],
        summary: '',
        missingKey: true,
      });
    }

    const result = await runAgent({ product, icp, geography, count, useWebSearch: true });
    return NextResponse.json(result);
  } catch (error) {
    console.error('clawdbot/leads error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

async function runAgent({ product, icp, geography, count, useWebSearch }) {
  const system = buildSystemPrompt({ product, icp, geography, count });
  const messages = [
    {
      role: 'user',
      content: `Begin. Find ${count} leads. Save each one immediately with save_lead. Call finish_research when done.`,
    },
  ];

  const leads = [];
  const log = [];
  let summary = '';
  let webSearchEnabled = useWebSearch;
  let stopReason = null;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system,
        tools: buildTools(webSearchEnabled),
        messages,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      const msg = data?.error?.message || 'Anthropic API error';
      // Graceful fallback: retry once without web_search if that's the problem.
      if (webSearchEnabled && /web_search|tool/i.test(msg)) {
        log.push({
          type: 'warn',
          text: 'Web search unavailable on this API key — falling back to knowledge-only mode.',
        });
        webSearchEnabled = false;
        continue;
      }
      throw new Error(msg);
    }

    messages.push({ role: 'assistant', content: data.content });

    const toolResults = [];
    let finished = false;

    for (const block of data.content || []) {
      if (block.type === 'text') {
        const t = (block.text || '').trim();
        if (t) log.push({ type: 'thought', text: t });
      } else if (block.type === 'tool_use') {
        if (block.name === 'save_lead') {
          const lead = sanitizeLead(block.input || {});
          leads.push(lead);
          log.push({ type: 'lead', company: lead.company, score: lead.score });
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: `Saved lead #${leads.length}: ${lead.company}.`,
          });
        } else if (block.name === 'finish_research') {
          summary = String(block.input?.summary || '').trim();
          log.push({ type: 'finish', text: summary });
          finished = true;
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: 'Research complete.',
          });
        } else {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: `Unknown tool: ${block.name}`,
            is_error: true,
          });
        }
      } else if (block.type === 'server_tool_use' && block.name === 'web_search') {
        const q = block.input?.query || '';
        if (q) log.push({ type: 'search', text: q });
      } else if (block.type === 'web_search_tool_result') {
        const items = Array.isArray(block.content) ? block.content : [];
        log.push({ type: 'search_result', count: items.length });
      }
    }

    stopReason = data.stop_reason;

    if (finished) break;
    if (stopReason === 'end_turn' && toolResults.length === 0) break;

    if (toolResults.length > 0) {
      messages.push({ role: 'user', content: toolResults });
    } else {
      messages.push({
        role: 'user',
        content:
          'Continue working. Use web_search to find candidates and save_lead to record them. Call finish_research when you have enough leads.',
      });
    }
  }

  if (!summary && leads.length > 0) {
    summary = `Found ${leads.length} lead${leads.length === 1 ? '' : 's'}. Review fit scores and refine the ICP for the next run.`;
  }

  return { leads, log, summary, stopReason };
}

function sanitizeLead(input) {
  const score = Number(input.score);
  return {
    company: String(input.company || '').slice(0, 200),
    website: String(input.website || '').slice(0, 300),
    contact_name: String(input.contact_name || '').slice(0, 120),
    contact_title: String(input.contact_title || '').slice(0, 200),
    contact_hint: String(input.contact_hint || '').slice(0, 400),
    why_relevant: String(input.why_relevant || '').slice(0, 800),
    outreach_angle: String(input.outreach_angle || '').slice(0, 800),
    score: Number.isFinite(score) ? Math.max(1, Math.min(10, Math.round(score))) : 5,
    sources: Array.isArray(input.sources)
      ? input.sources.filter((s) => typeof s === 'string').slice(0, 8)
      : [],
  };
}
