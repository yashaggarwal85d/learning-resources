// Records what a routine run cost, from the session transcript Claude Code keeps (~/.claude/projects/**.jsonl).
//   node scripts/run-metrics.mjs mark <stage>                     at the start of each ROUTINE.md section: snapshot of tokens and time so far
//   node scripts/run-metrics.mjs finish <domain> <topic-id> <outcome>   at the end: totals and per-stage deltas, appended to metrics/runs.jsonl
// Tokens are summed from the `usage` of every assistant message in this session's transcript (and its subagents' transcripts,
// where they are stored beside it). No prices are assumed: cost = tokens x your plan's rates, worked out when you read the log.
// Missing transcript = a clear message and no invented numbers.
import { readdirSync, readFileSync, statSync, existsSync, appendFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir, tmpdir } from 'node:os';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const projects = join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude'), 'projects');
const state = join(tmpdir(), 'run-metrics-marks.json');

const walk = (d) => (existsSync(d) ? readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : n.endsWith('.jsonl') ? [join(d, n)] : [])) : []);
// This run's transcripts: the most recently written session file, plus any subagent files under its folder.
const main = walk(projects).filter((f) => !f.includes('/subagents/')).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
if (!main) {
  console.error('run-metrics: no Claude Code transcript found; nothing recorded.');
  process.exit(0);
}
const files = [main, ...walk(main.replace(/\.jsonl$/, ''))];

function snapshot() {
  const t = { input: 0, cacheWrite: 0, cacheRead: 0, output: 0, calls: 0, tools: 0, subagents: 0 };
  let first = Infinity, last = 0;
  const byId = new Map(); // a message is logged once per content block with growing usage: keep the last
  for (const f of files) {
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      let d;
      try { d = JSON.parse(line); } catch { continue; }
      const ts = Date.parse(d.timestamp ?? '');
      if (ts) { first = Math.min(first, ts); last = Math.max(last, ts); }
      const m = d.message;
      if (!m || typeof m !== 'object') continue;
      if (m.usage && m.id) byId.set(m.id, m.usage);
      if (Array.isArray(m.content)) for (const c of m.content) if (c.type === 'tool_use') { t.tools++; if (c.name === 'Agent' || c.name === 'Task') t.subagents++; }
    }
  }
  for (const u of byId.values()) {
    t.input += u.input_tokens ?? 0;
    t.cacheWrite += u.cache_creation_input_tokens ?? 0;
    t.cacheRead += u.cache_read_input_tokens ?? 0;
    t.output += u.output_tokens ?? 0;
    t.calls++;
  }
  return { ...t, start: first, now: last };
}
const diff = (a, b) => Object.fromEntries(['input', 'cacheWrite', 'cacheRead', 'output', 'calls', 'tools', 'subagents'].map((k) => [k, b[k] - a[k]]).concat([['secs', Math.round((b.now - a.now) / 1000)]]));

const [cmd, ...args] = process.argv.slice(2);
const marks = existsSync(state) ? JSON.parse(readFileSync(state, 'utf8')) : [];
if (cmd === 'mark') {
  marks.push({ stage: args[0], ...snapshot() });
  writeFileSync(state, JSON.stringify(marks));
  console.log(`run-metrics: marked ${args[0]}`);
} else if (cmd === 'finish') {
  const [domain, topic, outcome = 'shipped'] = args;
  const end = snapshot();
  const points = [...marks, { stage: 'end', ...end }];
  const stages = marks.map((m, i) => ({ stage: m.stage, ...diff(m, points[i + 1]) }));
  const row = { date: new Date().toISOString(), domain, topic, outcome, totals: { ...diff({ input: 0, cacheWrite: 0, cacheRead: 0, output: 0, calls: 0, tools: 0, subagents: 0, now: end.start }, end) }, stages };
  mkdirSync(join(root, 'metrics'), { recursive: true });
  appendFileSync(join(root, 'metrics', 'runs.jsonl'), JSON.stringify(row) + '\n');
  writeFileSync(state, '[]');
  console.log('run-metrics:', JSON.stringify(row.totals));
} else {
  console.error('usage: run-metrics.mjs mark <stage> | finish <domain> <topic-id> <outcome>');
  process.exit(2);
}
