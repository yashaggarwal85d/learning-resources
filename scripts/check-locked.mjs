// Live reels are locked: once a topic is live (signed off and shipped), nothing it is made of may change by accident.
//   node scripts/check-locked.mjs [base]     checks the changes from <base> (default origin/main) to HEAD; exit 1 if any
//                                            touch a locked reel without an unlock
// A live topic's files are: its folder, its narration audio, its registry entry, every file its reel imports (followed
// through relative imports, so a chapter-level file such as refreshers.tsx counts), and the shared player code every
// reel runs on (SHARED below). A change to any of them needs a commit in the range whose message has a line
// "Unlock: <topic-id>" (or "Unlock: shared" for SHARED files), written only when the owner asked for that change
// (ROUTINE.md section 0). Routine runs never write one.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, resolve } from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });
const SHARED = ['site/src/reels/ReelPlayer.tsx', 'site/src/reels/ReelFeed.tsx', 'site/src/reels/narration.ts', 'site/src/reels/progress.ts', 'site/src/layouts/', 'site/src/styles/', 'site/src/pages/'];

const base = process.argv[2] && !/^0+$/.test(process.argv[2]) ? process.argv[2] : 'origin/main';
if (git('rev-parse', '--verify', '--quiet', `${base}^{commit}`).status !== 0) {
  console.log(`check-locked: base ${base} not found, nothing to compare`);
  process.exit(0);
}
const mergeBase = git('merge-base', base, 'HEAD').stdout.trim() || base;
const changed = git('diff', '--name-only', mergeBase, 'HEAD').stdout.split('\n').filter(Boolean);
const messages = git('log', '--format=%B', `${mergeBase}..HEAD`).stdout;
const unlocked = new Set([...messages.matchAll(/^Unlock:\s*(\S+)/gm)].map((m) => m[1]));

// Live topics as they were before these changes (a topic going live in this range isn't locked yet).
const registry = (rev) => {
  const src = git('show', `${rev}:site/src/topics/registry.ts`).stdout;
  const out = [];
  for (const m of src.matchAll(/\{\s*id: '([^']+)',[\s\S]*?slug: '([^']+)',[\s\S]*?status: '(live|held)'[\s\S]*?\n  \}/g)) out.push({ id: m[1], slug: m[2], live: m[3] === 'live', text: m[0] });
  return out;
};
const before = registry(mergeBase).filter((t) => t.live);
const after = new Map(registry('HEAD').map((t) => [t.id, t]));

// Files a topic's reel imports, followed through relative imports (read at the base revision).
const show = (p) => git('show', `${mergeBase}:${p}`);
function imports(dir) {
  const seen = new Set();
  const queue = git('ls-tree', '-r', '--name-only', mergeBase, '--', dir).stdout.split('\n').filter((p) => /\.(tsx?|mdx)$/.test(p));
  while (queue.length) {
    const p = queue.pop();
    if (seen.has(p)) continue;
    seen.add(p);
    const src = show(p).stdout;
    for (const m of src.matchAll(/from\s+'(\.[^']+)'/g)) {
      const target = normalize(join(dirname(p), m[1]));
      const hit = ['', '.tsx', '.ts', '/index.tsx', '/index.ts'].map((e) => target + e).find((c) => show(c).status === 0);
      if (hit) queue.push(hit);
    }
  }
  return seen;
}

const problems = [];
for (const t of before) {
  const dir = `site/src/topics/${t.slug}/`;
  // The registry is the index every topic adds itself to; a live topic's own entry is compared on its own below.
  const owned = new Set([...imports(dir)].filter((p) => p !== 'site/src/topics/registry.ts'));
  const hits = changed.filter((p) => p.startsWith(dir) || p.startsWith(`site/public/audio/${t.id}/`) || owned.has(p));
  if (after.get(t.id)?.text !== t.text) hits.push(`site/src/topics/registry.ts (the ${t.id} entry)`);
  if (hits.length && !unlocked.has(t.id)) problems.push(`${t.id} is live and locked, but these changed: ${[...new Set(hits)].join(', ')}`);
}
const shared = changed.filter((p) => SHARED.some((s) => p === s || (s.endsWith('/') && p.startsWith(s))));
if (before.length && shared.length && !unlocked.has('shared')) problems.push(`shared reel code every live reel runs on changed: ${shared.slice(0, 8).join(', ')}${shared.length > 8 ? ` and ${shared.length - 8} more` : ''}`);

if (problems.length) {
  console.error(`check-locked: live reels are locked (scripts/check-locked.mjs):\n- ${problems.join('\n- ')}\nOnly the owner unlocks a live reel: a commit line "Unlock: <topic-id>" (or "Unlock: shared"), added when they asked for the change.`);
  process.exit(1);
}
console.log(`check-locked: ${before.length} live reel(s) locked; ${unlocked.size ? `unlocked here: ${[...unlocked].join(', ')}` : 'none touched'}`);
