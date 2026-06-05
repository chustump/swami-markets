import { NextResponse } from 'next/server';
import { enqueueJob, processJob } from '@/lib/orchestrator';
import { getRun, isHermesConfigured } from '@/lib/hermes';

// JetStream + Hermes need the Node.js runtime (TCP sockets), not the Edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/orchestrate
 *
 * Submit an agentic orchestration job. The job is durably persisted on
 * NATS JetStream and routed to a Hermes.ai agent.
 *
 * Body:
 *   {
 *     "kind": "ask" | "analyze" | "<custom>",
 *     "payload": { ... },          // e.g. { question } or { pair }
 *     "agent": "optional-agent-id",
 *     "mode": "enqueue" | "dispatch"   // default "enqueue"
 *   }
 *
 * mode "enqueue"  -> publish to JetStream, let the bridge worker handle it.
 * mode "dispatch" -> publish AND immediately dispatch to Hermes, returning the run.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { kind, payload, agent, metadata, mode = 'enqueue' } = body;

    if (!kind) {
      return NextResponse.json({ error: '"kind" is required' }, { status: 400 });
    }

    const { job, ack } = await enqueueJob({ kind, payload, agent, metadata });

    if (mode === 'dispatch') {
      if (!isHermesConfigured()) {
        return NextResponse.json(
          {
            jobId: job.id,
            enqueued: true,
            stream: ack.stream,
            seq: ack.seq,
            warning:
              'Job persisted to JetStream, but HERMES_API_KEY is not set so it was not dispatched. ' +
              'Start the bridge worker once Hermes is configured.',
          },
          { status: 202 }
        );
      }
      const result = await processJob(job, { wait: false });
      return NextResponse.json({ jobId: job.id, enqueued: true, seq: ack.seq, ...result }, { status: 202 });
    }

    return NextResponse.json(
      { jobId: job.id, kind: job.kind, enqueued: true, stream: ack.stream, seq: ack.seq },
      { status: 202 }
    );
  } catch (error) {
    console.error('Orchestrate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/orchestrate?runId=...
 * Check the status/output of a previously dispatched Hermes run.
 */
export async function GET(request) {
  try {
    const runId = new URL(request.url).searchParams.get('runId');
    if (!runId) {
      return NextResponse.json({ error: 'runId query param required' }, { status: 400 });
    }
    if (!isHermesConfigured()) {
      return NextResponse.json({ error: 'HERMES_API_KEY is not configured' }, { status: 503 });
    }
    const run = await getRun(runId);
    return NextResponse.json(run);
  } catch (error) {
    console.error('Orchestrate status error:', error);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
