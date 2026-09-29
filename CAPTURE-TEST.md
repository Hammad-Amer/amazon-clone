# Capture Test

## Setup

- **Tool:** Claude Code 2.1.284
- **Model:** claude-opus-5-5 (used for both planning and executing)
- **Capture mechanism:** Claude Code hooks (`SessionStart`, `UserPromptSubmit`, `Stop`) configured in `.claude/settings.json`, each running `node .claude/hooks/capture.js`. The script appends each prompt (verbatim) and each final assistant response to a per-session Markdown file in `.agent-logs/`, with entry numbering, UTC timestamps, and the model name.
- **Issues encountered:** The first version of `capture.js` had a bug in how it split the file's front-matter header from the body: rewriting the header (to update `total_exchanges` / timestamps) overwrote entries appended earlier. It was caught in a simulated session test before the hooks went live and fixed so the body is preserved and new entries are appended.

## Canary results

The canary prompt `CAPTURE TEST — 8x assignment, Hammad Amer` was sent in two separate fresh sessions. Each produced its own session file, containing the prompt and the response.

### Canary 1: `.agent-logs/2026-09-29_17-41-12_f76ebeaa-df8d-456a-a31a-188f26b1dc60.md`

```
[LOG_ENTRY type=PROMPT num=1 session=f76ebeaa]
timestamp: 2026-09-29T17:41:12.909Z
model: claude-opus-5-5

CAPTURE TEST — 8x assignment, Hammad Amer


[LOG_ENTRY type=RESPONSE num=1 session=f76ebeaa]
timestamp: 2026-09-29T17:41:17.111Z
model: claude-opus-5-5

Got your capture test message: "8x assignment, Hammad Amer".

The capture hooks from commit `582220e` look like they're working. There's an untracked session log at `.agent-logs/2026-09-29_17-39-26_c3de164b-….md`, which fits a hook writing one file per session.

I can open that log to check what it recorded, or we can go straight to the assignment.


```

### Canary 2: `.agent-logs/2026-09-29_17-42-03_4c0da286-67ae-4a2a-af55-b194054f5e04.md`

```
[LOG_ENTRY type=PROMPT num=1 session=4c0da286]
timestamp: 2026-09-29T17:42:03.624Z
model: claude-opus-5-5

CAPTURE TEST — 8x assignment, Hammad Amer


[LOG_ENTRY type=RESPONSE num=1 session=4c0da286]
timestamp: 2026-09-29T17:42:07.051Z
model: claude-opus-5-5

I got your capture test message.

This session has not written anything to `.agent-logs/`. Two log files from earlier sessions today are already there and haven't been committed yet. If your hook writes a new log when a session ends, a third file should show up after this one. Want me to check it once it's written?


```
