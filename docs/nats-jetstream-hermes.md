# NATS / JetStream ⇄ Hermes.ai Orchestration

This integration connects **Swami Markets** to a [NATS](https://nats.io)
JetStream message bus and the **Hermes.ai** agentic-AI orchestration platform.

Market-analysis requests become durable *jobs* on JetStream. A long-running
*bridge worker* drains those jobs and dispatches each one to a Hermes.ai agent,
then publishes the agent's result back onto the bus for any consumer to react to.

```
                 ┌──────────────┐   POST /api/orchestrate
   browser ─────▶│  Next.js API │──────────────┐
                 └──────────────┘               │ enqueueJob()
                                                ▼
                       ┌───────────────────────────────────────┐
                       │  NATS JetStream  (stream: SWAMI_ORCH…) │
                       │  subjects:                             │
                       │    swami.orchestration.jobs            │
                       │    swami.orchestration.results[.<id>]  │
                       │    swami.orchestration.errors          │
                       └───────────────────────────────────────┘
                            ▲ results            │ jobs
                            │                    ▼
                       ┌─────────────────────────────────────┐
                       │  Bridge worker (src/worker/bridge)   │
                       │  durable pull consumer "hermes-bridge"│
                       └─────────────────────────────────────┘
                                       │ dispatchTask()
                                       ▼
                            ┌────────────────────┐
                            │   Hermes.ai agent   │
                            │ (orchestration API) │
                            └────────────────────┘
```

## Components

| File | Purpose |
| --- | --- |
| `src/lib/config.js` | Env-driven configuration + subject helpers. |
| `src/lib/nats.js` | Shared NATS connection, JetStream stream/consumer, publish/subscribe. |
| `src/lib/hermes.js` | Hermes.ai REST client (`dispatchTask`, `getRun`, `waitForRun`). |
| `src/lib/orchestrator.js` | `enqueueJob`, `processJob`, and the `runBridge` loop. |
| `src/app/api/orchestrate/route.js` | HTTP endpoint to submit jobs / check runs. |
| `src/worker/bridge.mjs` | Standalone worker that bridges JetStream → Hermes. |

## Setup

1. Copy env vars: `cp .env.example .env.local` and fill in `HERMES_API_KEY`
   (and `NATS_URL` if not local).
2. Install deps: `npm install`.
3. Start a NATS server with JetStream (local dev):
   ```bash
   docker run -p 4222:4222 nats:latest -js
   # or:  nats-server -js
   ```
4. Start the app: `npm run dev`.
5. Start the bridge worker (separate process / host):
   ```bash
   npm run worker:bridge
   ```

## Usage

### Enqueue a job (default — handled asynchronously by the worker)

```bash
curl -X POST http://localhost:3000/api/orchestrate \
  -H 'Content-Type: application/json' \
  -d '{
    "kind": "ask",
    "payload": { "question": "Will BTC close above $100k in 2026?" }
  }'
# → { "jobId": "...", "enqueued": true, "stream": "SWAMI_ORCHESTRATION", "seq": 12 }
```

Analyze a cross-venue pair:

```bash
curl -X POST http://localhost:3000/api/orchestrate \
  -H 'Content-Type: application/json' \
  -d '{
    "kind": "analyze",
    "payload": { "pair": {
      "topic": "Fed cuts rates in March",
      "cat": "Economics",
      "poly":   { "yes": 0.62, "vol": "1.2M" },
      "kalshi": { "yes": 0.58, "vol": "800K" },
      "spread": 4
    }}
  }'
```

### Dispatch synchronously (also returns the Hermes run id)

```bash
curl -X POST http://localhost:3000/api/orchestrate \
  -H 'Content-Type: application/json' \
  -d '{ "kind": "ask", "mode": "dispatch",
        "payload": { "question": "..." } }'
```

### Check a run's status / output

```bash
curl 'http://localhost:3000/api/orchestrate?runId=<runId>'
```

### React to results from any service

Subscribe to `swami.orchestration.results` (all) or
`swami.orchestration.results.<jobId>` (one job) on JetStream — results are
durable and replayable.

## Notes

- The bridge worker is **not** deployed to Netlify; serverless functions can't
  host a persistent consumer. Run it on any always-on Node host (Fly.io,
  Railway, a VM, a container, etc.).
- The Hermes request/response shapes are read defensively (`run_id`/`id`,
  `output`/`result`) so the client tolerates minor API-version differences.
  Adjust `src/lib/hermes.js` to match your Hermes.ai deployment if needed.
- Jobs are de-duplicated within JetStream's duplicate window via the job id as
  `msgID`, and failed jobs are retried (`max_deliver: 5`) with a dead-letter
  publish to `swami.orchestration.errors`.
