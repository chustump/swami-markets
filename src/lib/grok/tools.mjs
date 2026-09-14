/**
 * Tool definitions and handlers for the Grok MCP server.
 *
 * Transport-agnostic on purpose: both the stdio entry point (mcp/grok-stdio.mjs)
 * and the HTTP route (src/app/api/mcp/route.js) import from here, so the two
 * transports can never drift apart.
 */

import { chatCompletion, listModels, DEFAULT_MODEL, XaiError } from './xai.mjs';

/** Thrown for bad tool input. Reported back to the model as a tool error, not a protocol error. */
export class ToolInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ToolInputError';
  }
}

/* -------------------------------------------------------------------------- */
/* Input validation helpers                                                    */
/* -------------------------------------------------------------------------- */

function optString(args, key, { maxLength = 100000 } = {}) {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') throw new ToolInputError(`\`${key}\` must be a string.`);
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maxLength) {
    throw new ToolInputError(`\`${key}\` must be at most ${maxLength} characters (got ${trimmed.length}).`);
  }
  return trimmed;
}

function requiredString(args, key, opts) {
  const value = optString(args, key, opts);
  if (value === undefined) throw new ToolInputError(`\`${key}\` is required and must be a non-empty string.`);
  return value;
}

function optEnum(args, key, allowed) {
  const value = optString(args, key);
  if (value === undefined) return undefined;
  if (!allowed.includes(value)) {
    throw new ToolInputError(`\`${key}\` must be one of: ${allowed.join(', ')} (got "${value}").`);
  }
  return value;
}

function optNumber(args, key, { min, max, integer = false } = {}) {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  const num = typeof value === 'string' ? Number(value) : value;
  if (typeof num !== 'number' || !Number.isFinite(num)) {
    throw new ToolInputError(`\`${key}\` must be a number.`);
  }
  if (integer && !Number.isInteger(num)) throw new ToolInputError(`\`${key}\` must be a whole number.`);
  if (min !== undefined && num < min) throw new ToolInputError(`\`${key}\` must be >= ${min} (got ${num}).`);
  if (max !== undefined && num > max) throw new ToolInputError(`\`${key}\` must be <= ${max} (got ${num}).`);
  return num;
}

function optStringArray(args, key, { maxItems = 50, allowed = null } = {}) {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  const list = Array.isArray(value) ? value : [value];
  const cleaned = list
    .map((item) => (typeof item === 'string' ? item.trim() : item))
    .filter((item) => item !== '' && item !== undefined && item !== null);
  if (!cleaned.length) return undefined;
  if (cleaned.some((item) => typeof item !== 'string')) {
    throw new ToolInputError(`\`${key}\` must be an array of strings.`);
  }
  if (cleaned.length > maxItems) {
    throw new ToolInputError(`\`${key}\` accepts at most ${maxItems} entries (got ${cleaned.length}).`);
  }
  if (allowed) {
    const bad = cleaned.filter((item) => !allowed.includes(item));
    if (bad.length) {
      throw new ToolInputError(`\`${key}\` contains unsupported values: ${bad.join(', ')}. Allowed: ${allowed.join(', ')}.`);
    }
  }
  return cleaned;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function optDate(args, key) {
  const value = optString(args, key);
  if (value === undefined) return undefined;
  if (!ISO_DATE.test(value)) {
    throw new ToolInputError(`\`${key}\` must be an ISO date formatted YYYY-MM-DD (got "${value}").`);
  }
  return value;
}

/* -------------------------------------------------------------------------- */
/* Live Search request construction                                            */
/* -------------------------------------------------------------------------- */

const SOURCE_TYPES = ['x', 'web', 'news', 'rss'];

/** Build the xAI `search_parameters` object from validated tool arguments. */
function buildSearchParameters(input) {
  const sources = [];

  for (const type of input.sources) {
    if (type === 'x') {
      const source = { type: 'x' };
      if (input.x_handles) source.included_x_handles = input.x_handles;
      if (input.exclude_x_handles) source.excluded_x_handles = input.exclude_x_handles;
      if (input.min_post_favorites !== undefined) source.post_favorite_count = input.min_post_favorites;
      if (input.min_post_views !== undefined) source.post_view_count = input.min_post_views;
      sources.push(source);
      continue;
    }

    if (type === 'web' || type === 'news') {
      const source = { type };
      if (input.country) source.country = input.country;
      // xAI treats these as mutually exclusive per source.
      if (input.allowed_websites) source.allowed_websites = input.allowed_websites;
      else if (input.excluded_websites) source.excluded_websites = input.excluded_websites;
      sources.push(source);
      continue;
    }

    if (type === 'rss') {
      sources.push({ type: 'rss', links: input.rss_links });
    }
  }

  const params = {
    mode: input.mode,
    return_citations: true,
    max_search_results: input.max_search_results,
    sources,
  };
  if (input.from_date) params.from_date = input.from_date;
  if (input.to_date) params.to_date = input.to_date;
  return params;
}

/* -------------------------------------------------------------------------- */
/* Tool definitions                                                            */
/* -------------------------------------------------------------------------- */

export const TOOLS = [
  {
    name: 'grok_ask',
    title: 'Ask Grok',
    description: `Send a prompt to xAI's Grok model and return its answer.

This is a plain completion call with no web or X access - use \`grok_live_search\` when the answer depends on current events, live prices, or what people are posting right now.

Args:
  - prompt (string, required): The question or instruction for Grok.
  - system (string, optional): System prompt that sets Grok's role or output format.
  - model (string, optional): Model id, e.g. "grok-4.6". Defaults to the XAI_MODEL env var, otherwise "${DEFAULT_MODEL}".
  - max_tokens (integer, optional): Cap on response length, 1-128000.
  - temperature (number, optional): Sampling temperature, 0-2. Lower is more deterministic.

Returns:
  {
    "answer": string,   // Grok's response text
    "model": string,    // Model that actually served the request
    "usage": object     // Token counts reported by xAI
  }

Examples:
  - Use when: "Ask Grok to steelman the bear case for this trade" -> prompt="Steelman the bear case for..."
  - Use when: You want a second model's opinion to compare against your own reasoning.
  - Don't use when: You need real-time information -> use grok_live_search instead.

Error Handling:
  - Returns a message naming XAI_API_KEY if the key is missing or rejected.
  - On an unknown model id, the error lists the models the key can actually use.`,
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', minLength: 1, description: 'The question or instruction for Grok.' },
        system: { type: 'string', description: "System prompt that sets Grok's role or output format." },
        model: { type: 'string', description: `Model id, e.g. "grok-4.6". Defaults to "${DEFAULT_MODEL}".` },
        max_tokens: { type: 'integer', minimum: 1, maximum: 128000, description: 'Cap on response length.' },
        temperature: { type: 'number', minimum: 0, maximum: 2, description: 'Sampling temperature, 0-2.' },
      },
      required: ['prompt'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        answer: { type: 'string' },
        model: { type: 'string' },
        usage: { type: 'object' },
      },
      required: ['answer', 'model'],
      additionalProperties: true,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },

  {
    name: 'grok_live_search',
    title: 'Grok Live Search',
    description: `Answer a question using Grok's Live Search over X (Twitter), the web, news, and RSS feeds, returning the answer plus source citations.

This is Grok's differentiated capability: first-party access to X posts. Reach for it when the question turns on real-time sentiment, breaking news, or what specific accounts are saying.

Args:
  - query (string, required): The question to research.
  - sources (array of "x" | "web" | "news" | "rss", optional): Where to search. Default ["x", "web", "news"].
  - mode ("on" | "auto" | "off", optional): "on" forces a search, "auto" lets Grok decide, "off" disables it. Default "on".
  - max_search_results (integer, optional): Sources to consult, 1-50. Default 15.
  - from_date / to_date (string, optional): Restrict to a date window, formatted YYYY-MM-DD.
  - x_handles (array of string, optional): Search only these X handles, without the "@".
  - exclude_x_handles (array of string, optional): Skip these X handles. Cannot be combined with x_handles.
  - min_post_favorites (integer, optional): Ignore X posts below this like count - useful for filtering noise.
  - min_post_views (integer, optional): Ignore X posts below this view count.
  - country (string, optional): Two-letter ISO code biasing web and news results, e.g. "US".
  - allowed_websites (array of string, optional): Restrict web/news to these domains, max 5.
  - excluded_websites (array of string, optional): Skip these domains, max 5. Ignored if allowed_websites is set.
  - rss_links (array of string, optional): Feed URLs. Required when "rss" is in sources.
  - model (string, optional): Model id. Defaults to "${DEFAULT_MODEL}".
  - max_tokens (integer, optional): Cap on response length, 1-128000.

Returns:
  {
    "answer": string,            // Grok's synthesized answer
    "model": string,             // Model that served the request
    "citations": string[],       // Source URLs backing the answer
    "num_sources_used": number,  // Sources xAI actually consulted (null if not reported)
    "search": object             // The search_parameters that were sent, for auditing
  }

Examples:
  - Use when: "What is X saying about the Fed decision today?" -> query="Fed decision reaction", sources=["x"], min_post_favorites=100
  - Use when: "Latest news on this prediction market" -> query="...", sources=["news","web"], from_date="2026-09-01"
  - Use when: You want sentiment from specific accounts -> x_handles=["DeItaone","FirstSquawk"]
  - Don't use when: The question is timeless reasoning with no live component -> use grok_ask, which is cheaper and faster.

Error Handling:
  - Returns a message naming XAI_API_KEY if the key is missing or rejected.
  - Returns an input error if "rss" is requested without rss_links, or if x_handles and exclude_x_handles are combined.
  - An empty citations array means Grok answered without consulting sources; retry with mode="on" and a more specific query.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1, description: 'The question to research.' },
        sources: {
          type: 'array',
          items: { type: 'string', enum: SOURCE_TYPES },
          description: 'Where to search. Default ["x", "web", "news"].',
        },
        mode: { type: 'string', enum: ['on', 'auto', 'off'], description: 'Force, delegate, or disable searching. Default "on".' },
        max_search_results: { type: 'integer', minimum: 1, maximum: 50, description: 'Sources to consult. Default 15.' },
        from_date: { type: 'string', description: 'Earliest date to consider, YYYY-MM-DD.' },
        to_date: { type: 'string', description: 'Latest date to consider, YYYY-MM-DD.' },
        x_handles: { type: 'array', items: { type: 'string' }, description: 'Search only these X handles (no "@").' },
        exclude_x_handles: { type: 'array', items: { type: 'string' }, description: 'Skip these X handles.' },
        min_post_favorites: { type: 'integer', minimum: 0, description: 'Ignore X posts below this like count.' },
        min_post_views: { type: 'integer', minimum: 0, description: 'Ignore X posts below this view count.' },
        country: { type: 'string', minLength: 2, maxLength: 2, description: 'Two-letter ISO country code.' },
        allowed_websites: { type: 'array', items: { type: 'string' }, maxItems: 5, description: 'Restrict web/news to these domains.' },
        excluded_websites: { type: 'array', items: { type: 'string' }, maxItems: 5, description: 'Skip these domains.' },
        rss_links: { type: 'array', items: { type: 'string' }, description: 'Feed URLs; required when "rss" is in sources.' },
        model: { type: 'string', description: `Model id. Defaults to "${DEFAULT_MODEL}".` },
        max_tokens: { type: 'integer', minimum: 1, maximum: 128000, description: 'Cap on response length.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        answer: { type: 'string' },
        model: { type: 'string' },
        citations: { type: 'array', items: { type: 'string' } },
        num_sources_used: { type: ['number', 'null'] },
        search: { type: 'object' },
      },
      required: ['answer', 'model', 'citations'],
      additionalProperties: true,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Handlers                                                                    */
/* -------------------------------------------------------------------------- */

async function handleGrokAsk(args) {
  const prompt = requiredString(args, 'prompt');
  const system = optString(args, 'system');
  const model = optString(args, 'model');
  const maxTokens = optNumber(args, 'max_tokens', { min: 1, max: 128000, integer: true });
  const temperature = optNumber(args, 'temperature', { min: 0, max: 2 });

  const result = await chatCompletion({ prompt, system, model, maxTokens, temperature });

  const output = { answer: result.text, model: result.model, usage: result.usage };
  const text = result.text
    ? result.text
    : `Grok returned an empty response (finish_reason: ${result.finishReason ?? 'unknown'}). Try raising max_tokens or rephrasing the prompt.`;

  return { content: [{ type: 'text', text }], structuredContent: output };
}

async function handleGrokLiveSearch(args) {
  const query = requiredString(args, 'query');
  const sources = optStringArray(args, 'sources', { maxItems: 4, allowed: SOURCE_TYPES }) || ['x', 'web', 'news'];
  const x_handles = optStringArray(args, 'x_handles', { maxItems: 25 });
  const exclude_x_handles = optStringArray(args, 'exclude_x_handles', { maxItems: 25 });
  const rss_links = optStringArray(args, 'rss_links', { maxItems: 5 });

  if (x_handles && exclude_x_handles) {
    throw new ToolInputError('`x_handles` and `exclude_x_handles` cannot be used together - xAI accepts an allowlist or a denylist, not both.');
  }
  if (sources.includes('rss') && !rss_links) {
    throw new ToolInputError('`rss_links` is required when "rss" is one of the sources. Pass at least one feed URL, or drop "rss" from sources.');
  }

  const input = {
    sources: [...new Set(sources)],
    mode: optEnum(args, 'mode', ['on', 'auto', 'off']) || 'on',
    max_search_results: optNumber(args, 'max_search_results', { min: 1, max: 50, integer: true }) ?? 15,
    from_date: optDate(args, 'from_date'),
    to_date: optDate(args, 'to_date'),
    x_handles: x_handles?.map((handle) => handle.replace(/^@/, '')),
    exclude_x_handles: exclude_x_handles?.map((handle) => handle.replace(/^@/, '')),
    min_post_favorites: optNumber(args, 'min_post_favorites', { min: 0, integer: true }),
    min_post_views: optNumber(args, 'min_post_views', { min: 0, integer: true }),
    country: optString(args, 'country')?.toUpperCase(),
    allowed_websites: optStringArray(args, 'allowed_websites', { maxItems: 5 }),
    excluded_websites: optStringArray(args, 'excluded_websites', { maxItems: 5 }),
    rss_links,
  };

  const searchParameters = buildSearchParameters(input);
  const result = await chatCompletion({
    prompt: query,
    model: optString(args, 'model'),
    maxTokens: optNumber(args, 'max_tokens', { min: 1, max: 128000, integer: true }),
    searchParameters,
  });

  const numSourcesUsed = result.usage?.num_sources_used ?? null;
  const output = {
    answer: result.text,
    model: result.model,
    citations: result.citations,
    num_sources_used: numSourcesUsed,
    search: searchParameters,
  };

  const lines = [result.text || '(Grok returned no answer text.)'];
  if (result.citations.length) {
    lines.push('', `## Sources (${result.citations.length})`, ...result.citations.map((url, i) => `${i + 1}. ${url}`));
  } else {
    lines.push('', '_No citations returned - Grok may have answered without searching. Retry with mode="on" and a more specific query._');
  }

  return { content: [{ type: 'text', text: lines.join('\n') }], structuredContent: output };
}

const HANDLERS = {
  grok_ask: handleGrokAsk,
  grok_live_search: handleGrokLiveSearch,
};

/**
 * Execute a tool by name. Never throws: failures come back as MCP tool errors
 * (isError: true) so the calling model can read them and adjust.
 */
export async function callTool(name, args = {}) {
  const handler = HANDLERS[name];
  if (!handler) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Unknown tool "${name}". Available tools: ${TOOLS.map((t) => t.name).join(', ')}.` }],
    };
  }

  try {
    return await handler(args && typeof args === 'object' ? args : {});
  } catch (error) {
    if (error instanceof ToolInputError) {
      return { isError: true, content: [{ type: 'text', text: `Invalid input: ${error.message}` }] };
    }
    if (error instanceof XaiError) {
      let text = `Error: ${error.message}`;
      if (error.status === 404) {
        try {
          const models = await listModels();
          if (models.length) text += `\n\nModels available to this key: ${models.join(', ')}`;
        } catch {
          // Listing models is a convenience; ignore a secondary failure.
        }
      }
      return { isError: true, content: [{ type: 'text', text }] };
    }
    return { isError: true, content: [{ type: 'text', text: `Unexpected error running ${name}: ${error.message}` }] };
  }
}
