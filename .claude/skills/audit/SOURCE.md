# Where this skill came from

Vendored from https://github.com/youtube-jono/seo-blueprint-audit
at commit `40223686a83a5983a4267133789d456a38bd8948`.

## What changed on the way in

Nothing in `SKILL.md` was edited. The only structural change: upstream keeps
`references/` and `code/` at the repo root, because the repo *is* the skill.
Here they live inside the skill folder so the skill is self-contained and can
sit alongside an unrelated codebase. Every relative path in `SKILL.md`
(`references/on-page-seo.md`, `code/check_page_similarity.py`) resolves
against this folder.

## Refreshing it

    git clone --depth 1 https://github.com/youtube-jono/seo-blueprint-audit /tmp/sba
    cp /tmp/sba/.claude/skills/audit/SKILL.md .claude/skills/audit/SKILL.md
    cp -r /tmp/sba/references /tmp/sba/code .claude/skills/audit/

Then update the commit hash above.
