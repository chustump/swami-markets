const FALLBACKS = {
  prospect: "there",
  rep: "I",
  company: "the team",
  persona: "the team",
  industry: "your space",
  useCase: "what you're building",
  incumbent: "what's there today",
  product: "Synadia Platform",
  productLine: "managed NATS in your cloud",
  secondProduct: "Synadia Insights",
  proof: "a customer in your space",
  proofStory: "They hit the same seam and put one fabric underneath it",
  metric: "450M+ NATS downloads",
  cta: "an architecture review with your architect in the room",
  outcome: "what you're trying to get live",
  situation: "what's running today",
  stack: "the incumbent",
  problem: "the seam you described",
  impact: "what it's costing you",
  whoFeels: "the people carrying it",
  howLong: "as long as you've had it",
  tried: "what you've already tried",
  failedWhy: "why that didn't hold",
  scale: "where you said you are",
  desired: "the version you described",
  consequence: "another year on the same architecture",
  whyNow: "what's driving the timing",
  committed: "the change you said you're open to",
  ideal: "the criteria you gave me",
  funding: "wherever this would be funded from",
  decision: "the path you described",
  lastObjection: "that concern",
  nextStep: "the next step",
};

function pick(value, key) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (trimmed) return trimmed;
  return FALLBACKS[key] ?? "";
}

export function buildMap(profile, notes) {
  const n = notes || {};
  const map = {
    prospect: pick(n.prospect, "prospect"),
    rep: pick(profile.rep, "rep"),
    company: pick(n.company || profile.company, "company"),
    persona: pick(n.persona || profile.persona, "persona"),
    industry: pick(profile.industry, "industry"),
    useCase: pick(profile.useCase, "useCase"),
    incumbent: pick(n.stack || profile.incumbent, "incumbent"),
    product: pick(profile.productName, "product"),
    productLine: pick(profile.productLine, "productLine"),
    secondProduct: pick(profile.secondProduct, "secondProduct"),
    proof: pick(profile.proof, "proof"),
    proofStory: pick(profile.proofStory, "proofStory"),
    metric: pick(profile.metric, "metric"),
    cta: pick(profile.cta, "cta"),
  };
  for (const key of Object.keys(FALLBACKS)) {
    if (key in map) continue;
    map[key] = pick(n[key], key);
  }
  const pillars = profile.pillars || [];
  for (let i = 0; i < 3; i++) {
    const p = pillars[i] || {};
    map[`p${i + 1}title`] = p.title || `Pillar ${i + 1}`;
    map[`p${i + 1}problem`] = p.problem || "the problem this solves";
    map[`p${i + 1}process`] = p.process || "what we do about it";
    map[`p${i + 1}outcome`] = p.outcome || "what changes for you";
  }
  return map;
}

export function interpolate(script, profile, notes) {
  if (!script) return "";
  const map = buildMap(profile, notes);
  return script.replace(/\{([a-zA-Z0-9]+)\}/g, (_, key) => map[key] ?? `{${key}}`);
}

export const TOKEN_HELP = [
  ["{prospect}", "the person"],
  ["{company}", "their company"],
  ["{useCase}", "what they're building"],
  ["{incumbent}", "what's carrying it today"],
  ["{outcome}", "destination from discovery"],
  ["{problem}", "the seam from discovery"],
  ["{proof}", "named public customer"],
  ["{cta}", "the next step you'll ask for"],
  ["{p1title}…{p3outcome}", "the three pillars"],
];
