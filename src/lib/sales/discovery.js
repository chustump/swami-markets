// The contrast table is the single most useful discovery artifact on the site.
// Walk the prospect down the left column and ask which rows hurt. Whichever they
// pick becomes the deal.

export const CONTRAST_HEADLINE = "The patterns that got us to the cloud won't get us past it.";

export const CONTRAST = [
  {
    id: "discovery",
    legacy: "Cumbersome discovery via HTTP/DNS",
    modern: "Agents and services live anywhere and are easily discoverable",
    probe: "When you add a new service or agent, how does it find the things it needs to talk to today?",
    products: ["platform", "cloud"],
  },
  {
    id: "comms",
    legacy: "Limited 1:1 communication",
    modern: "M:N communication — agents, devices, and services on one fabric",
    probe: "If three more consumers need that same event next quarter, who has to change code?",
    products: ["platform"],
  },
  {
    id: "pull",
    legacy: "Pull-based semantics",
    modern: "Push, pull, and fan-in/out — react to events instead of polling",
    probe: "How much of your traffic today is polling for something that hasn't happened yet?",
    products: ["platform", "cloud"],
  },
  {
    id: "perimeter",
    legacy: "Perimeter-based security",
    modern: "Decentralized, zero-trust security",
    probe: "What happens to your security model when the workload sits outside the perimeter — on a vehicle or a factory line?",
    products: ["protect"],
  },
  {
    id: "routing",
    legacy: "Routing via gateways, proxies, load balancers",
    modern: "Intelligent routing without more infrastructure",
    probe: "How many moving pieces sit between two services that need to exchange a message?",
    products: ["platform", "deploy"],
  },
  {
    id: "central",
    legacy: "Centralized, location-dependent backends",
    modern: "Data and context flow to wherever work happens",
    probe: "What happens to a workload at the edge when the link to the cloud drops for an hour?",
    products: ["platform", "insights"],
  },
];

export const PERSONAS = [
  {
    id: "platform",
    label: "Platform / infrastructure lead",
    cares: "Operating burden, blast radius, and how much of the week goes to running the layer instead of building on it.",
    questions: [
      "When you add a new service or agent, how does it find the things it needs to talk to today?",
      "How many moving pieces are between two services that need to exchange a message — gateway, proxy, load balancer, service mesh?",
      "What happens to a workload at the edge when the link to the cloud drops for an hour?",
      "How much of your team's week goes to operating the messaging layer versus building on it?",
    ],
    products: ["platform", "deploy", "insights"],
  },
  {
    id: "ai",
    label: "AI / ML engineering lead",
    cares: "Getting fleets of agents to behave like one system across providers nobody controls.",
    questions: [
      "Are your agents all on one provider, or are you already mixing model vendors and runtimes?",
      "When one agent hands work to another, where does that state live and what happens if the receiver is down?",
      "Can you tell me, right now, which agents are running and what they did in the last hour?",
      "Is there data your agents need that legally or practically can't leave its environment?",
    ],
    products: ["cloud", "platform", "insights"],
  },
  {
    id: "security",
    label: "Security / architecture",
    cares: "Identity, revocation, audit, and what the model does once the workload leaves the perimeter.",
    questions: [
      "How are agent credentials issued today, and how fast can one be revoked?",
      "Do you have an audit trail of agent-to-agent interactions, or only of API calls at the edge?",
      "Is your security model perimeter-based? What happens when the workload sits on a vehicle or a factory line?",
    ],
    products: ["protect", "platform"],
  },
  {
    id: "economic",
    label: "Economic buyer",
    cares: "All-in cost including the headcount operating it, and what breaks first when the program doubles.",
    questions: [
      "What's the cost of your current streaming or messaging platform, all-in, including the headcount operating it?",
      "If your agent or edge program doubles next year, what breaks first — cost, latency, or the team?",
    ],
    products: ["platform", "insights"],
  },
];

export const NARRATIVE = [
  {
    act: "Act 1 — the shift",
    body: "AI has left the chat window. Agents are deployed as fleets across clouds, factory floors, vehicles, and devices, pinned to the data and machines that can't move. Three forces drive it: multi-provider is the default and no model vendor, cloud, or agent runtime will coordinate across its competitors; the most valuable data can't leave its environment, so agents must live where the data is; and the largest AI value lands where AI touches the physical world.",
  },
  {
    act: "Act 2 — the problem",
    body: "The model is not the bottleneck anymore. Getting distributed agents to behave like one system is. They have to discover each other, address each other, and coordinate across providers nobody controls. HTTP request/response with retries, gateways, proxies and DNS was never designed for that.",
  },
  {
    act: "Act 3 — the new role",
    body: "A role is emerging: the agent orchestrator, whose job is watching fleets of agents and course-correcting in flight. Behind every orchestrator sits a meta agent — the programmatic tool that cuts context switching and codifies the workflow, so the human manages to outcomes instead of managing agent work. Small composable primitives, not one monolith.",
  },
  {
    act: "Act 4 — what Synadia builds",
    body: "The fabric underneath: connectivity from cloud to factory floor, identity for every agent type and instance, durable state and handoff built in, an audit trail on by default, and zero-trust security end to end — swappable at any layer.",
  },
  {
    act: "Act 5 — proof",
    body: "Heterogeneous agents on one fabric. Plugins ship for six harnesses out of the box — Claude Code, OpenClaw, PI, Hermes, OpenAgent, DSPy — plus an Agent SDK to wrap any harness or framework, and a Client SDK that discovers every agent on the fabric in one NATS round-trip. No DNS changes, no firewall holes, no API gateway config.",
  },
];
