// Retired framing still shows up in old decks and sequences. It sells a smaller
// product than the one Synadia takes to market, and it clashes with what the
// prospect sees on the site five minutes later.

export const SWAPS = [
  {
    id: "broker",
    retired: ["message broker", "message bus", "messaging system", "message-broker"],
    current: "Fabric, connectivity layer, nervous system",
    why: "Broker-to-broker is the wrong comparison. It's fabric versus a stack of workarounds.",
  },
  {
    id: "kafka-ops",
    retired: ["zookeeper", "broker babysitting", "kafka ops toil", "ops toil"],
    current: "Open on where the workload lives — Kafka pain is a symptom you surface in discovery, not the opener",
    why: "The pain is that Kafka assumes the data center. Lead with the architecture, not the toil.",
  },
  {
    id: "cost-lead",
    retired: ["confluent licensing", "licensing cost", "cheaper than confluent", "cut your kafka bill"],
    current: "Cost belongs in the business case after the architecture conversation",
    why: "Leading with price makes it procurement and caps the deal at the line item you're replacing.",
  },
  {
    id: "iot",
    retired: ["iot messaging", "edge messaging"],
    current: "Edge autonomy — the agent runs where the data is",
    why: "Edge is core narrative now, not a vertical.",
  },
  {
    id: "pubsub",
    retired: ["pub/sub at scale", "pubsub at scale"],
    current: "Coordination, not request stitching",
    why: "Pub/sub is a mechanism. Coordination is the outcome they're buying.",
  },
  {
    id: "multitenancy",
    retired: ["secure multi-tenancy", "multi-tenancy feature"],
    current: "Decentralized zero-trust security as a posture — and Synadia Protect as the named product",
    why: "A posture with a product behind it beats a feature bullet.",
  },
  {
    id: "monitoring",
    retired: ["monitoring", "metrics dashboard", "nats monitoring"],
    current: "Synadia Insights — entity-level navigation, time-travel diagnostics, 100+ expert-tuned checks",
    why: "Name the product. Insights observes; Protect enforces.",
  },
  {
    id: "oss-support",
    retired: ["open source nats plus support", "support contract", "support subscription"],
    current: "Five named products with distinct buyer stories",
    why: "\"Support contract\" prices the relationship as insurance.",
  },
];

export const BANNED = [
  "revolutionary",
  "game-changing",
  "game changing",
  "unparalleled",
  "best-in-class",
  "best in class",
  "cutting-edge",
  "next-generation",
  "next generation",
  "digital transformation",
  "synergies",
  "seamless",
  "world-class",
];

export const VOICE_RULES = [
  "Say \"agents, devices, and services\" — the triad keeps the story from collapsing into an AI-only pitch.",
  "Concrete over abstract: factory floor, vehicle, GPU, trust boundary.",
  "No hype adjectives on the technology. The claims carry themselves.",
  "Em-dash contrast sentences are a site habit — use them sparingly in email, where they read as AI-written.",
  "Open on a problem the buyer has, not on a Synadia product.",
  "One CTA per touch, matched to the buyer's stage.",
];

export const OUTBOUND_PATTERN = [
  { step: "Signal", body: "The specific, verifiable observation about their environment. Not \"I noticed you're...\" when the observation is generic." },
  { step: "Problem-awareness question", body: "From the discovery bank, phrased so they have to think rather than answer yes or no." },
  { step: "Peer proof", body: "A named public customer and the outcome." },
  { step: "Low-friction CTA", body: "A conversation, a report, an architecture review. Not a demo." },
];

export const OUTBOUND_RULE = "Four lines, in that order. Under 120 words. One CTA.";

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function checkLanguage(text) {
  const hits = [];
  if (!text || !text.trim()) return hits;
  for (const swap of SWAPS) {
    for (const term of swap.retired) {
      const re = new RegExp(`\\b${escapeRe(term)}\\b`, "gi");
      let m;
      while ((m = re.exec(text)) !== null) {
        hits.push({
          kind: "retired",
          term: m[0],
          index: m.index,
          current: swap.current,
          why: swap.why,
        });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }
  }
  for (const word of BANNED) {
    const re = new RegExp(`\\b${escapeRe(word)}\\b`, "gi");
    let m;
    while ((m = re.exec(text)) !== null) {
      hits.push({
        kind: "hype",
        term: m[0],
        index: m.index,
        current: "Cut it. Let the claim carry itself.",
        why: "Hype adjectives on the technology break the register the site uses.",
      });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  const words = text.trim().split(/\s+/).length;
  return hits.sort((a, b) => a.index - b.index).map((h) => ({ ...h, words }));
}

export function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
