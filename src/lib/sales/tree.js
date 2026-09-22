// The call tree. White cards are you, dark cards are them.
// Every script runs through interpolate() against the live deal profile and notes.
// Language follows the Synadia talk track: ask, don't assert; open on the problem,
// not on the product.

export const TREE = [
  // ── Frame ──────────────────────────────────────────────────────────────
  {
    id: "open",
    phase: "opening",
    kind: "closer",
    title: "Check the clock first",
    script:
      "Hey {prospect} — good to meet you. You've got 30 on the calendar. Is that still right, or has the day moved?",
    vault: [
      "Hi {prospect}. Before anything else — still got the full half hour?",
      "{prospect}, good to meet you. Audio and video coming through okay?",
    ],
    subcom:
      "Ask about the clock before the agenda. It is the fastest way to keep a call from running past its welcome, and it signals you run calls for a living.",
    why: "You can't plan the arc of a discovery call until you know how much of it you have.",
    branches: [
      { id: "clear", label: "Full time, all good", next: "open_agenda" },
      { id: "short", label: "They only have 15 minutes", hint: "Cut the arc, keep discovery.", next: "open_short" },
      { id: "tech", label: "Audio or video problems", next: "open_tech" },
    ],
  },
  {
    id: "open_tech",
    phase: "opening",
    kind: "closer",
    title: "Fix the frame",
    script:
      "No problem — drop off and come back on the link in the invite. I'll wait. Better than fighting it for 30 minutes.",
    subcom: "Calm, not apologetic. You run the call.",
    branches: [
      { id: "back", label: "They're back and clear", next: "open_agenda" },
      { id: "stuck", label: "Still broken — rebook", next: "close_nurture" },
    ],
  },
  {
    id: "open_short",
    phase: "opening",
    kind: "closer",
    title: "Trade slides for questions",
    script:
      "Then let's not do slides. I'd rather spend 15 on what you're building and where the architecture is straining. If it's worth more time, we'll book it properly.",
    subcom: "Short calls are fine. Short discovery is not — drop the pitch, never the questions.",
    branches: [{ id: "go", label: "They're in", next: "open_agenda" }],
  },
  {
    id: "open_agenda",
    phase: "opening",
    kind: "closer",
    title: "Earn the right to ask",
    script:
      "Here's what I had in mind: most of it on what {company} is building and where things get awkward, and if what we do is relevant I'll show you exactly where it fits. If it isn't, I'll tell you. Fair?",
    vault: [
      "I'll be straight with you — I don't know yet whether this is a fit. Twenty minutes of questions and we'll both know.",
      "I did read about {useCase} before this, so I'll skip the things I can already look up.",
    ],
    subcom:
      "The permission to say \"this isn't a fit\" is what makes the questions land as diagnosis instead of interrogation.",
    why: "Discovery without a frame feels like a survey. With a frame it feels like an architect showing up.",
    branches: [
      { id: "yes", label: "Fair — go ahead", next: "desired_outcome" },
      { id: "pitch_first", label: "They want the pitch or demo first", next: "open_pitch_first" },
    ],
  },
  {
    id: "open_pitch_first",
    phase: "opening",
    kind: "closer",
    title: "Two questions first",
    script:
      "Happy to — and I will. Two questions first, or I'll end up showing you the wrong half of it.",
    subcom: "Don't refuse. Trade.",
    branches: [{ id: "ok", label: "Go ahead", next: "desired_outcome" }],
  },

  // ── Destination ────────────────────────────────────────────────────────
  {
    id: "desired_outcome",
    phase: "outcome",
    kind: "closer",
    title: "What are they trying to build",
    script:
      "What's the thing you're actually trying to get live over the next few quarters — what does the system need to do that it doesn't do today?",
    vault: [
      "If this goes the way you want, what's running a year from now that isn't running today?",
      "What's the initiative this sits under? I'd rather understand that than the ticket.",
    ],
    subcom: "Curious, unhurried. Let the answer be long. Write it down in their words.",
    why: "Start at the destination. Problems only matter relative to somewhere they're trying to get.",
    noteKey: "outcome",
    notePrompt: "Their destination, their words",
    branches: [
      {
        id: "tangible",
        label: "A concrete initiative",
        hint: "Write it verbatim. It anchors the rest of the call.",
        sample: "agents running at 40 plant sites that keep working when the uplink drops",
        next: "outcome_confirm",
      },
      {
        id: "problem_first",
        label: "They answer with a problem instead",
        sample: "honestly our Kafka setup is buckling and everything else is downstream of that",
        next: "outcome_from_problem",
      },
      { id: "vague", label: "Vague — \"just looking at options\"", sample: "we're evaluating a few things", next: "outcome_dont_know" },
    ],
  },
  {
    id: "outcome_from_problem",
    phase: "outcome",
    kind: "closer",
    title: "Turn the problem into a destination",
    script:
      "Got it. So if {problem} weren't in the way — what would you be building instead?",
    vault: ["Okay. And when that's fixed, what does it let {company} ship that it can't ship now?"],
    noteKey: "outcome",
    notePrompt: "The destination behind the complaint",
    branches: [
      { id: "named", label: "They name a destination", sample: "we'd put agents at the edge instead of shipping everything to the cloud", next: "outcome_confirm" },
      { id: "still_vague", label: "Still vague", next: "outcome_dont_know" },
    ],
  },
  {
    id: "outcome_dont_know",
    phase: "outcome",
    kind: "closer",
    title: "Give them the map, let them point",
    script:
      "Fair. Most teams we talk to are somewhere in one of three places: agents spreading across providers, workloads moving out to the edge, or a streaming platform that's outgrown what it was built for. Any of those sound like you?",
    subcom: "Three options, not twenty. Make it easy to point.",
    noteKey: "outcome",
    notePrompt: "Which one they pointed at",
    branches: [
      { id: "got_it", label: "They pick one", sample: "the edge one, that's us", next: "outcome_confirm" },
      { id: "browsing", label: "None of them — genuinely browsing", hint: "Not a deal today. Give them something to read.", next: "close_nurture" },
    ],
  },
  {
    id: "outcome_confirm",
    phase: "outcome",
    kind: "checkpoint",
    title: "Lock the destination",
    script:
      "So the destination is {outcome}. Everything else we talk about should be in service of that — if I drift, pull me back.",
    why: "If this is fuzzy, every later question has nothing to stand on and the pitch has nowhere to land.",
    branches: [
      { id: "locked", label: "Locked — they agreed", next: "current_situation" },
      { id: "refine", label: "Needs to be sharper", next: "desired_outcome" },
    ],
  },

  // ── Architecture today ─────────────────────────────────────────────────
  {
    id: "current_situation",
    phase: "situation",
    kind: "closer",
    title: "What's running now",
    script:
      "Walk me through what's running today. If a service or an agent needs to talk to another one, what actually happens?",
    vault: [
      "How does a new service find the things it needs to talk to right now?",
      "Draw me the path a single message takes from one end to the other.",
    ],
    subcom: "Neutral. Don't react to the first thing you could displace. Keep them talking.",
    why: "Their architecture is the whole diagnosis. You can't reframe a stack you can't describe back to them.",
    noteKey: "situation",
    notePrompt: "The path a message takes today",
    branches: [
      { id: "specific", label: "Specific — they describe the path", sample: "REST through an internal gateway, plus Kafka for anything async", next: "situation_stack" },
      { id: "vague", label: "Vague or high-level", sample: "microservices, the usual", next: "situation_vague" },
    ],
  },
  {
    id: "situation_vague",
    phase: "situation",
    kind: "closer",
    title: "Get to the components",
    script:
      "Let's get concrete. Between two services that need to exchange a message — how many things are in the middle? Gateway, proxy, load balancer, service mesh, broker?",
    subcom: "Counting the pieces out loud is usually the first time they hear how many there are.",
    branches: [{ id: "got_real", label: "They count the pieces", sample: "gateway, mesh sidecar, then Kafka", next: "situation_stack" }],
  },
  {
    id: "situation_stack",
    phase: "situation",
    kind: "closer",
    title: "Name the incumbent",
    script:
      "And for anything that has to be durable or asynchronous — what's carrying that today?",
    vault: ["Is that Kafka, a cloud service, RabbitMQ, MQTT at the device end, or some of each?"],
    noteKey: "stack",
    notePrompt: "Incumbent and where it sits",
    branches: [{ id: "named", label: "They name it", sample: "{incumbent}", next: "situation_scale" }],
  },
  {
    id: "situation_scale",
    phase: "situation",
    kind: "closer",
    title: "How long, how much",
    script:
      "How long has that been in place, and roughly how much is riding on it now?",
    subcom: "Tenure tells you how much political weight the incumbent carries. Volume tells you the blast radius.",
    noteKey: "howLong",
    notePrompt: "Tenure and scale of the incumbent",
    branches: [{ id: "scale", label: "They give you tenure and scale", sample: "four years, about 200 services on it", next: "is_it_holding" }],
  },

  // ── Where it breaks ────────────────────────────────────────────────────
  {
    id: "is_it_holding",
    phase: "problem",
    kind: "closer",
    title: "Is it holding up",
    script:
      "Is that holding up as you add {useCase}? Or is it starting to creak in places?",
    vault: [
      "What does adding the next ten services or agents to that actually cost you?",
      "Where does that design start to feel like it's being asked to do something it wasn't built for?",
    ],
    subcom: "Ask it flat, then stop talking. The pause does the work.",
    why: "No problem, no deal. Everything downstream of here depends on them naming a seam themselves.",
    noteKey: "problem",
    notePrompt: "The first crack they name",
    branches: [
      { id: "breaking", label: "They name a strain", sample: "every new consumer needs a gateway rule and a DNS entry", next: "where_breaks" },
      { id: "fine", label: "\"It's fine\"", next: "two_truths" },
      { id: "unsure", label: "They're not sure yet", next: "where_breaks" },
    ],
  },
  {
    id: "two_truths",
    phase: "problem",
    kind: "closer",
    title: "Nothing is fine at 2x",
    script:
      "Fair enough. Say the agent or edge program doubles next year — what breaks first? Cost, latency, or the team?",
    vault: ["If you could change one thing about that architecture without anyone complaining, what would it be?"],
    subcom: "Not a challenge. A hypothetical. Hypotheticals are safe to answer honestly.",
    branches: [
      { id: "named", label: "They name what breaks", sample: "the team — two people know Kafka properly", next: "where_breaks" },
      { id: "still_fine", label: "Still nothing", next: "two_truths_push" },
    ],
  },
  {
    id: "two_truths_push",
    phase: "problem",
    kind: "closer",
    title: "Then say so",
    script:
      "Honestly, that might mean you don't need us yet — and that's a fine outcome for a first call. Before I let it go: what would have to change for this to become a problem?",
    subcom: "Willingness to walk is the most credible thing you can do in the first 20 minutes.",
    why: "Manufactured pain produces a deal that dies in procurement. Let a no be a no.",
    branches: [
      { id: "opens", label: "That opens it up", next: "where_breaks" },
      { id: "no_pain", label: "Genuinely nothing — disqualify", next: "close_dq" },
    ],
  },
  {
    id: "where_breaks",
    phase: "problem",
    kind: "closer",
    title: "Where it breaks first",
    script:
      "Where does it break first — discovery, handoff between services, the edge when the link drops, or security once the workload leaves the perimeter?",
    vault: [
      "When one service hands work to another and the receiver is down, where does that state live?",
      "What happens to a workload at the edge when the link to the cloud drops for an hour?",
      "Can you tell me right now which agents are running and what they did in the last hour?",
    ],
    subcom: "Four doors. Whichever they walk through is the deal. Note it — it picks the product later.",
    why: "This maps directly to the contrast rows. Their answer selects the pillars you pitch.",
    noteKey: "problem",
    notePrompt: "The seam, precisely",
    branches: [{ id: "stated", label: "They name the seam", sample: "handoff — when the receiver is down we lose the work", next: "impact" }],
  },
  {
    id: "impact",
    phase: "problem",
    kind: "closer",
    title: "What it costs",
    script:
      "What does that cost you when it happens — engineer time, idle GPU, a missed window, an outage the customer sees?",
    vault: [
      "How much of the team's week goes to operating that layer instead of building on it?",
      "What's the all-in cost of that platform today, including the people who keep it running?",
    ],
    subcom: "Money, hours, or risk. Push for one of the three, not adjectives.",
    noteKey: "impact",
    notePrompt: "The cost, in hours, dollars, or risk",
    branches: [{ id: "cost", label: "They quantify it", sample: "a couple of engineers most of the week, plus the on-call", next: "who_feels" }],
  },
  {
    id: "who_feels",
    phase: "problem",
    kind: "closer",
    title: "Who feels it",
    script:
      "Who actually feels that — you, the on-call rotation, or the customer?",
    vault: ["Who gets paged when it goes sideways at 2am?"],
    subcom: "This is the org chart question hiding inside a sympathy question. It tells you who else has to be in the room.",
    why: "Whoever feels the pain is your champion or your blocker. Find out which.",
    noteKey: "whoFeels",
    notePrompt: "Who carries the pain",
    branches: [{ id: "named", label: "They name who", sample: "the platform team, and the plant managers when a site stalls", next: "how_long_pain" }],
  },
  {
    id: "how_long_pain",
    phase: "problem",
    kind: "closer",
    title: "How long has this been true",
    script: "How long has that been the case?",
    subcom: "Long-standing pain means it is survivable. That matters later, at why-now.",
    noteKey: "howLong",
    notePrompt: "How long they've lived with it",
    branches: [{ id: "duration", label: "They give you a timeframe", sample: "about a year, worse since we added the second cloud", next: "what_tried" }],
  },

  // ── What they've tried ─────────────────────────────────────────────────
  {
    id: "what_tried",
    phase: "past",
    kind: "closer",
    title: "What they've already tried",
    script: "What have you already tried to fix it?",
    vault: [
      "Did you build around it — retries, a gateway, another cluster — or did you try to replace something?",
      "Has anyone looked at a different layer for this before?",
    ],
    subcom: "Genuinely curious. Their workarounds are the proof that the problem is real and expensive.",
    why: "Every workaround is an unclosed door. Naming them now stops them showing up as objections later.",
    noteKey: "tried",
    notePrompt: "Workarounds, prior evaluations, internal builds",
    branches: [
      { id: "list", label: "They list attempts", sample: "retries and a dead-letter queue, then a second cluster per tenant", next: "why_failed" },
      { id: "nothing", label: "Nothing yet — they've absorbed it", next: "why_failed_nothing" },
    ],
  },
  {
    id: "why_failed",
    phase: "past",
    kind: "closer",
    title: "Why it didn't hold",
    script: "And why didn't that hold?",
    vault: [
      "Was it the technology, or was it that nobody had time to finish it?",
      "What would have had to be true for that to work?",
    ],
    subcom: "Let them indict the workaround. If you do it for them, they'll defend it.",
    noteKey: "failedWhy",
    notePrompt: "Why the workaround didn't hold",
    branches: [{ id: "reason", label: "They explain", sample: "it worked until the third cloud showed up", next: "prehandle_diy" }],
  },
  {
    id: "why_failed_nothing",
    phase: "past",
    kind: "closer",
    title: "Absorbing it is a decision too",
    script:
      "So the team's been absorbing it. What's kept it from getting fixed — priorities, or nobody owns that layer?",
    subcom: "No blame in the tone. You're finding the owner, not the culprit.",
    noteKey: "failedWhy",
    notePrompt: "Why it never got fixed",
    branches: [{ id: "own", label: "They tell you why", sample: "nobody really owns it, it's whoever touched it last", next: "prehandle_diy" }],
  },
  {
    id: "prehandle_diy",
    phase: "past",
    kind: "closer",
    title: "Pre-handle \"we'll build it ourselves\"",
    script:
      "Here's the pattern I see: teams patch around it for another year because any individual patch is small. Then the fleet doubles and the patches are the architecture. Is that roughly where you are?",
    vault: [
      "NATS itself is open source and free, by the way — plenty of teams run it themselves. The question is only whether operating it is where your team's time should go.",
    ],
    subcom: "Say the free part out loud before they do. It removes the trap from the conversation.",
    why: "Pre-handling the DIY objection in discovery is worth ten minutes of rebuttal at the close.",
    branches: [
      { id: "fair", label: "Fair — the patches are the problem", next: "gap_scale" },
      { id: "still_diy", label: "They'd still rather build and run it", next: "obj_oss" },
    ],
  },

  // ── Cost of the gap ────────────────────────────────────────────────────
  {
    id: "gap_scale",
    phase: "gap",
    kind: "closer",
    title: "Score where they are",
    script:
      "If one is \"nothing we have today survives {outcome}\" and ten is \"we're ready\" — where are you honestly?",
    vault: ["Out of ten, how ready is the current architecture for what next year asks of it?"],
    subcom: "A number is harder to walk back than an adjective. Whatever they say, ask what would make it one higher.",
    why: "The gap between their number and ten is the size of the deal, in their own arithmetic.",
    noteKey: "scale",
    notePrompt: "Their number, and what a point higher takes",
    branches: [{ id: "number", label: "They give a number", sample: "four — maybe a five if the edge sites weren't in it", next: "desired_situation" }],
  },
  {
    id: "desired_situation",
    phase: "gap",
    kind: "closer",
    title: "The other side",
    script:
      "What does the ten look like? If this were working the way you want in twelve months, what's different for the team?",
    vault: ["What would you be building then that you can't build now?"],
    subcom: "Let them describe it. People defend the future they described far harder than the one you described.",
    noteKey: "desired",
    notePrompt: "The good version, in their words",
    branches: [{ id: "vivid", label: "They paint it", sample: "sites run themselves, we ship a new agent without a DNS ticket", next: "consequence" }],
  },
  {
    id: "consequence",
    phase: "gap",
    kind: "closer",
    title: "Cost of standing still",
    script:
      "And if nothing changes — you get to this time next year on the same architecture. What's the cost of that?",
    vault: [
      "What does another year of patching cost, all in?",
      "Does the program get smaller, or does it just get more expensive to hold together?",
    ],
    subcom: "Ask it plainly and let it sit. Don't rescue them from the silence.",
    why: "Standing still is the real competitor in enterprise infrastructure. Price it before you price anything else.",
    noteKey: "consequence",
    notePrompt: "What another year costs",
    branches: [{ id: "named", label: "They price it", sample: "we'd miss the plant rollout, which is the whole point of the program", next: "why_now" }],
  },
  {
    id: "why_now",
    phase: "gap",
    kind: "closer",
    title: "Why now",
    script: "So why now? What makes this the quarter you look at it instead of next one?",
    vault: ["What changed recently that put this on your list?"],
    subcom: "If the answer is thin, the deal will slip. Better to find that out on call one.",
    noteKey: "whyNow",
    notePrompt: "The event driving the timing",
    branches: [
      { id: "reason", label: "A real trigger", sample: "board committed to the plant rollout for Q2", next: "commit_change" },
      { id: "soft", label: "No real trigger", sample: "just thought we should look", next: "why_now_push" },
    ],
  },
  {
    id: "why_now_push",
    phase: "gap",
    kind: "closer",
    title: "Later is how you got here",
    script:
      "I'll be honest — you've had this for {howLong}. What's different about now, other than that we're talking?",
    subcom: "Direct but warm. You are protecting both calendars.",
    branches: [
      { id: "grab", label: "They find the real reason", sample: "the audit lands in March, that's the forcing function", next: "commit_change" },
      { id: "tourist", label: "There isn't one — nurture", next: "close_nurture" },
    ],
  },

  // ── Commitment ─────────────────────────────────────────────────────────
  {
    id: "commit_change",
    phase: "commit",
    kind: "checkpoint",
    title: "Red line — are they willing to change the layer",
    script:
      "Before I show you anything: are you actually open to changing the connectivity layer for this, or is the mandate to make what you have work?",
    vault: [
      "Is this a real evaluation, or is it a look-around so you can say you looked?",
      "If the architecture answer turns out to be a different layer underneath, is that something {company} could actually do this year?",
    ],
    subcom:
      "Say it evenly, then stop. This is the one question you don't talk past. A soft yes here becomes \"send me some information\" an hour later.",
    why: "Everything after this — the pitch, the proof, the next step — assumes they'd change something. If they wouldn't, you're doing unpaid consulting.",
    redLine: true,
    noteKey: "committed",
    notePrompt: "Their exact commitment language",
    branches: [
      { id: "yes", label: "Yes — they'd change it", sample: "if it holds up technically, yes", next: "ideal_solution" },
      { id: "vague", label: "Hedged", sample: "depends what it looks like", next: "commit_vague" },
      { id: "no", label: "No — mandate is to make the current thing work", next: "close_dq" },
    ],
  },
  {
    id: "commit_vague",
    phase: "commit",
    kind: "checkpoint",
    title: "Don't move on",
    script:
      "Let me ask it differently. Say the technology is exactly what you'd want and the numbers work. Is there anything else that would stop {company} doing this?",
    subcom: "This is the isolation question. Whatever they name is the real deal blocker — write it down.",
    redLine: true,
    noteKey: "committed",
    notePrompt: "What they named as the real blocker",
    branches: [
      { id: "now_yes", label: "Clean yes now", next: "ideal_solution" },
      { id: "blocker", label: "They name a blocker", hint: "Take it to the objection that matches.", next: "obj_router" },
      { id: "still_no", label: "Still soft — nurture", next: "close_nurture" },
    ],
  },

  // ── What good looks like ───────────────────────────────────────────────
  {
    id: "ideal_solution",
    phase: "ideal",
    kind: "closer",
    title: "Their criteria, not yours",
    script:
      "If you could design the help, what would it look like? Your team running it with our experts behind them, or someone operating it so your people stay on the product?",
    vault: [
      "What would have to be true for you to be comfortable putting this underneath production?",
      "Who has to be convinced besides you — and what convinces them?",
    ],
    subcom: "You're collecting their evaluation criteria in their words. Later you'll pitch against these, not against your feature list.",
    noteKey: "ideal",
    notePrompt: "Their criteria for a fit",
    branches: [{ id: "picture", label: "They describe it", sample: "managed, in our own cloud account, with our security team able to prove controls", next: "decision_map" }],
  },
  {
    id: "decision_map",
    phase: "ideal",
    kind: "closer",
    title: "Map the decision",
    script:
      "And if this went well — what's the path from here to actually running? Who else is in that, and what's the step after this call usually?",
    vault: [
      "Who signs for something like this, and what do they need to see?",
      "Has anything like this been bought here before? What did that process look like?",
    ],
    subcom: "Ask it as curiosity about their process, not as a qualification checklist read aloud.",
    why: "A first call that ends without the decision path mapped produces a second call that's the same as the first.",
    noteKey: "decision",
    notePrompt: "People, steps, and what each needs",
    branches: [{ id: "mapped", label: "They lay out the path", sample: "me, then the security architect, then my VP signs", next: "pitch_bridge" }],
  },

  // ── The fabric ─────────────────────────────────────────────────────────
  {
    id: "pitch_bridge",
    phase: "pitch",
    kind: "pitch",
    title: "Permission to connect it",
    script:
      "Okay. Based on {problem} and what you just said about {ideal} — can I show you how we'd think about it? Ten minutes, and you can stop me anywhere.",
    subcom: "Ask permission. It converts the pitch from something done to them into something they asked for.",
    branches: [
      { id: "yes", label: "Yes — go", next: "pitch_shift" },
      { id: "resist", label: "They hesitate", next: "pitch_bridge_hold" },
    ],
  },
  {
    id: "pitch_bridge_hold",
    phase: "pitch",
    kind: "pitch",
    title: "Hold the frame",
    script:
      "No problem. I'll keep it to the part that touches {problem} — if it's not relevant you'll know inside two minutes.",
    subcom: "Shrink the ask, don't drop it.",
    branches: [
      { id: "ok", label: "Okay, go", next: "pitch_shift" },
      { id: "no", label: "They won't hear it today", next: "close_nurture" },
    ],
  },
  {
    id: "pitch_shift",
    phase: "pitch",
    kind: "pitch",
    title: "The shift",
    script:
      "The patterns that got us to the cloud won't get us past it. Request/response over HTTP, stitched together with retries, gateways, proxies and DNS, was built for a browser talking to a server — not for fleets of agents and devices that have to find each other across providers nobody controls. It works. But you wouldn't make it the backbone of a mission-critical system.",
    vault: [
      "AI has left the chat window. The model isn't the bottleneck anymore — getting distributed agents to behave like one system is, and that's a distributed systems problem.",
      "Three things make this permanent: multi-provider is the default, the valuable data can't leave its environment, and the biggest value shows up where software touches the physical world.",
    ],
    subcom: "This is the only part of the call where you assert rather than ask. Keep it to 60 seconds.",
    why: "The shift gives them a reason to care about the architecture before you name a product.",
    branches: [
      { id: "with", label: "They're with you", next: "pitch_fabric" },
      { id: "obj", label: "They push back", next: "obj_router" },
    ],
  },
  {
    id: "pitch_fabric",
    phase: "pitch",
    kind: "pitch",
    title: "The fabric",
    script:
      "What we build is the layer underneath: one protocol, one identity model, one security posture, from a cloud region down to a 20 MB binary on a device. Subject-based addressing, so anything can talk to anything without knowing where it lives, how many instances exist, or whether it's online yet. Durable state and handoff built in, an audit trail on by default, zero-trust end to end.",
    vault: [
      "Synadia created NATS and we operate it. 450M+ downloads, 45+ client libraries, and the same binary from the cloud to the device.",
      "It's not broker versus broker. It's one fabric versus a stack of workarounds.",
    ],
    subcom: "Concrete nouns. No adjectives on the technology.",
    branches: [
      { id: "with", label: "Still with you", next: "pillar_1" },
      { id: "obj", label: "Objection lands", next: "obj_router" },
    ],
  },
  {
    id: "pillar_1",
    phase: "pitch",
    kind: "pitch",
    title: "Pillar 1 — {p1title}",
    script:
      "First piece: {p1title}. Right now {p1problem}. What we do is {p1process} — so {p1outcome}. Does that match what you were describing?",
    subcom: "Problem, process, outcome — then a check-in question. Never three pillars in a row without a check-in.",
    branches: [
      { id: "with", label: "Yes, that's us", next: "pillar_2" },
      { id: "question", label: "They have a question — answer and re-ask", next: "pillar_1" },
      { id: "obj", label: "Objection lands", next: "obj_router" },
    ],
  },
  {
    id: "pillar_2",
    phase: "pitch",
    kind: "pitch",
    title: "Pillar 2 — {p2title}",
    script:
      "Second: {p2title}. Today {p2problem}. We {p2process} — which means {p2outcome}. Still tracking?",
    branches: [
      { id: "with", label: "Still tracking", next: "pillar_3" },
      { id: "obj", label: "Objection lands", next: "obj_router" },
    ],
  },
  {
    id: "pillar_3",
    phase: "pitch",
    kind: "pitch",
    title: "Pillar 3 — {p3title}",
    script:
      "Third: {p3title}. The issue is {p3problem}. We {p3process}, so {p3outcome}.",
    branches: [
      { id: "yes", label: "Makes sense", next: "pitch_proof" },
      { id: "obj", label: "Objection lands", next: "obj_router" },
    ],
  },
  {
    id: "pitch_proof",
    phase: "pitch",
    kind: "pitch",
    title: "One proof, not a wall",
    script:
      "Closest example to you is {proof}. {proofStory}. Happy to send the write-up rather than talk you through it.",
    vault: [
      "NVIDIA Cloud Functions runs on a Synadia-managed NATS supercluster — JetStream is the durable work queue that decouples bursty traffic from expensive GPU capacity, which is what makes scale-to-zero and multi-region failover work.",
      "Pick the logo by adjacency, not by size. One named customer beats five.",
    ],
    subcom: "One story, told at the level of mechanism. Never a logo parade.",
    why: "Proof answers \"has anyone like me survived this\" — the question they won't ask out loud.",
    branches: [
      { id: "lands", label: "It lands", next: "next_step_ask" },
      { id: "obj", label: "Objection lands", next: "obj_router" },
    ],
  },
  {
    id: "next_step_ask",
    phase: "pitch",
    kind: "pitch",
    title: "Ask for the next step",
    script:
      "So the natural next step would be {cta}. Does that make sense as the next thing, or is there something you'd want before that?",
    vault: ["What would you want to see next to know whether this is real?"],
    subcom: "Ask for a step, never for a signature. In enterprise infra, the close is a calendar entry with the right people on it.",
    branches: [
      { id: "yes", label: "Yes — let's book it", next: "close_plan" },
      { id: "value", label: "\"I'm not sure we need to change this\"", next: "obj_value" },
      { id: "kafka", label: "\"We already have Kafka\"", next: "obj_kafka" },
      { id: "cloud", label: "\"We use Kinesis / Pub-Sub / Service Bus\"", next: "obj_cloud" },
      { id: "oss", label: "\"NATS is open source — why pay you?\"", next: "obj_oss" },
      { id: "migration", label: "\"We'd have to rewrite everything\"", next: "obj_migration" },
      { id: "budget", label: "Budget / cost", next: "obj_budget" },
      { id: "authority", label: "\"I need to talk to my architect / VP\"", next: "obj_authority" },
      { id: "security", label: "\"Security will never approve it\"", next: "obj_security" },
      { id: "timing", label: "\"Not a priority this year\"", next: "obj_timing" },
      { id: "think", label: "\"Send me some information\"", next: "obj_think" },
    ],
  },

  // ── Objections ─────────────────────────────────────────────────────────
  {
    id: "obj_router",
    phase: "objections",
    kind: "objection",
    title: "Which concern is it",
    script:
      "Let me make sure I'm answering the right thing — is it whether this is the right architecture, whether it's the right time, or what it costs?",
    subcom: "Answer with a question or a distinction, never a rebuttal. Routing first stops you defending the wrong thing.",
    why: "Most stated objections are a category, not the concern. Find the category, then the concern.",
    noteKey: "lastObjection",
    notePrompt: "Their concern in their words",
    branches: [
      { id: "value", label: "Not convinced anything needs to change", next: "obj_value" },
      { id: "kafka", label: "We already have Kafka", next: "obj_kafka" },
      { id: "cloud", label: "We're on managed cloud services", next: "obj_cloud" },
      { id: "broker", label: "Isn't this just another broker?", next: "obj_broker" },
      { id: "oss", label: "NATS is free — why pay Synadia?", next: "obj_oss" },
      { id: "migration", label: "We'd have to rewrite everything", next: "obj_migration" },
      { id: "budget", label: "Budget / cost", next: "obj_budget" },
      { id: "authority", label: "Someone else decides", next: "obj_authority" },
      { id: "security", label: "Security or compliance will block it", next: "obj_security" },
      { id: "risk", label: "We got burned by a re-platform", next: "obj_risk" },
      { id: "timing", label: "Agentic AI isn't a priority yet", next: "obj_timing" },
      { id: "think", label: "Send me information / let me think", next: "obj_think" },
    ],
  },
  {
    id: "obj_value",
    phase: "objections",
    kind: "objection",
    title: "Isolate the architecture question",
    script:
      "Fair. Let me isolate it: if the architecture question were settled — if you believed this layer does what I've described — would you want to do it? Or is there something else underneath?",
    vault: ["Is it that you don't think it'd work here, or that it isn't worth doing this year?"],
    subcom: "Isolation before persuasion. If they say no here, price and timing were never the issue.",
    why: "Value is always first. Nothing downstream closes while the vehicle is still in question.",
    branches: [
      { id: "yes", label: "Yes — if it works, they'd want it", next: "close_ask" },
      { id: "no", label: "No — they don't buy the architecture", next: "obj_value_loop" },
    ],
  },
  {
    id: "obj_value_loop",
    phase: "objections",
    kind: "objection",
    title: "Find the unconvinced piece",
    script:
      "Which part doesn't hold up? The discovery and addressing piece, the durable handoff, or the security posture?",
    subcom: "Get them to point at the pillar. Then re-pitch that one and only that one.",
    branches: [
      { id: "pillar", label: "A pillar is unclear — re-pitch it", next: "pillar_1" },
      { id: "belief", label: "They don't believe it works at their scale", next: "obj_risk" },
      { id: "other", label: "It was something else all along", next: "obj_router" },
    ],
  },
  {
    id: "obj_kafka",
    phase: "objections",
    kind: "objection",
    title: "We already have Kafka",
    script:
      "Kafka is a good log — I wouldn't try to talk you out of it. The question is what happens outside the data center: workloads on a vehicle or a factory line, intermittent connectivity, and needing request/reply and key-value and object storage rather than only a durable log. Where does Kafka sit relative to that for you?",
    vault: [
      "Most teams keep Kafka for analytics and put NATS underneath everything that has to move.",
      "How many clusters are you running to get per-tenant isolation today?",
    ],
    subcom: "Never attack the incumbent. Draw the boundary and let them place themselves on one side of it.",
    why: "Displacement math closes the deal. The architecture conversation opens it. In that order.",
    branches: [
      { id: "outside", label: "They have real workloads outside the data center", next: "close_ask" },
      { id: "cost", label: "They go to cost — licensing, clusters, headcount", next: "obj_kafka_cost" },
      { id: "all_in_dc", label: "Everything is in one data center and staying there", next: "obj_value" },
    ],
  },
  {
    id: "obj_kafka_cost",
    phase: "objections",
    kind: "objection",
    title: "Cost, in the right order",
    script:
      "Cost matters, and I'd rather get the architecture right first — otherwise this becomes a line-item swap and we both under-solve it. What's the all-in number today, including the people operating it?",
    subcom: "Leading with price caps the deal at the thing you're replacing. Let them raise it, then park it in the business case.",
    branches: [
      { id: "number", label: "They give you the all-in number", next: "obj_budget_case" },
      { id: "arch", label: "They come back to architecture", next: "close_ask" },
    ],
  },
  {
    id: "obj_cloud",
    phase: "objections",
    kind: "objection",
    title: "We're on managed cloud services",
    script:
      "Those are fine inside one cloud. The agentic case is multi-provider by definition, and no cloud vendor's service will coordinate across its competitors' runtimes. Where does that leave you when half the fleet is on someone else's infrastructure or on hardware you own?",
    subcom: "State the boundary as a fact, then ask them where they sit. No vendor-bashing.",
    branches: [
      { id: "multi", label: "They're already multi-provider or on own hardware", next: "close_ask" },
      { id: "single", label: "One cloud, and they intend to stay", next: "obj_cloud_single" },
    ],
  },
  {
    id: "obj_cloud_single",
    phase: "objections",
    kind: "objection",
    title: "Does anything live outside it",
    script:
      "Then the only question is whether anything you care about runs outside that cloud — devices, vehicles, plant sites, a customer's environment. Does it?",
    branches: [
      { id: "edge_yes", label: "Yes — something lives outside", next: "close_ask" },
      { id: "no", label: "Genuinely all in one cloud", next: "obj_value" },
    ],
  },
  {
    id: "obj_broker",
    phase: "objections",
    kind: "objection",
    title: "Isn't this just another broker",
    script:
      "A broker moves bytes between endpoints you configured. This is addressing, discovery, identity, state, and security in one protocol that runs the same from a cloud region down to a 20 MB binary on a device. The comparison isn't broker to broker — it's one fabric against the stack of workarounds you described.",
    subcom: "Distinction, not defense. Say it once, then hand the floor back.",
    branches: [
      { id: "gets_it", label: "That distinction lands", next: "close_ask" },
      { id: "still", label: "They still see a broker", next: "obj_value" },
    ],
  },
  {
    id: "obj_oss",
    phase: "objections",
    kind: "objection",
    title: "NATS is free — why pay Synadia",
    script:
      "Nothing to defend there — NATS stays free and we'll help either way. What people buy is not running it: single-tenant managed operation, observability with 100+ expert-tuned checks, and policy enforcement on every connection. The question is only whether operating it is where your team's time should go.",
    vault: ["We created NATS and we operate it. You can absolutely run it yourself — plenty of people do."],
    subcom: "Zero defensiveness. The moment you argue for paying, you sound like you're worried about the free version.",
    why: "This objection is a test of whether you're an open-source company or a toll booth. Pass it by not flinching.",
    branches: [
      { id: "ops", label: "They engage on what operating it costs", next: "obj_oss_ops" },
      { id: "diy", label: "They're committed to running it themselves", next: "obj_oss_ops" },
    ],
  },
  {
    id: "obj_oss_ops",
    phase: "objections",
    kind: "objection",
    title: "What operating it actually costs",
    script:
      "How much of the team's week goes to operating that layer today — and who gets paged when a consumer goes slow at 2am?",
    vault: [
      "When something degrades, how long does it take to find out what happened 40 minutes ago?",
      "If the person who knows it best left, what happens?",
    ],
    subcom: "Let the arithmetic be theirs. Don't do it out loud for them.",
    branches: [
      { id: "shift", label: "The number surprises them", next: "close_ask" },
      { id: "staffed", label: "They're genuinely staffed for it", hint: "Fine. Stay useful — they're a future Insights or Protect deal.", next: "close_nurture" },
    ],
  },
  {
    id: "obj_timing",
    phase: "objections",
    kind: "objection",
    title: "Agentic AI isn't a priority yet",
    script:
      "Then don't buy for that. The same fabric is what makes edge autonomy and service coordination work today — teams that put it in for one reason tend to find the other three. Which of those is live for you this year?",
    subcom: "Concede the premise immediately. Arguing about their roadmap never wins.",
    branches: [
      { id: "other", label: "Another reason is live now", next: "close_ask" },
      { id: "none", label: "Nothing live — nurture properly", next: "close_nurture" },
    ],
  },
  {
    id: "obj_migration",
    phase: "objections",
    kind: "objection",
    title: "We'd have to rewrite everything",
    script:
      "Usually not. This goes in alongside what's there — a leaf node next to the existing broker, one subject tree, one workload. The migrations that work start with the thing that's already painful, not with a big-bang cutover. What's the one workload that hurts most today?",
    subcom: "Shrink the change until it's smaller than the pain.",
    branches: [
      { id: "alongside", label: "They name a first workload", next: "close_ask" },
      { id: "scope", label: "They still see a re-platform", next: "obj_migration_scope" },
    ],
  },
  {
    id: "obj_migration_scope",
    phase: "objections",
    kind: "objection",
    title: "Scope it down to one thing",
    script:
      "What if nothing else moved this year? One workload, one subject tree, running beside what you have. Would that be worth testing?",
    branches: [
      { id: "one", label: "Yes — one workload is testable", next: "close_ask" },
      { id: "no", label: "No appetite for any change", next: "close_nurture" },
    ],
  },
  {
    id: "obj_budget",
    phase: "objections",
    kind: "objection",
    title: "Budget",
    script:
      "Understood. Two different problems live in there — there's no money this year, and there is money but this isn't where it goes. Which one is it?",
    subcom: "Isolate before you structure. Most \"no budget\" is actually \"not this budget.\"",
    noteKey: "funding",
    notePrompt: "Which budget problem, and who owns it",
    branches: [
      { id: "none", label: "No money this year", next: "obj_budget_path" },
      { id: "priority", label: "Money exists, priority doesn't", next: "obj_budget_case" },
    ],
  },
  {
    id: "obj_budget_path",
    phase: "objections",
    kind: "objection",
    title: "Find the funding path",
    script:
      "Where would money for something like this normally come from — your budget, the platform budget, or the program that's funding {outcome}?",
    vault: ["Is there a program budget attached to the initiative itself? That's usually where this lands."],
    subcom: "You're not asking for money. You're asking how money moves here.",
    noteKey: "funding",
    notePrompt: "The path, and whose budget",
    branches: [
      { id: "path", label: "There's a path", next: "close_ask" },
      { id: "none", label: "No path this fiscal year", hint: "Set the re-engage trigger on the budget cycle.", next: "close_nurture" },
    ],
  },
  {
    id: "obj_budget_case",
    phase: "objections",
    kind: "objection",
    title: "Build the case on their number",
    script:
      "Then let's make the comparison honest. Against what you're spending on that layer all-in — licensing, infrastructure, and the engineers keeping it up — plus what {consequence} costs. Who would need to see that comparison?",
    subcom: "The business case belongs after the architecture conversation, built from their numbers, not your list price.",
    branches: [
      { id: "build", label: "They'll work the numbers with you", next: "close_ask" },
      { id: "no", label: "They won't engage on it", next: "close_nurture" },
    ],
  },
  {
    id: "obj_authority",
    phase: "objections",
    kind: "objection",
    title: "Someone else decides",
    script:
      "Makes sense — this shouldn't be decided by one person. What does that person need to see, and would it be easier if I were in the room for that part rather than you relaying it?",
    subcom: "Don't let a champion freelance the architecture pitch to an architect. That's where deals quietly die.",
    why: "The goal isn't to bypass them. It's to get the technical conversation happening with the technical decision-maker present.",
    noteKey: "decision",
    notePrompt: "Who decides and what they need",
    branches: [
      { id: "room", label: "They'll get you in the room", next: "close_plan" },
      { id: "lead", label: "They want to take it internally first", next: "obj_authority_plan" },
    ],
  },
  {
    id: "obj_authority_plan",
    phase: "objections",
    kind: "objection",
    title: "Arm them properly",
    script:
      "Then let me make that easy. I'll send the write-up on {proof} and the piece that answers the question they'll ask first. What is that question likely to be?",
    vault: ["What's the thing they'll push back on hardest? Let's have the answer ready rather than discovering it after."],
    subcom: "Write the internal version of the pitch for them. Their words, their diagram, their metrics.",
    branches: [
      { id: "ok", label: "They name the internal objection", next: "close_ask" },
      { id: "vague", label: "They won't engage on the internal path", next: "close_nurture" },
    ],
  },
  {
    id: "obj_security",
    phase: "objections",
    kind: "objection",
    title: "Security or compliance will block it",
    script:
      "That's usually the right instinct, and it's the part we built a product for. Policy enforced on every connection and message, signed policy bundles per port, default-deny baselines, audit events to your SIEM — with no application changes. SOC 2 is public and there's a trust center your reviewer can read without us in the room. What would they want to see first?",
    vault: [
      "How are agent credentials issued today, and how fast can one be revoked?",
      "Do you have an audit trail of agent-to-agent interactions, or only of API calls at the edge?",
    ],
    subcom: "Don't describe controls yourself — point at trust.synadia.com and let the documents do it.",
    why: "\"No application changes\" is the phrase that turns a blocker into a sponsor. Security teams expect enforcement to cost the dev team a quarter.",
    branches: [
      { id: "protect", label: "That opens the door", next: "close_ask" },
      { id: "review", label: "They want a controls walkthrough", next: "close_plan" },
    ],
  },
  {
    id: "obj_risk",
    phase: "objections",
    kind: "objection",
    title: "We got burned before",
    script:
      "What happened? I'd rather know what went wrong last time than pretend it couldn't happen here.",
    vault: [
      "Was it the technology, the migration plan, or the vendor?",
      "What would have had to be different for that to have gone well?",
    ],
    subcom: "Empathize, don't reassure. A fast reassurance sounds like you weren't listening.",
    why: "A burned buyer isn't objecting to you — they're protecting themselves from a repeat. Design the next step so a repeat is impossible.",
    branches: [
      { id: "derisk", label: "They'll test it on one workload", next: "close_ask" },
      { id: "still", label: "Still frozen — go back to the cost of standing still", next: "consequence" },
    ],
  },
  {
    id: "obj_think",
    phase: "objections",
    kind: "objection",
    title: "Send me some information",
    script:
      "I will. So I send the right thing rather than everything — what's the part you'd want to be sure about?",
    vault: ["If you already knew the answer to that, would you be ready to take the next step, or is something else in the way?"],
    subcom: "\"Send me information\" is a category, not a concern. Route it.",
    why: "Information requests that don't name a question become attachments nobody opens.",
    branches: [
      { id: "tech", label: "It's the architecture", next: "obj_value" },
      { id: "budget", label: "It's cost", next: "obj_budget" },
      { id: "people", label: "It's someone else's call", next: "obj_authority" },
      { id: "timing", label: "It's timing", next: "obj_timing" },
      { id: "real", label: "They genuinely want to read first", next: "obj_think_step" },
    ],
  },
  {
    id: "obj_think_step",
    phase: "objections",
    kind: "objection",
    title: "Reading with a date on it",
    script:
      "Then here's what I'll do: I'll send it today, and let's put 20 minutes in the calendar for Thursday. If you've read it and it's not for you, cancel it and tell me why — that's genuinely useful to me.",
    subcom: "A follow-up without a date is a follow-up that doesn't exist.",
    branches: [
      { id: "booked", label: "They'll take the slot", next: "close_plan" },
      { id: "wont", label: "They won't book anything", next: "close_nurture" },
    ],
  },

  // ── Next step ──────────────────────────────────────────────────────────
  {
    id: "close_ask",
    phase: "close",
    kind: "close",
    title: "How do they want to proceed",
    script:
      "So where does that leave us — does {cta} make sense as the next step?",
    vault: ["What would you want to happen next?"],
    subcom: "Ask once, then be quiet. The first person to talk after the ask usually concedes something.",
    branches: [
      { id: "yes", label: "Yes — set the next step", next: "close_plan" },
      { id: "obj", label: "Another concern surfaces", next: "obj_router" },
      { id: "later", label: "Nothing bookable today", next: "close_nurture" },
    ],
  },
  {
    id: "close_plan",
    phase: "close",
    kind: "close",
    title: "A date, an owner, a decision",
    script:
      "Let's make it concrete: date and time now while we're both here, who's on it from your side, and what we each bring. I'll send the invite before we hang up.",
    vault: [
      "Who should be on that from your side — the architect, or security too?",
      "And what would make that session a good use of everyone's time?",
    ],
    subcom: "Book it on the call. \"I'll find a time\" is the most expensive sentence in enterprise sales.",
    why: "A next step with a date, an owner, and a decision attached is the only real output of a first call.",
    noteKey: "nextStep",
    notePrompt: "Date, attendees, and what each side brings",
    branches: [
      { id: "set", label: "Booked — mark it advanced", next: "close_advanced" },
      { id: "cant", label: "They can't commit a date today", next: "close_nurture" },
    ],
  },
  {
    id: "close_advanced",
    phase: "close",
    kind: "close",
    title: "Advanced",
    script:
      "Good. Invite is going out now with the agenda in it. Before we hang up — anything you want me to send ahead so nobody arrives cold?",
    subcom: "Send the recap within the hour, in their words, with the next step at the top.",
    branches: [{ id: "done", label: "Log it and move", next: "close_advanced" }],
  },
  {
    id: "close_nurture",
    phase: "close",
    kind: "close",
    title: "Nurture, with a trigger",
    script:
      "That's fair. I'll send {cta} and leave you alone until something changes. What would have to happen for this to become live — the audit, the rollout, budget season?",
    subcom: "A nurture without a named trigger is a lead you'll forget. Write the trigger in the tracker.",
    why: "Half of enterprise pipeline is timing. The rep who knows the trigger date wins that half.",
    noteKey: "nextStep",
    notePrompt: "The trigger and when to come back",
    branches: [{ id: "done", label: "Log it as nurture", next: "close_nurture" }],
  },
  {
    id: "close_dq",
    phase: "close",
    kind: "close",
    title: "Disqualified — say it out loud",
    script:
      "Honestly, based on what you've described, I don't think we're what you need right now. If that changes, you know where I am — and if it's useful I'll send one thing that's worth reading either way.",
    subcom: "Clean disqualification buys back the quarter and buys credibility you'll spend later.",
    why: "A pipeline full of maybes forecasts worse than a small one full of yeses.",
    noteKey: "nextStep",
    notePrompt: "Why it's not a fit — write it for future you",
    branches: [{ id: "done", label: "Log it as disqualified", next: "close_dq" }],
  },
];

const byId = new Map(TREE.map((n) => [n.id, n]));

export function getNode(id) {
  return byId.get(id);
}

export function nodesForPhase(phase) {
  return TREE.filter((n) => n.phase === phase);
}

export const START_NODE = "open";

export const TERMINAL_STATUS = {
  close_advanced: "advanced",
  close_nurture: "nurture",
  close_dq: "disqualified",
};

export const OBJECTION_INDEX = [
  {
    id: "obj_value",
    label: "Not convinced anything needs to change",
    principle: "Isolate before you persuade. If the architecture question were settled, would they want it?",
    order: "Always first. Nothing else closes while the vehicle is in question.",
  },
  {
    id: "obj_kafka",
    label: "We already have Kafka",
    principle: "Kafka is a good log. The argument is about everything that happens outside the data center.",
    order: "Draw the boundary, let them place themselves. Cost comes after architecture, never before.",
  },
  {
    id: "obj_cloud",
    label: "We're on managed cloud services",
    principle: "Fine inside one cloud. No cloud vendor's service coordinates across its competitors' runtimes.",
    order: "Ask what runs outside that cloud — devices, vehicles, sites, a customer's environment.",
  },
  {
    id: "obj_broker",
    label: "Isn't this just another broker?",
    principle: "Not broker to broker. Fabric against a stack of workarounds.",
    order: "Say the distinction once and hand the floor back.",
  },
  {
    id: "obj_oss",
    label: "NATS is free — why pay Synadia?",
    principle: "Nothing to defend. NATS stays free; what people buy is not running it.",
    order: "Zero defensiveness, then ask what operating it costs today.",
  },
  {
    id: "obj_migration",
    label: "We'd have to rewrite everything",
    principle: "It goes in alongside. A leaf node, one subject tree, one workload.",
    order: "Shrink the change until it's smaller than the pain.",
  },
  {
    id: "obj_budget",
    label: "Budget",
    principle: "\"No money this year\" and \"not this budget\" are different problems.",
    order: "Isolate which one, then find the funding path or build the case on their all-in number.",
  },
  {
    id: "obj_authority",
    label: "Someone else decides",
    principle: "Don't let a champion freelance the architecture pitch to an architect.",
    order: "Get in the room, or arm them with the answer to the question that's coming.",
  },
  {
    id: "obj_security",
    label: "Security or compliance will block it",
    principle: "Enforcement on every connection and message, with no application changes.",
    order: "Point at the trust center. Don't describe controls yourself.",
  },
  {
    id: "obj_risk",
    label: "We got burned before",
    principle: "Empathize, don't reassure. Find out what actually went wrong.",
    order: "Then design a next step where a repeat is structurally impossible.",
  },
  {
    id: "obj_timing",
    label: "Agentic AI isn't a priority yet",
    principle: "Concede immediately. The same fabric carries edge autonomy and service coordination today.",
    order: "Ask which of those is live this year.",
  },
  {
    id: "obj_think",
    label: "Send me some information",
    principle: "A category, not a concern. Route it before you send anything.",
    order: "Last. Whatever it routes to is the real objection.",
  },
];
