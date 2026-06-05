/**
 * Hermes.ai agentic orchestration client.
 *
 * Thin, fetch-based wrapper around the Hermes.ai REST API for dispatching
 * tasks to agents/workflows and polling their runs. Mirrors the style of the
 * existing Anthropic calls in this codebase (plain fetch, env-driven config).
 *
 * Endpoints are kept configurable via HERMES_API_URL so this works against
 * Hermes.ai cloud, a self-hosted deployment, or a local mock during dev.
 */

import { hermesConfig, assertHermesConfigured } from './config.js';

function headers() {
  const h = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${hermesConfig.apiKey}`,
  };
  if (hermesConfig.workspace) h['X-Hermes-Workspace'] = hermesConfig.workspace;
  return h;
}

async function request(path, { method = 'GET', body, signal } = {}) {
  assertHermesConfigured();

  const controller = signal ? null : new AbortController();
  const timeout = controller
    ? setTimeout(() => controller.abort(), hermesConfig.timeoutMs)
    : null;

  try {
    const res = await fetch(`${hermesConfig.baseUrl}${path}`, {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
      signal: signal || controller?.signal,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const message = data?.error?.message || data?.message || `Hermes API error (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

/**
 * Dispatch a task to a Hermes agent/workflow for orchestration.
 *
 * @param {object} params
 * @param {string} [params.agent]   Agent or workflow id (defaults to config).
 * @param {object} params.input     Arbitrary task input handed to the agent.
 * @param {object} [params.metadata] Correlation metadata (e.g. jobId, source).
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<{runId: string, status: string, raw: object}>}
 */
export async function dispatchTask({ agent, input, metadata, signal } = {}) {
  const data = await request('/runs', {
    method: 'POST',
    body: {
      agent: agent || hermesConfig.defaultAgent,
      input,
      metadata,
    },
    signal,
  });

  // Be tolerant of minor response-shape differences across Hermes versions.
  const runId = data.run_id || data.id || data.runId;
  const status = data.status || 'queued';
  return { runId, status, raw: data };
}

/** Fetch the current state of a Hermes run. */
export async function getRun(runId, { signal } = {}) {
  const data = await request(`/runs/${encodeURIComponent(runId)}`, { signal });
  return {
    runId: data.run_id || data.id || runId,
    status: data.status,
    output: data.output ?? data.result ?? null,
    raw: data,
  };
}

const TERMINAL = new Set(['completed', 'succeeded', 'success', 'failed', 'error', 'cancelled', 'canceled']);

/**
 * Poll a Hermes run until it reaches a terminal state or times out.
 * Useful when a caller wants a synchronous result.
 */
export async function waitForRun(runId, { intervalMs = 1500, timeoutMs = hermesConfig.timeoutMs } = {}) {
  const deadline = Date.now() + timeoutMs;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const run = await getRun(runId);
    if (run.status && TERMINAL.has(String(run.status).toLowerCase())) {
      return run;
    }
    if (Date.now() > deadline) {
      const err = new Error(`Hermes run ${runId} did not finish within ${timeoutMs}ms`);
      err.lastStatus = run.status;
      throw err;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export function isHermesConfigured() {
  return Boolean(hermesConfig.apiKey);
}
