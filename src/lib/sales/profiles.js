// The deal profile drives every script in the tree. Swap it on the Deal page
// before a call and the whole tree speaks about the right account.

export const AGENTIC_PROFILE = {
  id: "agentic",
  name: "Multi-cloud AI platform",
  rep: "I",
  company: "the team",
  industry: "AI infrastructure",
  persona: "AI / ML engineering lead",
  useCase: "fleets of agents split across two clouds",
  incumbent: "HTTP APIs, a gateway, and a queue bolted on",
  product: "platform",
  productName: "Synadia Platform",
  productLine: "Single-tenant, fully managed NATS in your cloud.",
  secondProduct: "Synadia Insights",
  proof: "Replit and Browserbase",
  proofStory:
    "They both hit the seam where one agent hands work to another across clouds, and ended up putting one fabric underneath instead of stitching the two sides together at the API layer",
  metric: "45+ client libraries",
  cta: "a 45-minute architecture review with your architect in the room",
  pillars: [
    {
      title: "Discovery and addressing",
      problem: "every new agent needs DNS, a gateway rule, and someone to tell it where the others live",
      process:
        "subject-based addressing means anything can talk to anything without knowing where it lives, how many instances exist, or whether it's online yet",
      outcome: "adding the tenth agent costs what adding the second one did",
    },
    {
      title: "State and handoff",
      problem: "when the receiving agent is down, the work and its context are gone",
      process:
        "JetStream gives you durable work queues, key-value and object storage on the same protocol, so handoff survives the receiver being offline",
      outcome: "a hand-off you can replay and audit instead of a retry loop you hope about",
    },
    {
      title: "Identity on the wire",
      problem: "agent credentials are static, long-lived, and nobody can revoke one quickly",
      process:
        "cryptographic identity for every agent type and every running instance, with time-boxed permissions and instant revocation",
      outcome: "you can answer what every agent did in the last hour, and shut one off in seconds",
    },
  ],
};

export const EDGE_PROFILE = {
  id: "edge",
  name: "Industrial / edge estate",
  rep: "I",
  company: "the team",
  industry: "manufacturing and industrial",
  persona: "Platform / infrastructure lead",
  useCase: "analytics and control logic on plant sites with unreliable uplinks",
  incumbent: "MQTT into a central broker, with a Kafka cluster behind it",
  product: "platform",
  productName: "Synadia Platform",
  productLine: "Single-tenant, fully managed NATS in your cloud, with leaf nodes at every site.",
  secondProduct: "Synadia Deploy for Kubernetes",
  proof: "Rivian and May Mobility",
  proofStory:
    "Both run workloads on hardware that moves, where the link is not a given and the local decision still has to happen",
  metric: "the same 20 MB binary from a cloud region down to a device",
  cta: "the Edge Autonomy Gap study — 500 practitioners on why the edge isn't ready for AI",
  pillars: [
    {
      title: "Edge autonomy",
      problem: "when a site loses its uplink, the local logic queues and waits instead of deciding",
      process:
        "leaf nodes run the same primitives locally and reconcile when the link comes back — one identity model, one wire format, one security posture",
      outcome: "the site keeps making decisions during the outage, and nothing is lost when it reconnects",
    },
    {
      title: "One protocol, cloud to floor",
      problem: "MQTT at the device, Kafka in the middle, REST on top — three security models and three failure modes",
      process:
        "the same protocol runs from a cloud region down to a 20 MB binary on the hardware, with pub/sub, request/reply, streams, and KV in it",
      outcome: "one thing to operate, one thing to secure, one thing to reason about at 2am",
    },
    {
      title: "See it and enforce it",
      problem: "you find out a site is degraded when the plant calls you",
      process:
        "Insights gives entity-level navigation and time-travel diagnostics across sites; Protect enforces policy per connection, including network-range rules on leaf nodes",
      outcome: "you see the slow site before the plant does, and you can prove what each site was allowed to do",
    },
  ],
};

export const DISPLACEMENT_PROFILE = {
  id: "displacement",
  name: "Kafka estate under strain",
  rep: "I",
  company: "the team",
  industry: "enterprise platform engineering",
  persona: "Platform / infrastructure lead",
  useCase: "a Kafka estate that keeps growing outside the data center",
  incumbent: "Kafka, plus connectors and a second cluster per tenant",
  product: "platform",
  productName: "Synadia Platform",
  productLine: "Single-tenant, fully managed NATS in your cloud.",
  secondProduct: "Synadia Insights",
  proof: "OutSystems and Mastercard",
  proofStory:
    "Both kept the log where a log belongs and put one fabric underneath everything that has to move",
  metric: "450M+ NATS downloads",
  cta: "a working session on the one workload that hurts most today",
  pillars: [
    {
      title: "Keep the log, move the rest",
      problem: "Kafka is being asked to do request/reply, key-value, and per-tenant isolation because it's what's there",
      process:
        "NATS goes in alongside — a leaf node next to the existing broker, one subject tree, one workload — and takes the patterns Kafka wasn't built for",
      outcome: "analytics stays on Kafka; everything that has to move gets a layer designed for it",
    },
    {
      title: "Isolation without another cluster",
      problem: "every new tenant or environment means another cluster and another thing to operate",
      process: "accounts give you multi-tenancy in the protocol, and Protect enforces policy on every connection and message",
      outcome: "tenants get isolation without the infrastructure multiplying behind them",
    },
    {
      title: "Operations you don't staff",
      problem: "a meaningful slice of the team's week goes to operating the messaging layer instead of building on it",
      process: "single-tenant managed operation in your own cloud account, plus 100+ expert-tuned checks and time-travel diagnostics",
      outcome: "the team's week goes back to the product",
    },
  ],
};

export const SECURITY_PROFILE = {
  id: "security",
  name: "Zero-trust / audit mandate",
  rep: "I",
  company: "the team",
  industry: "regulated enterprise",
  persona: "Security / architecture",
  useCase: "workloads and agents running outside the perimeter",
  incumbent: "perimeter controls, static service credentials, and API-gateway logs",
  product: "protect",
  productName: "Synadia Protect",
  productLine: "A security gateway for NATS. Enforce policy on every connection and message.",
  secondProduct: "Synadia Platform",
  proof: "Mastercard",
  proofStory: "A regulated environment where the controls have to be provable, not described",
  metric: "audit events streamed to your SIEM with no application changes",
  cta: "a controls walkthrough with your security architect, against trust.synadia.com",
  pillars: [
    {
      title: "Identity per agent, not per service account",
      problem: "credentials are static, shared, and slow to revoke",
      process: "cryptographic identity with time-boxed permissions for every agent type and every running instance",
      outcome: "revocation in seconds instead of a credential rotation project",
    },
    {
      title: "Enforcement on the wire",
      problem: "policy lives in application code, so proving it means reading code",
      process:
        "signed policy bundles applied per port, default-deny baselines, payload inspection, network-range restrictions on leaf nodes, time-window rules",
      outcome: "controls enforced in one place, with live allow, deny and suspend counters",
    },
    {
      title: "Audit without a refactor",
      problem: "you have logs of API calls at the edge, not of what agents did to each other",
      process: "an audit trail of every interaction, on by default, streamed to your SIEM — with no application changes",
      outcome: "the security review stops being the thing that blocks the rollout",
    },
  ],
};

export const PROFILE_TEMPLATES = [
  AGENTIC_PROFILE,
  EDGE_PROFILE,
  DISPLACEMENT_PROFILE,
  SECURITY_PROFILE,
];

export const DEFAULT_PROFILE = AGENTIC_PROFILE;
