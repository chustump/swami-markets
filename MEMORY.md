# Project Memory

A running record of capabilities, decisions, and context worth remembering
across sessions.

## AI Capabilities

### Video Watching (`watch@claude-video`)

- **What it does:** Downloads a video (e.g. from YouTube), extracts frames,
  transcribes audio, and produces a markdown report combining frame timestamps
  with the transcript.
- **Dependencies:** `ffmpeg` / `ffprobe` (system) and `yt-dlp` (via `pip`).
- **Claude Code:** Installed from the `bradautomates/claude-video` marketplace as
  `watch@claude-video`. Verify with `claude plugin details watch`.
- **Antigravity (Gemini):** Deployed as a Gemini plugin under
  `C:\Users\Owner\.gemini\config\plugins\claude-video`, exposing a `/watch` skill.
- **Usage:** `watch.py <url> [--max-frames N] [--no-whisper]`
- **Status:** Verified end-to-end on 2026-06-14 (see `docs/logs/2026-06-14.md`).

## Daily Logs

- [2026-06-14](docs/logs/2026-06-14.md) — Set up and verified `watch@claude-video`.
