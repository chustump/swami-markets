# Synadia Sales OS

A discovery-first call companion for selling Synadia and NATS — the decision tree a rep runs on a
live call, aligned to the 2026 "nervous system for agentic AI" positioning.

**White cards are you. Dark cards are them. The red line is the commitment to change the layer.**

## What's in it

| Route | What it does |
| --- | --- |
| `/` | Board — start a live call or a drill, advance rate, the arc of the call |
| `/call` | Live call runner: script, alternate phrasings, delivery notes, branch buttons (keys 1–9, B = back), note capture, dossier with "which rows hurt" → suggested product |
| `/tree` | Every card by phase, rendered against the current deal profile |
| `/discovery` | Cloud-centric vs. modern distributed contrast table (tap the rows that hurt), discovery questions by persona, the meta-agent narrative |
| `/objections` | Twelve enterprise objections — Kafka, managed cloud services, "just a broker", open source, migration, budget, authority, security, burned before, timing, "send me info" — each with principle, order, script, and where each answer routes |
| `/plays` | Between-the-calls plays (first touch, no-reply, arm the champion, security review, POC, OSS → commercial, expansion, stalled) plus the five products, public customers, numbers, and campaign assets |
| `/tracker` | Call log: advanced / nurture / disqualified / no-show, the seam, the next step or trigger, objections hit, Granola link |
| `/language` | Talk-track check: flags retired framing and hype adjectives, counts words and em-dashes, shows the retired → current swaps and quotable lines |
| `/deal` | Deal profile: four templates (multi-cloud AI, industrial edge, Kafka displacement, zero-trust) with editable pillars that drive every script |

Calls and the deal profile persist in the browser's localStorage. The only server-side piece is the
Granola proxy below.

## Granola live transcript

On a live call, the side panel has a **Transcript** tab. Link the Granola note being recorded and the
app polls Granola's public API every 8 seconds, streams the transcript beside the tree, and:

- flags what the prospect just said against the objection bank and the contrast table
  ("Jump: We already have Kafka", "Row hurts: Centralized backends") — one tap, never automatic;
- lets you **capture** any of their lines straight into the current card's note field;
- keeps the transcript and Granola's summary on the call record in the tracker.

### Setup

1. Granola → Settings → Connectors → API keys → create a key (`grn_…`). Requires a Business or
   Enterprise Granola plan.
2. Netlify → Site configuration → Environment variables:
   - `GRANOLA_API_KEY` — the key. It never reaches the browser; all calls go through `/api/granola/*`.
   - `GRANOLA_ME` (optional) — your name as Granola labels it (e.g. `Jeff Chu`), so your lines render
     as *you* and are excluded from objection spotting.
3. Redeploy. The Deal page shows "Connected" when the key works.

### What to expect

Granola documents polling as the integration pattern (webhooks are on their roadmap). Whether a
transcript is served *while* a meeting is still recording is not documented; the app treats a note
with `meetingStartAt` set and no `meetingEndAt` as live and polls it. If Granola only publishes the
transcript at the end of the meeting, the panel fills in the moment the call ends and everything
else (capture, spotting, tracker record) still works. Rate limit is 5 req/s; one poll every 8 s is
well under it.

The original Swami Markets app is untouched and lives at `/swami`.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (also what Netlify runs)
```

## Editing the content

- `src/lib/sales/tree.js` — the call tree. Each node has `script`, optional `vault` (alternate phrasings),
  `subcom` (delivery), `why`, `noteKey` (which dossier field the answer writes to), and `branches`.
  Scripts use `{tokens}` resolved from the deal profile and the live notes (`src/lib/sales/interpolate.js`).
- `src/lib/sales/profiles.js` — deal templates and their three pillars.
- `src/lib/sales/products.js`, `proof.js`, `discovery.js`, `plays.js`, `language.js` — positioning,
  products, public proof points, discovery bank, plays, and the retired-language list. Keep these to what
  is publicly stated on synadia.com.
