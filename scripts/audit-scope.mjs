// What the daily audit (AUDIT.md) checks: every topic shipped or changed on main since the last audit finished, and
// every run recorded in the ledger in that window.
//   node scripts/audit-scope.mjs        prints JSON { since, until, base, topics: [{ id, slug, status, title }], runs: [ledger lines] }
// The window starts at the last "AUDIT DONE" line in LEDGER.md (or 24 hours ago if there is none) and ends now.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' }).stdout.trim();

git('fetch', '-q', 'origin', 'main');
const ledger = git('show', 'origin/main:LEDGER.md') || (existsSync(`${root}/LEDGER.md`) ? readFileSync(`${root}/LEDGER.md`, 'utf8') : '');
const done = [...ledger.matchAll(/^- \*\*(\d{4}-\d\d-\d\d \d\d:\d\d) UTC · AUDIT DONE/gm)].pop();
const until = new Date();
const since = done ? new Date(`${done[1].replace(' ', 'T')}:00Z`) : new Date(until - 24 * 3600 * 1000);

// main as it was when the window opened; everything after it is in scope.
const base = git('rev-list', '-1', `--before=${since.toISOString()}`, 'origin/main') || git('rev-list', '--max-parents=0', 'origin/main').split('\n')[0];

const registry = (rev) => {
  const out = new Map();
  for (const m of git('show', `${rev}:site/src/topics/registry.ts`).matchAll(/\{\s*id: '([^']+)',[\s\S]*?slug: '([^']+)',\s*title: '((?:[^'\\]|\\.)*)',[\s\S]*?status: '(live|held)'[\s\S]*?\n  \}/g))
    out.set(m[2], { id: m[1], slug: m[2], title: m[3], status: m[4], text: m[0] });
  return out;
};
const now = registry('origin/main'), before = registry(base);
const changed = git('diff', '--name-only', base, 'origin/main').split('\n').filter(Boolean);
const topics = [...now.values()].filter(
  (t) => before.get(t.slug)?.text !== t.text || changed.some((p) => p.startsWith(`site/src/topics/${t.slug}/`) || p.startsWith(`site/public/audio/${t.id}/`)),
);

// Ledger entries (two lines each) written in the window, audits excluded.
const runs = [];
const lines = ledger.split('\n');
lines.forEach((l, i) => {
  const m = l.match(/^- \*\*(\d{4}-\d\d-\d\d \d\d:\d\d) UTC · (?!AUDIT)/);
  if (m && new Date(`${m[1].replace(' ', 'T')}:00Z`) >= since) runs.push([l, lines[i + 1] ?? ''].join('\n'));
});

console.log(JSON.stringify({ since: since.toISOString(), until: until.toISOString(), base, topics: topics.map(({ text, ...t }) => t), runs }, null, 2));
