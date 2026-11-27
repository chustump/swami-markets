import {
  SYSTEM,
  parseLine,
  formatLine,
  firstTurn,
  rebuttalTurn,
  agrees,
  aggregate,
} from './protocol.js';

// How the tunnel keeps token use low:
//  1. Agents exchange one-line messages (see protocol.js), never prose.
//  2. Round 1 runs in parallel and each agent sees only the question.
//  3. If the answers already agree, it stops there: three small calls in total.
//  4. If they disagree, there is exactly one more round, and each agent gets only
//     its peers' latest lines, not a transcript.
//  5. The final verdict is arithmetic over the lines. No model writes a summary.
//  6. Repeat questions are served from a cache and cost nothing.

const cache = new Map();

function cacheKey(question) {
  return question.toLowerCase().replace(/\s+/g, ' ').trim();
}

async function round(id, n, agents, turnFor, trace, ledger) {
  const settled = await Promise.allSettled(
    agents.map(async (agent) => {
      const out = await agent.ask(SYSTEM, turnFor(agent));
      ledger.in += out.tokensIn;
      ledger.out += out.tokensOut;
      ledger.calls += 1;
      const msg = parseLine(out.text);
      if (!msg) throw new Error(`${agent.name}: reply was not in tunnel format`);
      return { name: agent.name, agent, msg };
    })
  );
  const ok = [];
  settled.forEach((s, i) => {
    // Subjects follow NATS naming, so the trace can be published to a bus unchanged.
    const subject = `tunnel.${id}.r${n}.${agents[i].name.toLowerCase()}`;
    if (s.status === 'fulfilled') {
      ok.push(s.value);
      trace.push({ subject, line: formatLine(s.value.msg) });
    } else {
      trace.push({ subject, error: s.reason.message });
    }
  });
  return ok;
}

export async function runTunnel(question, agents, opts = {}) {
  const maxSpread = opts.maxSpread ?? 15;
  const ttlMs = opts.ttlMs ?? 10 * 60 * 1000;
  const now = opts.now ?? Date.now;

  const key = cacheKey(question);
  const hit = cache.get(key);
  if (hit && hit.expires > now()) {
    return { ...(await hit.promise), cached: true };
  }

  // Storing the promise means two identical questions in flight share one run.
  const promise = (async () => {
    if (!agents.length) throw new Error('No tunnel agents are configured');
    const id = Math.random().toString(36).slice(2, 8);
    const trace = [];
    const ledger = { in: 0, out: 0, calls: 0 };

    let entries = await round(id, 1, agents, () => firstTurn(question), trace, ledger);
    if (!entries.length) throw new Error(trace.map((t) => t.error).join('; '));

    let rounds = 1;
    if (!agrees(entries.map((e) => e.msg), maxSpread)) {
      rounds = 2;
      const first = entries;
      const second = await round(
        id,
        2,
        first.map((e) => e.agent),
        (agent) => {
          const own = first.find((e) => e.agent === agent);
          const peers = first.filter((e) => e.agent !== agent);
          return rebuttalTurn(question, own.msg, peers);
        },
        trace,
        ledger
      );
      // An agent that failed in round 2 keeps its round 1 line.
      entries = first.map((e) => second.find((s) => s.agent === e.agent) || e);
    }

    return {
      ...aggregate(entries),
      agents: entries.map((e) => e.name),
      rounds,
      tokens: { ...ledger, total: ledger.in + ledger.out },
      trace,
      cached: false,
    };
  })();

  cache.set(key, { promise, expires: now() + ttlMs });
  try {
    return await promise;
  } catch (err) {
    cache.delete(key);
    throw err;
  }
}

export function clearTunnelCache() {
  cache.clear();
}
