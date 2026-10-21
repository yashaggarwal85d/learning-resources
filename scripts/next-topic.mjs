// What to make next in a domain, for the make-topic skill (.claude/skills/make-topic). Read-only: it claims nothing.
//   node scripts/next-topic.mjs <domain>          the next topic to make, as JSON
//   node scripts/next-topic.mjs <domain> --all    every topic of the domain with its status
// <domain> is a domain id, title or prefix ("data-structures-and-algorithms", "Data Structures & Algorithms", "dsa", "Rust").
//
// The next topic is the first one in syllabus order that is not in the registry, skipping topics marked *(skipped)*.
// The JSON says whether its chapter has a plan yet (CHAPTER.md: plan the chapter first when it has none), the topic's
// permanent id and folder (the chapter's folder as existing topics already use it, else one made from the syllabus
// titles), whether work on it has already started (its folder exists: resume from OUTLINE.md → "Progress"), and the
// topics before and after it.
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const die = (msg) => {
  console.error(`next-topic: ${msg}`);
  process.exit(2);
};
const [domainArg, flag] = process.argv.slice(2);
if (!domainArg) die('usage: node scripts/next-topic.mjs <domain> [--all]');

// The syllabus order and the registry, read the same way the build reads them.
process.chdir(join(root, 'site'));
const { loadDomains } = await import(pathToFileURL(join(root, 'site/src/lib/syllabus.ts')).href);
const { TOPICS } = await import(pathToFileURL(join(root, 'site/src/topics/registry.ts')).href);
const domains = loadDomains();
process.chdir(root);
const alias = { de: 'data-engineering', dsa: 'data-structures-and-algorithms', rust: 'rust-systems-engineering' };
const want = (alias[domainArg.toLowerCase()] ?? domainArg).toLowerCase().replace(/&/g, 'and').replace(/[^a-z]+/g, ' ').trim();
const d = domains.find((x) => [x.id, x.title].some((n) => { const s = n.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]+/g, ' ').trim(); return s === want || s.startsWith(want + ' '); }));
if (!d) die(`unknown domain "${domainArg}"`);
const domain = d.id;
const order = d.milestones.flatMap((m) => m.chapters.flatMap((c) => c.topics.filter((t) => !t.skipped).map((t) => ({ title: t.title, refresher: !!t.refresher, scope: t.scope, m, c }))));
const reg = new Map(TOPICS.filter((t) => t.domain === domain).map((t) => [t.syllabusTitle, t]));

const PREFIX = { 'data-engineering': 'de', 'data-structures-and-algorithms': 'dsa', 'rust-systems-engineering': 'rust' };
const words = (x, n) => x.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter((w) => !['and', 'the', 'of', 'a', 'an', 'in', 'to', 'for', 'with', 'its'].includes(w)).slice(0, n).join('-');

// Chapters whose plan exists: chapter number -> "<milestone dir>/<chapter dir>".
const plans = new Map();
const domainDir = join(root, 'site/src/topics', domain);
for (const m of existsSync(domainDir) ? readdirSync(domainDir) : [])
  for (const c of existsSync(join(domainDir, m)) && /^m\d+-/.test(m) ? readdirSync(join(domainDir, m)) : []) {
    const n = c.match(/^ch(\d+)-/);
    if (n && existsSync(join(domainDir, m, c, 'CHAPTER.md'))) plans.set(Number(n[1]), `${m}/${c}`);
  }

// Where a topic goes: in its chapter's planned folder, else the folder its chapter's topics already use, else one made
// from the syllabus titles.
function placeFor(t) {
  const slug = words(t.title, 4);
  const topicId = `${PREFIX[domain]}.${slug}`;
  if (plans.has(t.c.number)) return { topicId, folder: `site/src/topics/${domain}/${plans.get(t.c.number)}/${slug}` };
  const fromReg = [...reg.values()].find((r) => r.milestone.number === t.m.number && r.chapter.number === t.c.number);
  const milestoneDir = [...reg.values()].find((r) => r.milestone.number === t.m.number)?.slug.split('/')[1] ?? `m${t.m.number}-${words(t.m.title, 3)}`;
  const chapterDir = fromReg ? fromReg.slug.split('/').slice(0, 3).join('/') : `${domain}/${milestoneDir}/ch${String(t.c.number).padStart(2, '0')}-${words(t.c.title, 3)}`;
  return { topicId, folder: `site/src/topics/${chapterDir}/${slug}` };
}

const describe = (i) => {
  if (i < 0 || i >= order.length) return null;
  const t = order[i], r = reg.get(t.title);
  const place = r ? { topicId: r.id, folder: `site/src/topics/${r.slug}` } : placeFor(t);
  const started = !r && existsSync(join(root, place.folder));
  return { index: i + 1, title: t.title, syllabusLine: t.scope, kind: t.refresher ? 'refresher' : 'full', status: r ? r.status : started ? 'in progress' : 'not started', ...place, chapter: { number: t.c.number, title: t.c.title, milestone: t.m.number } };
};

if (flag === '--all') {
  console.log(JSON.stringify(order.map((_, i) => describe(i)), null, 2));
  process.exit(0);
}
const i = order.findIndex((t) => !reg.has(t.title));
if (i < 0) {
  console.log(JSON.stringify({ action: 'done', domain, reason: 'every topic of this domain that gets a reel is in the registry' }, null, 2));
  process.exit(0);
}
const t = order[i];
const chapterTopics = order.filter((x) => x.c.number === t.c.number).map((x) => describe(order.indexOf(x)));
const planPath = plans.has(t.c.number) ? `site/src/topics/${domain}/${plans.get(t.c.number)}/CHAPTER.md` : null;
console.log(
  JSON.stringify(
    {
      action: planPath ? 'make' : 'plan-chapter',
      domain,
      topic: describe(i),
      chapter: { number: t.c.number, title: t.c.title, milestone: { number: t.m.number, title: t.m.title }, plan: planPath, folder: planPath ? dirname(planPath) : `${dirname(placeFor(t).folder)}`, topics: chapterTopics },
      previous: describe(i - 1),
      next: describe(i + 1),
      nextChapterFirst: describe(order.findIndex((x) => x.c.number > t.c.number && x.m.number >= t.m.number)),
    },
    null,
    2,
  ),
);
