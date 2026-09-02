# Bootstrap run — 2026-09-02

Prompt executed: `prompts/00-bootstrap.md`
Files read: `START-HERE.md`, `CLAUDE.md`, all six files in `/context`.

---

## 1. What is strong, what is generic, what makes this brain useless

**Strong (keep, do not rewrite):**
- `CLAUDE.md` is the best file in the kit. The uncertainty protocol (belief / what's missing / cheapest test) and "files win over chat, then propose a file update" are the two rules that keep a repo-as-memory system from rotting.
- `context/03-customer.md` leads with *job*, not demographic, and forces an "expensive misconception" quote. That single field is what the whole product ladder hangs on.
- `products/workshop-formula.md` is specific enough to execute from. Time-boxed sections, one-model rule, "if you need 40 slides you don't have a workshop yet."

**Generic (fine as scaffolding, worthless until replaced):**
- Every heading in `/context` is a good question, but they are all still questions. Six files, 65 bracket placeholders, zero facts.
- `context/05-knowledge.md` — "Core frameworks we own: Framework 1 — [name]" is the moat file, and it is empty. This is the file that actually differentiates the output.
- `context/02-voice.md` asks for 3–8 real paragraphs you wrote. There are none. Voice cannot be inferred from adjectives; it is only ever copied from samples.

**What would make this brain useless — and is currently true:**
> **The brain has no facts in it. Right now it will produce confident, well-structured slop.**

Specifically:
1. **Empty `/context` + working skills = fluent nonsense.** The skills in `/skills` will happily run against brackets and generate a workshop about nothing. START-HERE warns about this ("Skills on an empty brain produce slop") and that warning is currently the operative state of this repo.
2. **`/inbox` is empty.** No transcripts, proposals, posts, or call recordings. Ingestion is the only mechanism that gets real language into the system, and it has nothing to ingest.
3. **No proof anywhere.** `CLAUDE.md` rule 4 forbids inventing case studies, revenue, or client names. With `01-identity.md → Proof we can cite` blank, every asset this brain writes will have a hole exactly where the credibility goes.
4. **Two businesses are not distinguished.** Nothing in the files says whether this brain is for a NATS/Synadia-adjacent consulting practice or a separate personal venture. Those produce completely different customers, prices, and misconceptions. See the blocking question below.

---

## 2. The 10 questions that would most increase context quality

Ranked. Answers to 1–4 unblock everything else.

1. **Whose business is this brain for?** The Synadia/NATS day job, an independent consulting practice you own, or a new venture unrelated to either? (Blocking — see §4.)
2. **What do people already pay you for today, in what amount, and how did they find you?** Real numbers, even ugly ones. This sets honest pricing.
3. **What is the expensive misconception in your market — in your buyer's own words?** Not the polished version. The sentence you have heard on a call three times this quarter.
4. **Who exactly is the buyer?** Role, company size, and what specifically is on fire for them the week they reach out.
5. **What is the one framework you already run from memory** — the thing you sketch on a whiteboard every time — that you have never written down?
6. **What proof can you actually cite, with dates and caveats?** Named accounts only where you have permission; otherwise scoped ("a mid-size logistics platform, 2025").
7. **Where can I read you being you?** Point me at 3–8 real artifacts — a proposal, a post that landed, a long Slack/email explanation, a call transcript. This is the only input that fixes `02-voice.md`.
8. **What have you lost money or credibility believing?** `05-knowledge.md → Lessons paid for in blood` is the most persuasive section in any workshop, and it cannot be invented.
9. **How many hours per week can you actually deliver**, and can you sustain a live workshop cadence — monthly, quarterly, once?
10. **What will you refuse to sell**, even when someone offers money for it?

---

## 3. Improved drafts of the bracketed context files

**Not produced. Deliberately.**

Step 3 of the bootstrap prompt asks for improved versions of files still full of brackets. Doing that here would require inventing an identity, a customer, proof, and a knowledge base — which `CLAUDE.md` rule 4 forbids, and which is the specific failure mode START-HERE warns against.

Rewriting brackets into plausible prose does not add information. It removes the visible signal of what is still missing, and it launders guesses into "source of truth" — after which every downstream skill treats them as fact.

The files stay bracketed until question 1 is answered and questions 2–10 have real answers. That is roughly the 90 minutes `YOUR-NEXT-7-DAYS.md` calls Day 1, and it is the whole job right now.

---

## 4. Best low-ticket workshop to run in the next 14 days

**Nothing is true yet, so there is no defensible answer.**

The bootstrap prompt explicitly permits this response, and it is the correct one. A workshop proposal requires, at minimum: a named buyer, a misconception in their words, one framework you own, and one piece of citable proof. The repo currently has none of the four.

**What is actually blocking:** question 1. The two plausible readings produce entirely different products —

- *Synadia / NATS consulting practice* — buyer is a platform or infrastructure lead; the misconception is about messaging architecture (Kafka-by-default, "we'll just add a queue," multi-region as a later problem); proof would come from real deployments; and the low-ticket workshop tier may be the wrong shape for enterprise infrastructure buyers whose procurement does not do $150 line items.
- *An independent practice you own* — different buyer, different pricing, different constraints, and no dependency on employer positioning or claims approval.

There is also a real constraint the kit does not model: if this brain is pointed at the day job, `context/06-constraints.md` needs a section on what you may claim publicly, whose customer stories are usable, and what requires employer sign-off. Selling a personal workshop on your employer's domain expertise is a conversation to have before the registration page, not after.

Once question 1 is answered, the ordering from `YOUR-NEXT-7-DAYS.md` holds: Day 1 context → Day 2 re-run this bootstrap → Day 3 proof dump into `/inbox` → Day 4 research.

---

## Uncertainty protocol

Per `CLAUDE.md`:

- **What I believe:** The kit's structure is sound and needs no edits. The binding constraint is input, not tooling. Filling `/context` honestly for 90 minutes is worth more than any further work on this repo.
- **What I'm missing:** Answers to all 10 questions above, starting with #1. Any real writing samples. Any transcript.
- **Cheapest test:** Answer questions 1–4 in rough, ugly form — bullet points, not prose — then drop three real artifacts into `/inbox` and re-run this bootstrap. Roughly one hour, and it converts this repo from scaffolding into something with a point of view.

---

# Addendum — question 1 answered (same session)

**Answer: an independent practice owned by the operator**, separate from the Synadia (NATS.io) sales role.

Recorded in the files, not just here:
- `context/01-identity.md` — scope header naming the practice as independent, with a warning that the rest is still template.
- `context/06-constraints.md` — new **Separation from employment** section: no employer proof, logos, customer names, revenue figures, or channels; personal domain expertise travels with the operator, employer assets do not; conflict-of-interest items get flagged to the operator rather than resolved by the brain; confirm outside-work and IP terms before the first public page.

**Still blocked on questions 2–10.** Answering #1 fixed the frame, not the content. No identity, customer, voice sample, framework, or proof has entered the repo, so §3 and §4 above stand unchanged: no context rewrites, no workshop proposal.

**Next action (Day 1, ~90 minutes):** answer questions 2–4 in rough bullets, drop three real artifacts into `/inbox`, then re-run `prompts/00-bootstrap.md`. That run will be able to do the work this one correctly refused.
