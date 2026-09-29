#!/usr/bin/env node
// 8x agent capture: appends each prompt and each final response to
// .agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md (one file per session).
//
// Wired in .claude/settings.json:
//   SessionStart     -> remember the model for this session
//   UserPromptSubmit -> log the prompt verbatim
//   Stop             -> log the final response of the turn (no thinking, no tool calls)

const fs = require('fs');
const os = require('os');
const path = require('path');

const AUTHOR = 'Hammad-Amer';
const TOOL = 'claude-code';
const PROJECT = 'amazon-rebuild';

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function projectDir(input) {
  return process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
}

// Per-session scratch state (model name) lives outside the repo.
function statePath(sessionId) {
  return path.join(os.tmpdir(), `8x-capture-${sessionId}.json`);
}

function readState(sessionId) {
  try {
    return JSON.parse(fs.readFileSync(statePath(sessionId), 'utf8'));
  } catch {
    return {};
  }
}

function writeState(sessionId, state) {
  try {
    fs.writeFileSync(statePath(sessionId), JSON.stringify(state));
  } catch {}
}

function readTranscript(transcriptPath) {
  if (!transcriptPath) return [];
  try {
    return fs
      .readFileSync(transcriptPath, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function modelFromTranscript(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const m = entries[i].message;
    if (entries[i].type === 'assistant' && m && m.model && m.model !== '<synthetic>') return m.model;
  }
  return null;
}

// The final response is the text of the last assistant message in the transcript.
// One API message can be split across several transcript lines sharing message.id.
function finalResponseFromTranscript(entries) {
  let lastId = null;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.type !== 'assistant' || !e.message || !Array.isArray(e.message.content)) continue;
    if (e.message.content.some((c) => c.type === 'text' && c.text && c.text.trim())) {
      lastId = e.message.id;
      break;
    }
  }
  if (!lastId) return null;
  return entries
    .filter((e) => e.type === 'assistant' && e.message && e.message.id === lastId)
    .flatMap((e) => e.message.content)
    .filter((c) => c.type === 'text' && c.text)
    .map((c) => c.text)
    .join('\n\n')
    .trim();
}

function findLogFile(logDir, sessionId) {
  if (!fs.existsSync(logDir)) return null;
  const match = fs.readdirSync(logDir).find((f) => f.endsWith(`_${sessionId}.md`));
  return match ? path.join(logDir, match) : null;
}

function fileStamp(iso) {
  // 2026-09-29T21:14:02.118Z -> 2026-09-29_21-14-02
  return iso.slice(0, 19).replace('T', '_').replace(/:/g, '-');
}

function frontmatter(sessionId, model, body) {
  const promptTimes = [...body.matchAll(/\[LOG_ENTRY type=PROMPT[^\]]*\]\ntimestamp: (\S+)/g)].map((m) => m[1]);
  const date = (promptTimes[0] || new Date().toISOString()).slice(0, 10);
  return [
    '---',
    `session_id: ${sessionId}`,
    `date: ${date}`,
    `author: ${AUTHOR}`,
    `model: ${model}`,
    `tool: ${TOOL}`,
    `project: ${PROJECT}`,
    `total_exchanges: ${promptTimes.length}`,
    `first_prompt_time: ${promptTimes[0] || ''}`,
    `last_prompt_time: ${promptTimes[promptTimes.length - 1] || ''}`,
    '---',
    '',
    `# Session Log - ${date}`,
    '',
    `Session: \`${sessionId.slice(0, 8)}\` | Project: \`${PROJECT}\` | Author: \`${AUTHOR}\``,
    '',
    '---',
    '',
    '',
  ].join('\n');
}

function splitFile(content) {
  // Body starts after the "# Session Log" header block, which ends with the second '---' line.
  const marker = '\n---\n\n';
  const headerEnd = content.indexOf('# Session Log');
  if (headerEnd === -1) return '';
  const bodyStart = content.indexOf(marker, headerEnd);
  return bodyStart === -1 ? '' : content.slice(bodyStart + marker.length);
}

function appendEntry(logDir, sessionId, type, model, text, now) {
  fs.mkdirSync(logDir, { recursive: true });
  let file = findLogFile(logDir, sessionId);
  let body = file ? splitFile(fs.readFileSync(file, 'utf8')) : '';
  if (!file) file = path.join(logDir, `${fileStamp(now)}_${sessionId}.md`);

  const promptCount = (body.match(/\[LOG_ENTRY type=PROMPT /g) || []).length;
  const num = type === 'PROMPT' ? promptCount + 1 : Math.max(promptCount, 1);

  // Only one response per prompt.
  if (type === 'RESPONSE' && body.includes(`[LOG_ENTRY type=RESPONSE num=${num} `)) return;

  body +=
    `[LOG_ENTRY type=${type} num=${num} session=${sessionId.slice(0, 8)}]\n` +
    `timestamp: ${now}\n` +
    `model: ${model}\n\n` +
    `${text}\n\n\n`;

  fs.writeFileSync(file, frontmatter(sessionId, model, body) + body, 'utf8');
}

function main() {
  let input = {};
  try {
    input = JSON.parse(readStdin() || '{}');
  } catch {
    return;
  }
  const sessionId = input.session_id;
  if (!sessionId) return;

  const event = input.hook_event_name;
  const logDir = path.join(projectDir(input), '.agent-logs');
  const state = readState(sessionId);
  const now = new Date().toISOString();

  if (event === 'SessionStart') {
    if (input.model) writeState(sessionId, { ...state, model: input.model });
    return;
  }

  if (event === 'UserPromptSubmit') {
    const model = modelFromTranscript(readTranscript(input.transcript_path)) || state.model || 'unknown';
    appendEntry(logDir, sessionId, 'PROMPT', model, input.prompt ?? '', now);
    return;
  }

  if (event === 'Stop') {
    const entries = readTranscript(input.transcript_path);
    const model = modelFromTranscript(entries) || state.model || 'unknown';
    if (model !== 'unknown') writeState(sessionId, { ...state, model });
    const text = input.last_assistant_message || finalResponseFromTranscript(entries);
    if (text) appendEntry(logDir, sessionId, 'RESPONSE', model, text, now);
  }
}

try {
  main();
} catch (err) {
  // Never block the agent; report to stderr only.
  process.stderr.write(`capture hook error: ${err && err.message}\n`);
}
process.exit(0);
