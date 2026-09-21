# Synadia NEPQ Objection Tree

An objection-handling decision tree for Synadia / NATS deals, built on NEPQ (isolate → reframe →
attach cost → commit) and written against the 2026 "nervous system for agentic AI" positioning.
11 objection trunks, 76 nodes, no dead ends.

## Files

| File | What it is |
| --- | --- |
| `SYSTEM_PROMPT.md` | Paste-ready system prompt. Three modes: Coach, Roleplay, Custom tree. |
| `objection-tree.json` | The tree. Single source of truth — node IDs, exact lines, branches, guardrails. |
| `objection-tree.html` | Click-through tool for live calls. Generated — don't hand-edit. |
| `template.html` | The tool's markup and logic, with a `/*__TREE__*/` injection point. |
| `build.js` | `node build.js` — injects the JSON into the template. |

## Using it with Claude

1. Paste `SYSTEM_PROMPT.md` (everything below the rule) into a new chat or a Project's custom
   instructions, and attach `objection-tree.json` so the node IDs line up with the tool.
2. Name the mode:
   - **Coach** — you paste what the prospect said, Claude returns the node, the exact next line,
     and the if/then branches. Nothing else. Built for reading mid-call.
   - **Roleplay** — Claude is the prospect and runs the tree at you one question at a time.
     `PAUSE` steps out of character for a correction; `SCORE` ends with a read on your technique.
   - **Custom tree** — describe an account or an objection that isn't in the file and Claude
     clones the same four stages onto it, returned as JSON in the same schema.

First message, Coach mode:

```
Mode: Coach
Prospect just said: "We're a Kafka shop, this is solved for us."
Give me the current node and the next question only.
```

## Using the click-through tool

Open `objection-tree.html` in a browser, or the published version. Click the trunk that matches
what they said, then click the branch that matches their answer. Number keys `1`–`9` pick a
branch, `Esc` steps back. **Copy path for Claude** puts the path, the current node and your notes
on the clipboard in a format the system prompt above understands — so the tool and the chat are
the same conversation.

## Editing the tree

Edit `objection-tree.json`, then `node build.js`. Validate before committing:

```bash
node -e "
const t=require('./objection-tree.json');
const ids=new Set();
t.objections.forEach(o=>o.nodes.forEach(n=>ids.add(n.id)));
t.closes.forEach(c=>ids.add(c.id));
const bad=[];
t.objections.forEach(o=>o.nodes.forEach(n=>(n.branches||[]).forEach(b=>{if(!ids.has(b.then))bad.push(n.id+'->'+b.then)})));
console.log(bad.length?'DANGLING: '+bad.join(', '):'ok');
"
```

## Guardrails baked in

Only public proof points are assertable (450M+ downloads, 1,000+ contributors, 45+ client
libraries, 41K+ stars, 11K+ Slack members; the named customer logos; the NVIDIA Cloud Functions
story as published). No pricing, no roadmap promises, no invented throughput or savings numbers.
Retired language — *message broker, message bus, IoT messaging*, opening on ZooKeeper or
Confluent licensing cost — is listed as a do-not-use so it doesn't creep back in.

Positioning verified against synadia.com on 2026-08-27 via the `synadia-talk-track` skill. When
the site moves, update `objection-tree.json` and the guardrails block together.
