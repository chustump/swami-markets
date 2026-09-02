# AI Business Brain — Starter Kit

Inspired by Stanley Henry (attn:seeker) / *I Used AI to Build a Business Brain: $500K in 11 Weeks*.

This is not a chatbot project. It is a **local operating system** for your business:

- A folder of plain-English markdown files = long-term memory
- Claude Code (or any coding agent that reads the repo) = frontal cortex
- Skills + prompts = repeatable work the brain can do without you re-explaining
- Inbox = how new knowledge gets absorbed
- Products = how you turn the brain into revenue

You do not need to code. You write documents. The AI reads them.

---

## What Stanley actually did (so you can copy the *method*, not the niche)

1. Recorded years of meetings, emails, SOPs, brand voice, client work.
2. Dumped that into a local folder Claude Code can see.
3. Asked Claude to research Reddit / Threads / comments for the language customers already use.
4. Asked Claude to package the agency’s knowledge into **digital products**.
5. Sold a **live 2-hour workshop** (~$150–$189) as the top of a product ladder.
6. Used Meta ads only for the low-ticket offer (he reported ~3:1 ROAS).
7. Upsold mid-ticket ($900-ish “we generate your series + 1-hour call”) and high-ticket agency work.

The workshop used a Veritasium-style structure:

1. Name the misconception
2. Agree *why* people believe it
3. Reveal the truth
4. Give one application they can do this week

Courses die because ~1% finish them. Live workshops change how people think, then sell the next step.

---

## 60-minute setup

### 1. Tools
- [VS Code](https://code.visualstudio.com/) (free)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (terminal inside VS Code)
- Claude Pro recommended (~$20/mo)
- Same principles work with other repo-aware agents (Codex, Cursor, etc.)

### 2. Put this folder on your machine
Keep it as a git repo if you can. The brain *is* the files.

### 3. Fill Layer 1 context (do this before anything fancy)
Edit every file in `/context`. Replace `[BRACKETS]`. Be blunt and specific. Bad context = generic AI.

Minimum viable brain:
- `context/01-identity.md`
- `context/02-voice.md`
- `context/03-customer.md`
- `context/04-offer.md`
- `context/05-knowledge.md`

### 4. Open Claude Code in this folder
First prompt is in `prompts/00-bootstrap.md`. Paste it.

### 5. Start ingesting
Drop transcripts, emails, notes into `/inbox`. Then run the ingest skill.

### 6. Build a product
Use `prompts/02-productize.md` and `products/ladder.md`.

---

## The 3 layers (how to think about it)

**Layer 1 — Context (memory)**  
Who you are, who you serve, how you sound, what you know, what you sell.

**Layer 2 — Skills (jobs)**  
Repeatable workflows: research a market, draft a workshop, write an ad, qualify a lead, turn a transcript into a SOP.

**Layer 3 — Automation (habits)**  
Recurring jobs: weekly brief, inbox digest, content calendar, ad creative batch.

Do not skip Layer 1. Skills on an empty brain produce slop.

---

## Rules that keep the brain honest

- Write like you talk to a smart new hire on day 1.
- Prefer facts, examples, and “we never do X” over slogans.
- When the AI is wrong, *correct the file*, not just the chat.
- New knowledge goes in `/inbox` first, then gets filed into `/context` or `/skills`.
- The brain should ask you when it is unsure — see CLAUDE.md.

---

## What to build first as *your* product

If you already have expertise (even messy expertise), the fastest product is:

**A 90–120 minute live workshop that kills one expensive misconception in your market.**

Price it so volume works ($97–$197).  
One offer. One transformation. One next step.

Then:
- Recording + templates as a bump
- Done-with-you mid-ticket
- Done-for-you high-ticket

Details in `/products`.
