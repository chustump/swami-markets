/**
 * NATS + JetStream connection manager.
 *
 * Provides a lazily-initialised, shared connection and small helpers for
 * publishing/consuming orchestration messages with durable persistence.
 *
 * The `nats` package is imported dynamically so that importing this module
 * never crashes environments where the dependency or a broker isn't present
 * (e.g. a Netlify build step that only renders static pages).
 */

import { natsConfig, streamConfig, subjects } from './config.js';

let connectionPromise = null;
let codec = null;

/** JSON codec for encoding/decoding message payloads. */
async function getCodec() {
  if (!codec) {
    const { JSONCodec } = await import('nats');
    codec = JSONCodec();
  }
  return codec;
}

/**
 * Build the connection options object from config, loading credentials
 * from disk when a creds file is provided.
 */
async function buildConnectOptions() {
  const opts = {
    servers: natsConfig.servers,
    name: natsConfig.name,
    maxReconnectAttempts: -1, // reconnect forever
    reconnectTimeWait: 2000,
  };

  if (natsConfig.token) opts.token = natsConfig.token;
  if (natsConfig.user) opts.user = natsConfig.user;
  if (natsConfig.pass) opts.pass = natsConfig.pass;

  if (natsConfig.credsFile) {
    const { credsAuthenticator } = await import('nats');
    const { readFile } = await import('node:fs/promises');
    const creds = await readFile(natsConfig.credsFile);
    opts.authenticator = credsAuthenticator(new Uint8Array(creds));
  }

  return opts;
}

/**
 * Returns a shared NATS connection, establishing it on first use.
 * Concurrent callers share the same in-flight connection promise.
 */
export async function getConnection() {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      const { connect } = await import('nats');
      const opts = await buildConnectOptions();
      const nc = await connect(opts);
      // Surface async errors instead of swallowing them.
      (async () => {
        for await (const status of nc.status()) {
          if (status.type === 'disconnect' || status.type === 'error') {
            console.warn(`[nats] ${status.type}:`, status.data);
          }
        }
      })().catch(() => {});
      return nc;
    })().catch((err) => {
      connectionPromise = null; // allow retry on next call
      throw err;
    });
  }
  return connectionPromise;
}

/**
 * Ensures the orchestration JetStream stream exists (idempotent).
 * Safe to call on every startup.
 */
export async function ensureStream() {
  const nc = await getConnection();
  const jsm = await nc.jetstreamManager();
  const { RetentionPolicy, StorageType } = await import('nats');

  const cfg = {
    name: streamConfig.name,
    subjects: [subjects.all],
    retention: RetentionPolicy.Limits,
    storage: StorageType.File,
    max_age: streamConfig.maxAgeMs * 1_000_000, // ms -> ns
    num_replicas: 1,
  };

  try {
    await jsm.streams.add(cfg);
  } catch (err) {
    // Stream already exists — update it to keep config in sync.
    if (String(err?.message || '').includes('stream name already in use')) {
      await jsm.streams.update(streamConfig.name, cfg);
    } else {
      throw err;
    }
  }
  return streamConfig.name;
}

/**
 * Publish a JSON message to JetStream with at-least-once durability.
 * Returns the stream sequence + ack.
 */
export async function publish(subject, data, opts = {}) {
  const nc = await getConnection();
  const js = nc.jetstream();
  const sc = await getCodec();
  const ack = await js.publish(subject, sc.encode(data), opts);
  return { seq: ack.seq, stream: ack.stream, duplicate: ack.duplicate };
}

/**
 * Create (idempotently) a durable pull consumer and return it, ready for
 * `consumer.consume(...)`. Used by the long-running bridge worker.
 */
export async function getDurableConsumer(durable, filterSubject) {
  const nc = await getConnection();
  await ensureStream();
  const jsm = await nc.jetstreamManager();
  const { AckPolicy } = await import('nats');

  try {
    await jsm.consumers.add(streamConfig.name, {
      durable_name: durable,
      ack_policy: AckPolicy.Explicit,
      filter_subject: filterSubject || subjects.jobs,
      max_deliver: 5,
      ack_wait: 90 * 1_000_000_000, // 90s in ns
    });
  } catch (err) {
    if (!String(err?.message || '').includes('consumer name already in use')) {
      throw err;
    }
  }

  const js = nc.jetstream();
  return js.consumers.get(streamConfig.name, durable);
}

/**
 * Subscribe to a core (non-durable) subject and yield decoded messages.
 * Handy for awaiting a single job's result via request/reply-style flows.
 * Returns the subscription so the caller can `unsubscribe()`.
 */
export async function subscribe(subject, onMessage) {
  const nc = await getConnection();
  const sc = await getCodec();
  const sub = nc.subscribe(subject);
  (async () => {
    for await (const m of sub) {
      try {
        onMessage(sc.decode(m.data), m);
      } catch (err) {
        console.error('[nats] subscriber error:', err);
      }
    }
  })().catch((err) => console.error('[nats] subscription closed:', err));
  return sub;
}

/** Decode a JetStream/NATS message payload as JSON. */
export async function decode(msg) {
  const sc = await getCodec();
  return sc.decode(msg.data);
}

/** Gracefully drain and close the shared connection. */
export async function closeConnection() {
  if (connectionPromise) {
    try {
      const nc = await connectionPromise;
      await nc.drain();
    } finally {
      connectionPromise = null;
    }
  }
}
