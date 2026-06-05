/**
 * Centralised configuration for the NATS / JetStream <-> Hermes.ai
 * agentic orchestration bridge.
 *
 * Everything is driven by environment variables so the same code runs
 * locally, in a standalone worker, and inside the Next.js runtime.
 */

const truthy = (v) => v === '1' || v === 'true' || v === 'yes';

export const natsConfig = {
  // Comma separated list of servers, e.g. "nats://localhost:4222,nats://localhost:4223"
  servers: (process.env.NATS_URL || 'nats://localhost:4222')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  // Authentication (any one of these may be set)
  token: process.env.NATS_TOKEN || undefined,
  user: process.env.NATS_USER || undefined,
  pass: process.env.NATS_PASS || undefined,
  // NKey / JWT credentials file (for NGS / Synadia Cloud)
  credsFile: process.env.NATS_CREDS || undefined,
  name: process.env.NATS_CLIENT_NAME || 'swami-markets',
};

export const streamConfig = {
  // JetStream stream that durably stores every orchestration message.
  name: process.env.NATS_STREAM || 'SWAMI_ORCHESTRATION',
  // Subject namespace. All orchestration traffic lives under this prefix.
  prefix: process.env.NATS_SUBJECT_PREFIX || 'swami.orchestration',
  // How long messages are retained (nanoseconds). Default: 7 days.
  maxAgeMs: Number(process.env.NATS_STREAM_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000),
};

// Convenience subject helpers — keeps subject strings in one place.
export const subjects = {
  // A new analysis/orchestration request enters the system here.
  jobs: `${streamConfig.prefix}.jobs`,
  // Completed Hermes runs are published here.
  results: `${streamConfig.prefix}.results`,
  // Failures / dead-letter.
  errors: `${streamConfig.prefix}.errors`,
  // Wildcard capturing everything for the stream definition.
  all: `${streamConfig.prefix}.>`,
  // Per-job result subject so callers can await a single run.
  resultFor: (jobId) => `${streamConfig.prefix}.results.${jobId}`,
};

export const hermesConfig = {
  baseUrl: (process.env.HERMES_API_URL || 'https://api.hermes.ai/v1').replace(/\/$/, ''),
  apiKey: process.env.HERMES_API_KEY || undefined,
  // Default agent / workflow that market-analysis jobs are routed to.
  defaultAgent: process.env.HERMES_AGENT_ID || 'swami-market-analyst',
  // Optional workspace / project scoping header.
  workspace: process.env.HERMES_WORKSPACE_ID || undefined,
  timeoutMs: Number(process.env.HERMES_TIMEOUT_MS || 60_000),
};

export const bridgeConfig = {
  // Durable JetStream consumer name used by the worker.
  durable: process.env.NATS_CONSUMER || 'hermes-bridge',
  // Max messages processed concurrently by the worker.
  concurrency: Number(process.env.BRIDGE_CONCURRENCY || 4),
  // Re-publish Hermes results back onto JetStream so other services can react.
  publishResults: !('BRIDGE_PUBLISH_RESULTS' in process.env) || truthy(process.env.BRIDGE_PUBLISH_RESULTS),
};

export function assertHermesConfigured() {
  if (!hermesConfig.apiKey) {
    throw new Error(
      'HERMES_API_KEY is not set. Add it to your environment (.env.local / worker env) ' +
        'to enable Hermes.ai agentic orchestration.'
    );
  }
}
