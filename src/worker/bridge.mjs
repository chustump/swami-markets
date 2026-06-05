#!/usr/bin/env node
/**
 * Swami Markets — NATS/JetStream ⇄ Hermes.ai orchestration bridge worker.
 *
 * Runs as a standalone long-lived process (serverless functions can't host a
 * persistent JetStream consumer). It:
 *   1. ensures the JetStream stream exists,
 *   2. consumes orchestration jobs durably,
 *   3. dispatches each job to a Hermes.ai agent,
 *   4. publishes the result back onto JetStream.
 *
 * Usage:
 *   node src/worker/bridge.mjs
 *
 * Requires env: NATS_URL, HERMES_API_URL, HERMES_API_KEY, HERMES_AGENT_ID.
 * See .env.example and docs/nats-jetstream-hermes.md.
 */

import { runBridge } from '../lib/orchestrator.js';
import { ensureStream, closeConnection } from '../lib/nats.js';
import { isHermesConfigured } from '../lib/hermes.js';
import { natsConfig, hermesConfig } from '../lib/config.js';

async function main() {
  console.log('[bridge] starting Swami Markets orchestration bridge');
  console.log(`[bridge] NATS servers: ${natsConfig.servers.join(', ')}`);
  console.log(`[bridge] Hermes API:   ${hermesConfig.baseUrl} (agent: ${hermesConfig.defaultAgent})`);

  if (!isHermesConfigured()) {
    console.error('[bridge] FATAL: HERMES_API_KEY is not set. Aborting.');
    process.exit(1);
  }

  await ensureStream();
  console.log('[bridge] JetStream stream ready.');

  const controller = new AbortController();
  const shutdown = async (sig) => {
    console.log(`[bridge] received ${sig}, draining...`);
    controller.abort();
    await closeConnection();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  await runBridge({ signal: controller.signal });
}

main().catch(async (err) => {
  console.error('[bridge] fatal error:', err);
  await closeConnection().catch(() => {});
  process.exit(1);
});
