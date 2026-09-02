# Skill: Ingest inbox

## When to use
Human dropped transcripts, emails, notes, voice memos into `/inbox`.

## Steps
1. List new files in `/inbox`.
2. For each file, extract:
   - Durable facts about identity, offer, customer language
   - Repeatable processes
   - Objections and exact phrases
   - Things that contradict current `/context`
3. Propose file-level patches (quote old → new) for:
   - `context/02-voice.md` (new examples)
   - `context/03-customer.md` (VOC)
   - `context/05-knowledge.md` (frameworks / lessons)
   - new SOP skill if a process appeared 2+ times
4. Write a 10-line digest to `/outputs/inbox-digest-YYYY-MM-DD.md`.
5. Ask which proposed patches to apply.

## Do not
- Invent details that were not in the source
- Dump entire transcripts into context files
- Keep secrets (passwords, private customer data) in context
