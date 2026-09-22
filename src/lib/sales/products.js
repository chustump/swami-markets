// Source: synadia.com product navigation, per the Synadia talk track (verified 2026-08-27).
// Attach capabilities to the right product. Insights observes; Protect enforces.

export const PRODUCTS = [
  {
    id: "cloud",
    name: "Synadia Cloud",
    line: "Multi-tenant, hosted NATS. Build quickly with NATS, don't operate it.",
    detail:
      "Start building on NATS in minutes. The fast lane to production, with no NATS system to deploy, operate, or upgrade.",
    buyer: "Developers and small platform teams who want to be productive today.",
    leadWhen: "Speed to a first workload, a POC, or a team weighing NATS against a managed cloud service.",
    dontLead: "Not for a regulated enterprise that needs single-tenant in their own account — that's Platform.",
    expansion: "Lands with a developer, expands to Platform when the workload goes to production.",
  },
  {
    id: "platform",
    name: "Synadia Platform",
    line: "Single-tenant, fully managed NATS in your cloud. Enterprise control without operating it yourself.",
    detail:
      "Partner with the NATS experts. Enterprises choose Synadia Platform to operate intelligent systems that sense, decide, and act in real time. Runs in the customer's own AWS, Azure, or Google Cloud account.",
    buyer: "Enterprises with a production workload, a compliance posture, and an infra team that would rather not become NATS operators.",
    leadWhen: "NATS already in production, a regulated environment, data residency rules, or an internal platform team serving other teams.",
    dontLead: "Not for a developer trying to ship something this quarter.",
    expansion: "The anchor. Insights and Protect attach to it.",
  },
  {
    id: "deploy",
    name: "Synadia Deploy for Kubernetes",
    line: "Self-serve NATS and Synadia Platform deployment for Kubernetes environments.",
    detail: "NATS deployed the way everything else in the estate is deployed.",
    buyer: "Platform engineering teams already standardized on Kubernetes.",
    leadWhen: "They say \"we run everything on K8s\" or the evaluation is run by a platform team with an existing GitOps workflow.",
    dontLead: "Not a story for a security or AI buyer.",
    expansion: "Attaches wherever the deployment model demands it.",
  },
  {
    id: "insights",
    name: "Synadia Insights",
    line: "Granular, NATS-native observability including 100+ audit checks from our experts.",
    detail:
      "Entity-level navigation, time-travel diagnostics, and 100+ expert-tuned checks. Live cluster state — connections, slow consumers, throughput, messages per second — an overall grade, and a status timeline of events like slow consumers, connection count changes, high CPU, high gateway RTT, stale connections. Navigable by connection, leaf node, stream, KV store, object store, account.",
    buyer: "Whoever gets paged. SRE, platform ops, the engineer who owns the on-call rotation.",
    leadWhen: "An incident, a slow-consumer problem, or \"we can't see what's happening\" has come up.",
    dontLead: "Insights observes. It does not enforce — don't sell it into a security mandate.",
    expansion: "Time-travel diagnostics is the phrase that lands with someone who just finished a painful post-mortem.",
  },
  {
    id: "protect",
    name: "Synadia Protect",
    line: "A security gateway for NATS. Enforce policy on every connection and message.",
    detail:
      "Signed policy bundles applied per port for clients and leaf nodes — default-deny baselines, payload inspection for sensitive data, network-range restrictions on leaf nodes, time-window rules. Unmatched traffic can default to deny. Live allow, deny and suspend counters plus a connection audit view, and audit events streamed to your SIEM — no application changes.",
    buyer: "Security architecture, the CISO org, compliance — and the platform team asked to prove controls exist.",
    leadWhen: "An audit, a zero-trust mandate, a SIEM consolidation, or a security review blocking a rollout.",
    dontLead: "Not the opener for a developer evaluating speed to first workload.",
    expansion: "\"No application changes\" is the phrase that sells it. Security teams expect enforcement to cost the dev team a quarter.",
  },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

export const LAND_AND_EXPAND = [
  { id: "cloud", when: "First workload, fast." },
  { id: "platform", when: "Production, single-tenant, in their cloud." },
  { id: "insights", when: "Enough running that they need to see it." },
  { id: "protect", when: "A security review or audit makes enforcement mandatory." },
];

export const PORTFOLIO_RULE =
  "On a first call, don't present five products. Present the fabric story, then the one or two products that match the pain discovery surfaced. The portfolio slide belongs late, as proof the roadmap is covered — not early as a menu.";

export const COMMERCIAL_GUARDRAILS = [
  "Don't quote pricing, tiers, or discounts from here. Pull current terms from the source of truth for the deal.",
  "Don't claim a roadmap. If asked whether a product will do X, say you'll confirm.",
  "SOC 2 is publicly claimed and the trust center is at trust.synadia.com — point security reviewers there rather than describing controls yourself.",
  "The agent SDKs are open source developer tooling, not a SKU. Use them as proof and as a developer CTA, not in a commercial proposal.",
];
