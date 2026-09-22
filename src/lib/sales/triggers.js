// Phrases a prospect says that map to a card in the tree. Matched against
// "them" utterances from the live transcript; the rep gets a one-tap jump,
// never an automatic move. Keep patterns specific — a false jump mid-call
// costs more than a missed one.

export const OBJECTION_TRIGGERS = [
  { id: "obj_kafka", label: "We already have Kafka", patterns: [/\bkafka\b/i, /\bconfluent\b/i, /\bmsk\b/i] },
  { id: "obj_cloud", label: "We're on managed cloud services", patterns: [/\bkinesis\b/i, /\bpub\s?\/?\s?sub\b/i, /\bservice bus\b/i, /\beventbridge\b/i, /\bsqs\b/i, /\bsns\b/i] },
  { id: "obj_broker", label: "Isn't this just another broker?", patterns: [/\b(another|just a|yet another)\s+(message\s+)?(broker|bus|queue)\b/i, /\brabbit\s?mq\b/i, /\bactive\s?mq\b/i, /\bhow is this different\b/i] },
  { id: "obj_oss", label: "NATS is free — why pay Synadia?", patterns: [/\bopen[\s-]?source\b/i, /\bwhy (would|should) we pay\b/i, /\brun it ourselves\b/i, /\bit'?s free\b/i, /\bself[\s-]?host/i] },
  { id: "obj_migration", label: "We'd have to rewrite everything", patterns: [/\brewrite\b/i, /\bre-?platform/i, /\bmigrat(e|ion)\b/i, /\brip (and|&) replace\b/i, /\bbig bang\b/i] },
  { id: "obj_budget", label: "Budget", patterns: [/\bbudget\b/i, /\bno money\b/i, /\bexpensive\b/i, /\bcost(s|ly)?\b/i, /\bpricing\b/i, /\bprice\b/i, /\bprocurement\b/i] },
  { id: "obj_authority", label: "Someone else decides", patterns: [/\b(talk|run it|check) (to|with|by) (my|our|the) (boss|manager|vp|cto|cio|architect|team|director)\b/i, /\bnot my (call|decision)\b/i, /\bneed(s)? (sign[\s-]?off|approval)\b/i, /\bdecision[\s-]?maker\b/i] },
  { id: "obj_security", label: "Security or compliance will block it", patterns: [/\bsecurity (team|review|will|won'?t)\b/i, /\bcompliance\b/i, /\bsoc\s?2\b/i, /\baudit\b/i, /\bciso\b/i, /\bzero[\s-]?trust\b/i, /\binfosec\b/i] },
  { id: "obj_risk", label: "We got burned before", patterns: [/\bburned\b/i, /\bbad experience\b/i, /\blast (time|vendor)\b/i, /\bwhat if (it|this) (doesn'?t|fails)\b/i, /\brisky\b/i] },
  { id: "obj_timing", label: "Agentic AI isn't a priority yet", patterns: [/\bnot a priority\b/i, /\bnext (year|quarter|fiscal)\b/i, /\bnot (right )?now\b/i, /\bdown the (road|line)\b/i, /\btoo early\b/i] },
  { id: "obj_think", label: "Send me some information", patterns: [/\bsend (me|us|over)\b/i, /\bthink about it\b/i, /\bsome (info|information|material|docs)\b/i, /\bcircle back\b/i, /\bget back to you\b/i] },
];

export const CONTRAST_TRIGGERS = [
  { id: "discovery", label: "Discovery via HTTP/DNS", patterns: [/\bdns\b/i, /\bservice discovery\b/i, /\bfind (each other|the service)\b/i, /\bregistry\b/i] },
  { id: "comms", label: "Limited 1:1 communication", patterns: [/\bpoint[\s-]?to[\s-]?point\b/i, /\bone[\s-]?to[\s-]?one\b/i, /\bfan[\s-]?out\b/i, /\bmore consumers\b/i] },
  { id: "pull", label: "Pull-based semantics", patterns: [/\bpoll(ing)?\b/i, /\bcron\b/i, /\bevery (few|\d+) (seconds|minutes)\b/i] },
  { id: "perimeter", label: "Perimeter-based security", patterns: [/\bperimeter\b/i, /\bvpn\b/i, /\bfirewall\b/i, /\bcredentials?\b/i, /\brevoke\b/i, /\bstatic (keys|tokens|creds)\b/i] },
  { id: "routing", label: "Gateways, proxies, load balancers", patterns: [/\bgateway\b/i, /\bprox(y|ies)\b/i, /\bload balancer\b/i, /\bservice mesh\b/i, /\bistio\b/i, /\benvoy\b/i, /\bsidecar\b/i] },
  { id: "central", label: "Centralized, location-dependent backends", patterns: [/\bedge\b/i, /\boffline\b/i, /\bdisconnected\b/i, /\bintermittent\b/i, /\b(plant|factory|site|vehicle|store)s?\b/i, /\buplink\b/i, /\blatency\b/i] },
];

export function spot(text) {
  if (!text) return { objections: [], rows: [] };
  const objections = OBJECTION_TRIGGERS.filter((t) => t.patterns.some((p) => p.test(text))).map(({ id, label }) => ({ id, label }));
  const rows = CONTRAST_TRIGGERS.filter((t) => t.patterns.some((p) => p.test(text))).map(({ id, label }) => ({ id, label }));
  return { objections, rows };
}
