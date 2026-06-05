/**
 * Orchestrator — the glue between Swami Markets, NATS/JetStream, and Hermes.ai.
 *
 * Responsibilities:
 *   1. `enqueueJob`  — durably publish an orchestration job onto JetStream.
 *   2. `processJob`  — hand a single job to a Hermes agent and shape the result.
 *   3. `runBridge`   — long-running consumer that drains the jobs stream and
 *                      dispatches each job to Hermes, publishing results back.
 *
 * A "job" is the unit of agentic work. For Swami Markets this is typically a
 * market-analysis request (a question or a Polymarket/Kalshi pair) that we want
 * an agent on the Hermes platform to reason over.
 */

import { randomUUID } from 'node:crypto';
import { publish, getDurableConsumer, decode, ensureStream } from './nats.js';
import { dispatchTask, getRun } from './hermes.js';
import { subjects, bridgeConfig } from './config.js';

/**
 * Publish a new orchestration job to JetStream. Returns the job envelope
 * (including its generated id) so the caller can correlate the eventual result.
 *
 * @param {object} params
 * @param {('ask'|'analyze'|string)} params.kind  Job type.
 * @param {object} params.payload                  Task-specific data.
 * @param {string} [params.agent]                  Override the target Hermes agent.
 * @param {object} [params.metadata]               Extra correlation metadata.
 */
export async function enqueueJob({ kind, payload, agent, metadata } = {}) {
  if (!kind) throw new Error('enqueueJob: "kind" is required');

  await ensureStream();

  const job = {
    id: randomUUID(),
    kind,
    agent,
    payload: payload ?? {},
    metadata: { source: 'swami-markets', ...metadata },
    createdAt: new Date().toISOString(),
  };

  const ack = await publish(subjects.jobs, job, {
    // De-dupe identical re-submits within the JetStream duplicate window.
    msgID: job.id,
  });

  return { job, ack };
}

/**
 * Map a Swami job onto the input shape a Hermes agent expects.
 * Centralised so prompt/contract changes live in one spot.
 */
function buildAgentInput(job) {
  if (job.kind === 'analyze' && job.payload?.pair) {
    const { pair } = job.payload;
    return {
      task: 'market-analysis',
      topic: pair.topic,
      category: pair.cat,
      markets: {
        polymarket: pair.poly,
        kalshi: pair.kalshi,
        spreadCents: pair.spread,
      },
      instructions:
        'Analyze this cross-venue prediction market. Return side (YES/NO/LEAN YES/LEAN NO), ' +
        'confidence (High/Medium/Low), a one-sentence reasoning, and a structured analysis ' +
        'covering overview, sentiment, history, edge, and risks.',
    };
  }

  if (job.kind === 'ask' && job.payload?.question) {
    return {
      task: 'prediction',
      question: job.payload.question,
      instructions:
        'Act as "The Swami" prediction oracle. Return side, confidence, probability, ' +
        'a one-sentence reasoning, and a short analysis.',
    };
  }

  // Generic pass-through for custom job kinds.
  return { task: job.kind, ...job.payload };
}

/**
 * Process a single job: dispatch to Hermes and return a normalized result.
 * Does not touch NATS — callers decide whether to publish the result.
 */
export async function processJob(job, { wait = false } = {}) {
  const input = buildAgentInput(job);

  const dispatched = await dispatchTask({
    agent: job.agent,
    input,
    metadata: { jobId: job.id, kind: job.kind, ...job.metadata },
  });

  const result = {
    jobId: job.id,
    kind: job.kind,
    runId: dispatched.runId,
    status: dispatched.status,
    output: dispatched.raw?.output ?? null,
    dispatchedAt: new Date().toISOString(),
  };

  // Optionally fetch the run once (cheap status refresh) without long polling.
  if (wait && dispatched.runId) {
    const run = await getRun(dispatched.runId);
    result.status = run.status;
    result.output = run.output;
  }

  return result;
}

/**
 * Long-running bridge: consume jobs from JetStream and orchestrate them via
 * Hermes, publishing results (and errors) back onto JetStream.
 *
 * Intended to run as a standalone process (see src/worker/bridge.mjs), since
 * serverless functions can't host a persistent consumer.
 *
 * @param {object} [opts]
 * @param {AbortSignal} [opts.signal]  Abort to stop consuming.
 * @returns {Promise<void>} resolves when consumption stops.
 */
export async function runBridge({ signal } = {}) {
  const consumer = await getDurableConsumer(bridgeConfig.durable, subjects.jobs);
  const messages = await consumer.consume({ max_messages: bridgeConfig.concurrency });

  console.log(
    `[bridge] consuming "${subjects.jobs}" -> Hermes (concurrency=${bridgeConfig.concurrency})`
  );

  if (signal) {
    signal.addEventListener('abort', () => messages.stop(), { once: true });
  }

  for await (const m of messages) {
    let job;
    try {
      job = await decode(m);
    } catch (err) {
      console.error('[bridge] undecodable message, terminating:', err);
      m.term();
      continue;
    }

    try {
      const result = await processJob(job, { wait: true });
      if (bridgeConfig.publishResults) {
        await publish(subjects.resultFor(job.id), result);
        await publish(subjects.results, result);
      }
      m.ack();
      console.log(`[bridge] job ${job.id} (${job.kind}) -> run ${result.runId} [${result.status}]`);
    } catch (err) {
      console.error(`[bridge] job ${job?.id} failed:`, err.message);
      // Publish to the error subject for observability, then nak for retry.
      try {
        await publish(subjects.errors, {
          jobId: job?.id,
          kind: job?.kind,
          error: err.message,
          status: err.status,
          failedAt: new Date().toISOString(),
        });
      } catch (pubErr) {
        console.error('[bridge] failed to publish error:', pubErr.message);
      }
      // Redeliver with backoff; JetStream max_deliver caps the retries.
      m.nak(5000);
    }
  }

  console.log('[bridge] stopped consuming.');
}
