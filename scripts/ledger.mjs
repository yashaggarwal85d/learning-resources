// The run ledger (LEDGER.md): two lines per routine run and per audit finding, appended straight to `main`, so every
// run is on record whether it shipped or stopped, and parallel runs never conflict over it (union merge, retries).
//   node scripts/ledger.mjs add "<line>" ["<second line>"]    append an entry (the daily audit uses this)
// run-metrics.mjs `finish` writes each run's entry through publish() below.
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const git = (args, cwd) => spawnSync('git', args, { cwd, encoding: 'utf8' });

const HEADER = `# Ledger

Every routine run and every audit finding, newest at the bottom: two lines each, written by \`scripts/run-metrics.mjs finish\` and \`scripts/ledger.mjs\`. Tokens are per model (input, cache and output together; output in brackets), from the session transcripts; hours are wall-clock. The daily audit (AUDIT.md) adds what it found in the reels shipped that day and which part of the pipeline let it through. Read it to see what the pipeline costs and where it fails.

`;

const short = { 'data-engineering': 'DE', 'data-structures-and-algorithms': 'DSA', 'rust-systems-engineering': 'Rust' };
const n = (x) => (x >= 1e6 ? `${(x / 1e6).toFixed(1)}M` : x >= 1e3 ? `${Math.round(x / 1e3)}k` : String(x));
const modelName = (id) => id.replace(/^claude-/, '').replace(/-(\d+)-(\d+)$/, ' $1.$2').replace(/^\w/, (c) => c.toUpperCase());

/** A run's entry: what it did, what it cost, what passed, what went wrong. */
export function runEntry({ date, domain, topic, outcome, totals, checks, issues }) {
  const when = date.slice(0, 16).replace('T', ' ');
  const models = Object.entries(totals.models ?? {})
    .map(([id, m]) => `${modelName(id)} ${n(m.input + m.cacheWrite + m.cacheRead + m.output)} (${n(m.output)} out)`)
    .join(' · ');
  return [
    `- **${when} UTC · ${short[domain] ?? domain} · \`${topic}\` · ${outcome}** · ${(totals.secs / 3600).toFixed(1)} h · ${models || 'no transcript'} · ${totals.subagents} agents, ${totals.calls} calls`,
    `  checks: ${checks || 'not reported'} · issues: ${issues || 'none'}`,
  ];
}

/** Append lines to LEDGER.md (and optionally a row to metrics/runs.jsonl) on origin/main, retrying if main moved. */
export function publish({ ledger = [], runs = [] }, message = 'Ledger: record a run') {
  const url = git(['remote', 'get-url', 'origin'], root).stdout.trim();
  for (let attempt = 0; attempt < 6; attempt++) {
    const dir = mkdtempSync(join(tmpdir(), 'ledger-'));
    try {
      // Only the two files are checked out: main also holds every reel's audio, which this doesn't need.
      if (git(['clone', '-q', '--depth', '1', '--filter=blob:none', '--sparse', '--branch', 'main', '--single-branch', url, dir], tmpdir()).status !== 0) throw new Error('clone failed');
      git(['sparse-checkout', 'set', '--no-cone', '/LEDGER.md', '/metrics/runs.jsonl', '/.gitattributes'], dir);
      const L = join(dir, 'LEDGER.md');
      if (!existsSync(L)) writeFileSync(L, HEADER);
      if (ledger.length) appendFileSync(L, ledger.join('\n') + '\n');
      if (runs.length) {
        spawnSync('mkdir', ['-p', join(dir, 'metrics')]);
        appendFileSync(join(dir, 'metrics', 'runs.jsonl'), runs.map((r) => JSON.stringify(r)).join('\n') + '\n');
      }
      git(['add', '--sparse', 'LEDGER.md', ...(runs.length ? ['metrics/runs.jsonl'] : [])], dir);
      git(['-c', 'user.name=routine-ledger', '-c', 'user.email=routine-ledger@users.noreply.github.com', 'commit', '-q', '-m', message], dir);
      if (git(['push', '-q', url, 'HEAD:refs/heads/main'], dir).status === 0) return true;
    } catch (e) {
      console.error(`ledger: attempt ${attempt + 1}: ${e.message}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
    spawnSync('sleep', [String(2 + Math.random() * 4 * (attempt + 1))]);
  }
  return false;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, ...lines] = process.argv.slice(2);
  if (cmd !== 'add' || !lines.length) {
    console.error('usage: ledger.mjs add "<line>" ["<second line>"]');
    process.exit(2);
  }
  const entry = [lines[0].startsWith('- ') ? lines[0] : `- ${lines[0]}`, ...lines.slice(1).map((l) => (l.startsWith('  ') ? l : `  ${l}`))];
  if (!publish({ ledger: entry }, 'Ledger: audit entry')) {
    console.error('ledger: could not push to main after 6 tries; add the lines to LEDGER.md by hand in your next commit to main');
    process.exit(1);
  }
  console.log('ledger: recorded on main');
}
