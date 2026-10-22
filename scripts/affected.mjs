// Which live reels a change can affect, so checks test those instead of every reel on every push.
//   node scripts/affected.mjs [base]        prints JSON { all, slugs, mdx } for the changes from <base> (default origin/main) to HEAD
// `all` is true when the change touches anything shared (site code outside the topic folders, tests, packages, workflows),
// or when the base can't be compared; then every reel is affected. Otherwise `slugs` lists the topics whose folder,
// registry entry or audio changed, or that sit under a changed chapter-level file, and `mdx` their Deep dive and
// Prerequisites files (for the link check). The weekly full runs and a change to shared code still test everything.
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });

// Registry entries (id, slug, status, and the whole entry text) at a revision, read without importing it.
function registry(rev) {
  const src = rev ? git('show', `${rev}:site/src/topics/registry.ts`).stdout : '';
  const out = new Map();
  for (const m of src.matchAll(/\{\s*id: '([^']+)',[\s\S]*?slug: '([^']+)',[\s\S]*?\n  \}/g)) out.set(m[2], { id: m[1], text: m[0] });
  return out;
}

export function affected(base = 'origin/main') {
  const all = { all: true, slugs: [], mdx: [] };
  if (!base || /^0+$/.test(base) || git('rev-parse', '--verify', '--quiet', `${base}^{commit}`).status !== 0) return all;
  const mergeBase = git('merge-base', base, 'HEAD').stdout.trim() || base;
  const changed = git('diff', '--name-only', mergeBase, 'HEAD').stdout.split('\n').filter(Boolean);
  const now = registry('HEAD'), before = registry(mergeBase);
  const topics = [...now.keys()].map((slug) => ({ slug, id: now.get(slug).id, dir: `site/src/topics/${slug}/` }));
  const hit = new Set();
  for (const p of changed) {
    if (p === 'site/src/topics/registry.ts') {
      for (const [slug, e] of now) if (before.get(slug)?.text !== e.text) hit.add(slug);
      continue;
    }
    if (p.startsWith('site/src/topics/')) {
      const owner = topics.find((t) => p.startsWith(t.dir));
      if (owner) hit.add(owner.slug);
      else for (const t of topics) if (t.dir.startsWith(dirname(p) + '/')) hit.add(t.slug); // a chapter-level file
      continue;
    }
    const audio = p.match(/^site\/public\/audio\/([^/]+)\//);
    if (audio) {
      const t = topics.find((x) => x.id === audio[1]);
      if (t) hit.add(t.slug);
      continue;
    }
    // Docs, syllabi and metrics don't change how a reel renders; the build checks syllabi on every run anyway.
    if (/^(syllabus\/|metrics\/|\.claude\/|[^/]+\.md$|site\/narration\/)/.test(p) || /^scripts\/(next-topic|run-metrics|ledger|sources|check-locked|claim|audit-scope|apply-notes-edit)\.mjs$/.test(p) || p === 'scripts/claim-settings.json' || p === '.gitattributes') continue;
    return all; // shared code, tests, packages, workflows: everything is affected
  }
  const slugs = [...hit];
  return { all: false, slugs, mdx: slugs.flatMap((s) => ['prerequisites.mdx', 'pre-notes.md', 'post-notes.md', 'references.md'].map((f) => `site/src/topics/${s}/${f}`)) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(affected(process.argv[2])));
