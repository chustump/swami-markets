// Wire format for the tunnel. Every message an agent sends is ONE line:
//
//   SIDE|PROB|CONF|WHY        e.g.  LY|62|M|polls tightening, smart money still long
//
// SIDE: Y, N, LY (lean yes), LN (lean no), T (toss-up)
// PROB: integer 0-100, chance the answer is YES
// CONF: H, M, L
// WHY:  the single strongest piece of evidence, 15 words or fewer
//
// A line costs roughly 20 output tokens. The JSON the app used before costs 150+.

export const SYSTEM = `You are one of three forecasters sharing a line. Answer with exactly one line and nothing else:
SIDE|PROB|CONF|WHY
SIDE is Y, N, LY, LN or T. PROB is an integer 0-100, the chance of YES. CONF is H, M or L. WHY is your strongest evidence in 15 words or fewer.`;

const SIDES = new Set(['Y', 'N', 'LY', 'LN', 'T']);
const CONFS = new Set(['H', 'M', 'L']);
const WEIGHT = { H: 3, M: 2, L: 1 };

export function parseLine(text) {
  // Models sometimes wrap the line in prose or code fences; take the first line that fits.
  for (const raw of String(text || '').split('\n')) {
    const parts = raw.replace(/[`*]/g, '').trim().split('|');
    if (parts.length < 4) continue;
    const side = parts[0].trim().toUpperCase();
    const prob = parseInt(parts[1], 10);
    const conf = parts[2].trim().toUpperCase();
    const why = parts.slice(3).join('|').trim();
    if (!SIDES.has(side) || !CONFS.has(conf) || !(prob >= 0 && prob <= 100)) continue;
    return { side, prob, conf, why };
  }
  return null;
}

export function formatLine(m) {
  return `${m.side}|${m.prob}|${m.conf}|${m.why}`;
}

export function firstTurn(question) {
  return `Q: ${question}`;
}

// The second turn carries no history: the agent gets the question, its own last
// line and its peers' last lines. That is the whole shared state.
export function rebuttalTurn(question, own, peers) {
  const others = peers.map((p) => `${p.name}: ${formatLine(p.msg)}`).join('\n');
  return `Q: ${question}\nYou: ${formatLine(own)}\n${others}\nRevise or hold. One line.`;
}

export function spread(msgs) {
  const probs = msgs.map((m) => m.prob);
  return Math.max(...probs) - Math.min(...probs);
}

export function agrees(msgs, maxSpread) {
  if (msgs.length < 2) return true;
  const sameHalf = msgs.every((m) => m.prob >= 50) || msgs.every((m) => m.prob <= 50);
  return sameHalf && spread(msgs) <= maxSpread;
}

// The verdict is computed, not generated: no model is asked to summarize the others.
export function aggregate(entries) {
  const total = entries.reduce((s, e) => s + WEIGHT[e.msg.conf], 0);
  const prob = Math.round(entries.reduce((s, e) => s + e.msg.prob * WEIGHT[e.msg.conf], 0) / total);
  const gap = spread(entries.map((e) => e.msg));

  let side = 'TOSS-UP';
  if (prob >= 65) side = 'YES';
  else if (prob >= 55) side = 'LEAN YES';
  else if (prob <= 35) side = 'NO';
  else if (prob <= 45) side = 'LEAN NO';

  const avgWeight = total / entries.length;
  let confidence = 'Low';
  if (entries.length > 1 && gap <= 10 && avgWeight >= 2.5) confidence = 'High';
  else if (gap <= 20 && avgWeight >= 1.5) confidence = 'Medium';

  // Lead with the agent closest to the blended number.
  const lead = [...entries].sort(
    (a, b) => Math.abs(a.msg.prob - prob) - Math.abs(b.msg.prob - prob)
  )[0];
  const analysis = entries
    .map((e) => `${e.name} (${e.msg.prob}%, ${e.msg.conf}): ${e.msg.why}`)
    .join('\n');

  return { side, confidence, probability: `${prob}%`, reasoning: lead.msg.why, analysis, spread: gap };
}
