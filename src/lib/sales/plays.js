export const PLAYS = [
  {
    id: "first-touch",
    title: "First touch that gets a reply",
    when: "Cold or semi-warm. They have never spoken to you.",
    steps: [
      { title: "Signal, not flattery", body: "One specific, verifiable observation about their environment — an engineering post, a job req for edge sites, a conference talk. If the line could be sent to a hundred companies unchanged, cut it." },
      { title: "One question they have to think about", body: "Pull from the discovery bank. \"When an agent on one cloud hands work to an agent on another, where does that state live?\" beats \"are you exploring agentic AI?\"" },
      { title: "One named peer", body: "Pick by adjacency, not by logo size. Replit and Browserbase for AI platforms, Rivian and May Mobility for anything that moves, Mastercard for finserv." },
      { title: "One low-friction CTA", body: "A report, a comparison of notes, an architecture review. Not a demo. For edge-heavy accounts, offer the Edge Autonomy Gap study — sending a study is far easier to say yes to than a meeting." },
    ],
  },
  {
    id: "no-reply",
    title: "No reply / no-show",
    when: "The thread went quiet, or they didn't join the call.",
    steps: [
      { title: "Hold the slot, then use it", body: "Five minutes on the bridge, one message on the channel they actually read. Then the slot becomes prospecting time, not a break." },
      { title: "No guilt, no recap", body: "\"Looks like the day got away — here's the 30 seconds you missed\" plus one line of substance. Never a four-paragraph re-pitch." },
      { title: "Change the artifact, not the volume", body: "A different asset beats a fifth bump. Send the benchmark they can run themselves in two minutes and ask what score they got." },
      { title: "Re-engage with a reason", body: "RethinkConn, a new research report, or a customer story in their segment. A real pretext, not \"just circling back.\"" },
    ],
  },
  {
    id: "champion",
    title: "Arm the champion",
    when: "One engineer gets it and now has to sell it internally without you in the room.",
    steps: [
      { title: "Give them something to run, not read", body: "The edge autonomy benchmark produces a score in about two minutes and starts the internal conversation for you. For a hands-on AI engineer, the Agent SDKs convert better than any deck: clone the repo, the agents are already wired together." },
      { title: "Write the internal version of the pitch", body: "Draft the message they will paste into their own Slack — their words, their metrics, their architecture diagram. Don't make them invent it." },
      { title: "Name the blocker before they hit it", body: "Ask who says no and why. Security, the Kafka owner, and whoever signed last year's cloud contract are the usual three." },
      { title: "Get to the room", body: "The architecture review with their architect present is the next step that actually moves a deal. Offer it as working time, not a presentation." },
    ],
  },
  {
    id: "security-review",
    title: "Security review is blocking the rollout",
    when: "A production rollout is parked behind a security or compliance team.",
    steps: [
      { title: "Stop describing controls yourself", body: "SOC 2 compliance is publicly stated and the trust center is at trust.synadia.com. Point the reviewer there and let the documents do it." },
      { title: "Name Protect", body: "Policy enforced on every connection and message, signed policy bundles per port, default-deny baselines, audit events to their SIEM — with no application changes. That last phrase is the one that lands, because security teams expect enforcement to cost the dev team a quarter." },
      { title: "Ask the revocation question", body: "\"How are agent credentials issued today, and how fast can one be revoked?\" Static credentials that nobody can pull back is the gap they already know about." },
      { title: "Turn the blocker into the buyer", body: "A security team that gets enforcement it didn't have to build stops being the obstacle and starts being the reason the deal expands." },
    ],
  },
  {
    id: "poc",
    title: "POC that converts",
    when: "They agreed to try it. Most POCs die from scope, not from technology.",
    steps: [
      { title: "One workload, the painful one", body: "Migrations that work start with the thing that's already painful, not with a big-bang cutover. A leaf node next to the existing broker, one subject tree, one workload." },
      { title: "Write the success criteria down", body: "Two or three measurable outcomes with a date and an owner on each. If nobody will sign the criteria, this is a science project, not a POC." },
      { title: "Instrument it", body: "Insights during the POC means the post-mortem conversation is about data instead of impressions — and it's the natural attach when they ask how they'll see what's happening in production." },
      { title: "Agree what happens when it passes", body: "Ask before you start: \"If it hits these numbers, what's the path to production and who signs?\" A POC without that answer has no close at the end of it." },
    ],
  },
  {
    id: "oss-to-commercial",
    title: "Open-source user to commercial conversation",
    when: "They already run NATS. Nobody is paying anyone.",
    steps: [
      { title: "Don't defend the price of free", body: "NATS stays free and we help either way. Nothing to argue about." },
      { title: "Ask what operating it costs", body: "\"How much of your team's week goes to operating it versus building on it?\" and \"Who gets paged when a consumer goes slow at 2am?\"" },
      { title: "Sell the thing they can't build", body: "Single-tenant managed operation, 100+ expert-tuned checks, time-travel diagnostics, and policy enforcement on every connection. Not a support contract — products." },
      { title: "Find the trigger", body: "An incident, an audit, a data residency requirement, or a doubling program. One of those is usually already on their calendar." },
    ],
  },
  {
    id: "expansion",
    title: "Expansion triggers in an existing account",
    when: "They're live on Platform or Cloud and the account has gone quiet.",
    steps: [
      { title: "After any painful incident, lead with Insights", body: "Time-travel diagnostics is the phrase that lands with someone who just finished a post-mortem." },
      { title: "At audit, zero-trust mandate, or SIEM consolidation, lead with Protect", body: "Also strong where multi-tenancy is the customer's own product requirement." },
      { title: "When the team is the bottleneck, lead with Education", body: "Live NATS training kills the \"our team doesn't know NATS\" objection before it blocks a rollout." },
      { title: "When a second team shows up, land them properly", body: "A new team on Cloud today is a Platform conversation in two quarters. Track it as a land, not as shadow usage." },
    ],
  },
  {
    id: "stalled",
    title: "Stalled deal with no next step",
    when: "The last call ended in goodwill and nothing else.",
    steps: [
      { title: "Admit it out loud", body: "\"When we spoke in March, the plan was X and nothing's moved. Usually that means priorities shifted or something I said didn't land. Which is it?\" Honest beats hopeful." },
      { title: "Go back to the consequence", body: "Re-ask what breaks first when the program doubles. If nothing breaks, this was never a deal and the tracker should say so." },
      { title: "Change the altitude", body: "If you've been talking to an engineer for two quarters, the missing person is the economic buyer. If you've been talking to a VP, the missing person is the architect who has to live with it." },
      { title: "Qualify out loudly", body: "A clean disqualification frees the quarter. Write the reason in the tracker so the re-engage trigger is obvious next year." },
    ],
  },
];
