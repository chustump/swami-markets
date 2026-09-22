// Everything here is publicly stated on synadia.com, so it is safe to say to a stranger.
// Nothing outside this file gets asserted as a public proof point without checking first.

export const METRICS = [
  { label: "NATS downloads", value: "450M+", useWhen: "An economic buyer who is skeptical of a small vendor." },
  { label: "Contributors", value: "1,000+", useWhen: "An engineering audience assessing project risk." },
  { label: "Client libraries", value: "45+", useWhen: "The objection is \"our stack is polyglot.\"" },
  { label: "GitHub stars (nats-io)", value: "41K+", useWhen: "An engineering audience assessing project risk." },
  { label: "NATS Slack members", value: "11K+", useWhen: "The concern is \"who do we ask when it breaks at 2am.\"" },
];

export const METRIC_RULE = "Use one or two, never all of them. A wall of stats reads as insecurity.";

export const CUSTOMERS = [
  { name: "NVIDIA", segment: "AI infrastructure", tags: ["ai", "platform", "gpu"] },
  { name: "Replit", segment: "Developer platforms", tags: ["ai", "platform", "saas"] },
  { name: "Browserbase", segment: "AI infrastructure", tags: ["ai", "platform"] },
  { name: "Rivian", segment: "Automotive and autonomy", tags: ["edge", "industrial", "auto"] },
  { name: "May Mobility", segment: "Automotive and autonomy", tags: ["edge", "auto"] },
  { name: "Mastercard", segment: "Financial services", tags: ["finserv", "security"] },
  { name: "OutSystems", segment: "Enterprise software / low-code", tags: ["saas", "platform"] },
  { name: "Uniphore", segment: "Conversational AI", tags: ["ai", "saas"] },
  { name: "Verrus", segment: "Data centers / critical infrastructure", tags: ["edge", "industrial"] },
];

export const NVIDIA_STORY = {
  headline: "NVIDIA Cloud Functions runs on a Synadia-managed NATS supercluster.",
  body:
    "It queues and routes inference requests across multiple regions. JetStream is the durable, low-latency work queue that decouples bursty HTTP/gRPC traffic from expensive GPU capacity — which is what makes scale-to-zero, multi-region failover, and clean per-function isolation possible.",
  whyItWorks:
    "Named, technically specific, and the mechanism — decouple bursty ingress from scarce expensive compute — transfers to almost any GPU or inference workload.",
  link: "synadia.com/blog/scaling-global-ai-inference-with-nats-jetstream",
  guardrail: "Don't extend it. No invented throughput numbers, cost savings, or contract details.",
};

export const ASSETS = [
  {
    id: "edge-gap",
    name: "The Edge Autonomy Gap",
    what: "Research report, 500 practitioners, on why the edge isn't ready for AI.",
    url: "synadia.com/research-reports/edge-autonomy-gap",
    useAs: "No-commitment first touch for industrial, automotive, energy, logistics, and any edge-heavy prospect. Sending a study is far easier to say yes to than a meeting.",
    stage: "First touch",
  },
  {
    id: "edge-benchmark",
    name: "Edge autonomy benchmark",
    what: "Self-assessment that produces an autonomy score in about two minutes.",
    url: "synadia.com/research-reports/edge-autonomy-benchmark",
    useAs: "Second touch, or something a champion can run internally so the internal conversation happens without you in the room.",
    stage: "Second touch",
  },
  {
    id: "living-edge",
    name: "Living on the Edge",
    what: "Technical guide on edge-to-core messaging patterns.",
    url: "synadia.com/technical-guides/living-on-the-edge",
    useAs: "The follow-up you send an architect after a first call went technical.",
    stage: "Post first call",
  },
  {
    id: "comparisons",
    name: "NATS vs Kafka / NATS vs Kinesis",
    what: "Comparison pages.",
    url: "synadia.com",
    useAs: "Mid-funnel, once a displacement evaluation is real. Sending a comparison cold frames you as the challenger before the buyer has decided anything is wrong.",
    stage: "Mid-funnel",
  },
  {
    id: "sdks",
    name: "Agent SDKs",
    what: "npm i @synadia-ai/agents · pip install synadia-ai-agents · github.com/synadia-ai/synadia-agents. Plugins for six harnesses out of the box — Claude Code, OpenClaw, PI, Hermes, OpenAgent, DSPy — plus a three-episode tutorial series.",
    url: "github.com/synadia-ai/synadia-agents",
    useAs: "The CTA for a hands-on AI engineer. \"Clone the repo, the agents are already wired together\" converts better than a meeting request with that audience.",
    stage: "Technical champion",
  },
  {
    id: "education",
    name: "Synadia Education",
    what: "Live NATS training from the experts.",
    url: "synadia.com/education",
    useAs: "Expansion motion, and the answer when the concern is \"our team doesn't know NATS.\"",
    stage: "Expansion",
  },
  {
    id: "rethinkconn",
    name: "RethinkConn 2026",
    what: "The flagship NATS event.",
    url: "synadia.com",
    useAs: "A relationship CTA for customers and warm prospects, and a reason to re-engage a stalled deal without a fake pretext.",
    stage: "Re-engage",
  },
];

export const QUOTES = [
  "The nervous system for agentic AI.",
  "HTTP is the WiFi of distributed systems — it works, but you wouldn't make it the backbone of a mission-critical system.",
  "We're not shipping the meta agent. We're shipping the fabric every meta agent will run on.",
  "The patterns that got us to the cloud won't get us past it.",
  "The agent runs where the data is.",
  "Coordination, not request stitching.",
  "Derek Collison, Founder & CEO: discovery, coordination, and communication will be the next evolution of agentic AI.",
];

export const NATS_STACK = [
  { layer: "Core", what: "Fire-and-forget messaging. Route by subject, not by endpoint — no discovery service, no DNS games. Pub/sub and many-to-many by default, so subscribers get added without touching producers. Request/reply and queue groups are built in." },
  { layer: "JetStream", what: "Streaming with delivery guarantees." },
  { layer: "Data stores", what: "Key-value and object storage built on JetStream." },
  { layer: "Clustering", what: "Leaf node or supercluster, from the same ~20 MB binary." },
  { layer: "Security", what: "Built-in authentication, authorization, and multi-tenancy." },
];

export const AGENTIC_OPS = [
  { surface: "Telemetry", line: "Live awareness, end to end. Telemetry, commands, and control loops on one wire, in real time — the same primitive from cloud to factory floor." },
  { surface: "Eventing", line: "Coordination, not request stitching. Pub/sub, work queues, and durable execution, built for handoff rather than request/response patched together with retries." },
  { surface: "Query", line: "Answers assembled, not retrieved. Hierarchical KV bakes ontology into the fabric, so context lookups behave like execution rather than REST calls." },
  { surface: "Edge", line: "Same primitives, every layer. One identity model, one wire format, one security posture. The agent runs where the data is." },
];

export const FABRIC_PROPERTIES = [
  "Connectivity that spans cloud to factory floor.",
  "Identity for every agent type and every running instance.",
  "Durable state and handoff, built in.",
  "An audit trail of every interaction, on by default.",
  "Zero-trust security, end to end.",
];

export function customersFor(tag) {
  const hit = CUSTOMERS.filter((c) => c.tags.includes(tag));
  return hit.length ? hit : CUSTOMERS.slice(0, 3);
}
