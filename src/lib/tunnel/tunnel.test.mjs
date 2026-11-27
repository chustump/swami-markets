import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLine } from './protocol.js';
import { runTunnel, clearTunnelCache } from './tunnel.js';

// A fake agent that replies with scripted lines, one per call.
function fake(name, lines) {
  const seen = [];
  let i = 0;
  return {
    name,
    seen,
    async ask(_system, user) {
      seen.push(user);
      const text = lines[Math.min(i++, lines.length - 1)];
      if (text instanceof Error) throw text;
      return { text, tokensIn: 50, tokensOut: 20 };
    },
  };
}

test('parseLine accepts the wire format and rejects prose', () => {
  assert.deepEqual(parseLine('LY|62|M|polls tightening'), {
    side: 'LY',
    prob: 62,
    conf: 'M',
    why: 'polls tightening',
  });
  assert.deepEqual(parseLine('Sure!\n`y|70|h|a|b`').why, 'a|b');
  assert.equal(parseLine('I think yes, about 70%'), null);
  assert.equal(parseLine('Y|140|H|too high'), null);
});

test('agreement ends the run after one round', async () => {
  clearTunnelCache();
  const agents = [
    fake('Muse', ['Y|70|M|a']),
    fake('Grok', ['Y|66|H|b']),
    fake('Claude', ['LY|62|M|c']),
  ];
  const r = await runTunnel('Will it rain?', agents);
  assert.equal(r.rounds, 1);
  assert.equal(r.tokens.calls, 3);
  assert.equal(r.probability, '66%');
  assert.equal(r.side, 'YES');
});

test('disagreement triggers one rebuttal round carrying only peer lines', async () => {
  clearTunnelCache();
  const agents = [
    fake('Muse', ['Y|80|H|a', 'LY|60|M|a2']),
    fake('Grok', ['N|30|M|b', 'LY|55|M|b2']),
    fake('Claude', ['T|50|L|c', 'LY|58|M|c2']),
  ];
  const r = await runTunnel('Will X win?', agents);
  assert.equal(r.rounds, 2);
  assert.equal(r.tokens.calls, 6);
  assert.equal(r.probability, '58%');
  assert.equal(agents[1].seen[1], 'Q: Will X win?\nYou: N|30|M|b\nMuse: Y|80|H|a\nClaude: T|50|L|c\nRevise or hold. One line.');
});

test('a failing agent is dropped and repeats are served from cache', async () => {
  clearTunnelCache();
  const agents = [fake('Muse', [new Error('down')]), fake('Grok', ['N|20|H|b'])];
  const r = await runTunnel('Will Y happen?', agents);
  assert.deepEqual(r.agents, ['Grok']);
  assert.equal(r.side, 'NO');

  const again = await runTunnel('  will y HAPPEN? ', agents);
  assert.equal(again.cached, true);
  assert.equal(agents[1].seen.length, 1);
});
