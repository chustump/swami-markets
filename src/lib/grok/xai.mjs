/**
 * Minimal xAI (Grok) API client.
 *
 * The xAI API is OpenAI-compatible: POST https://api.x.ai/v1/chat/completions.
 * Live Search is an xAI extension driven by the `search_parameters` body field.
 *
 * No third-party dependencies - uses global fetch (Node 18+).
 */

export const XAI_BASE_URL = process.env.XAI_BASE_URL || 'https://api.x.ai/v1';

/**
 * Default model. The Grok lineup moves fast, so this is overridable per-call
 * and via the XAI_MODEL environment variable. Use listModels() to see what the
 * current API key actually has access to.
 */
export const DEFAULT_MODEL = process.env.XAI_MODEL || 'grok-4.6';

/** Raised for any non-2xx response or transport failure. Carries a message written for an agent to act on. */
export class XaiError extends Error {
  constructor(message, { status = null, cause = null } = {}) {
    super(message);
    this.name = 'XaiError';
    this.status = status;
    this.cause = cause;
  }
}

function requireApiKey() {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    throw new XaiError(
      'XAI_API_KEY is not set. Create a key at https://console.x.ai and expose it to this server ' +
        '(.env.local for local runs, or the Netlify environment for the deployed connector).'
    );
  }
  return key;
}

/** Turn an xAI error response into a message that tells the caller what to do next. */
function describeHttpError(status, body) {
  const apiMessage =
    (body && (body.error?.message || body.error || body.message)) ||
    (typeof body === 'string' ? body.slice(0, 500) : null);

  switch (status) {
    case 401:
    case 403:
      return `xAI rejected the credentials (HTTP ${status}). Check that XAI_API_KEY is a valid, active key with credit available. ${apiMessage || ''}`.trim();
    case 404:
      return `xAI returned 404 (HTTP ${status}) - usually an unknown model name. Model names change often; call the models endpoint (GET ${XAI_BASE_URL}/models) to see what this key can use, then pass a valid \`model\`. ${apiMessage || ''}`.trim();
    case 429:
      return `xAI rate limit or quota exceeded (HTTP 429). Wait and retry, lower max_search_results, or check the account's spend limits. ${apiMessage || ''}`.trim();
    default:
      if (status >= 500) {
        return `xAI server error (HTTP ${status}). This is upstream and usually transient - retry shortly. ${apiMessage || ''}`.trim();
      }
      return `xAI request failed (HTTP ${status}). ${apiMessage || ''}`.trim();
  }
}

async function xaiFetch(path, { method = 'POST', body = null, timeoutMs = 120000 } = {}) {
  const apiKey = requireApiKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${XAI_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new XaiError(
        `xAI request timed out after ${Math.round(timeoutMs / 1000)}s. Reasoning models with Live Search can be slow - ` +
          'retry with a narrower query, fewer sources, or a smaller max_search_results.',
        { cause: err }
      );
    }
    throw new XaiError(`Could not reach the xAI API at ${XAI_BASE_URL}: ${err.message}`, { cause: err });
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!response.ok) {
    throw new XaiError(describeHttpError(response.status, parsed), { status: response.status });
  }
  return parsed;
}

/**
 * Call the chat completions endpoint.
 *
 * @param {object} opts
 * @param {string} opts.prompt        User message.
 * @param {string} [opts.system]      Optional system prompt.
 * @param {string} [opts.model]       Model id; defaults to DEFAULT_MODEL.
 * @param {number} [opts.maxTokens]
 * @param {number} [opts.temperature]
 * @param {object} [opts.searchParameters] xAI `search_parameters` for Live Search.
 * @returns {Promise<{text: string, model: string, usage: object, citations: string[], finishReason: string|null}>}
 */
export async function chatCompletion({
  prompt,
  system,
  model,
  maxTokens,
  temperature,
  searchParameters,
  timeoutMs,
}) {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const body = { model: model || DEFAULT_MODEL, messages };
  if (Number.isFinite(maxTokens)) body.max_tokens = maxTokens;
  if (Number.isFinite(temperature)) body.temperature = temperature;
  if (searchParameters) body.search_parameters = searchParameters;

  const data = await xaiFetch('/chat/completions', { body, timeoutMs });
  const choice = data?.choices?.[0];
  const text = choice?.message?.content ?? '';

  return {
    text,
    model: data?.model || body.model,
    usage: data?.usage || {},
    // xAI returns citations at the top level when return_citations is enabled.
    citations: Array.isArray(data?.citations) ? data.citations : [],
    finishReason: choice?.finish_reason ?? null,
  };
}

/** List the models this API key can use. Handy when a model id stops resolving. */
export async function listModels() {
  const data = await xaiFetch('/models', { method: 'GET', body: null, timeoutMs: 30000 });
  return Array.isArray(data?.data) ? data.data.map((m) => m.id).filter(Boolean) : [];
}
