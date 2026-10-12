// Joins the syllabus with the live topics in src/topics/registry.ts, at build time.
import { loadDomains, type Domain } from './syllabus';
import { TOPICS, type TopicMeta } from '../topics/registry';
import { checkCoverage } from './coverage';
import { checkTopicFiles } from './topic-checks';

type Flat = { domain: string; title: string; refresher: boolean; skipped: boolean; m: number; mTitle: string; c: number; cTitle: string };

const flatten = (d: Domain): Flat[] =>
  d.milestones.flatMap((m) =>
    m.chapters.flatMap((c) => c.topics.map((t) => ({ domain: d.id, title: t.title, refresher: t.refresher, skipped: t.skipped, m: m.number, mTitle: m.title, c: c.number, cTitle: c.title }))),
  );

let cache: ReturnType<typeof build> | null = null;
export const liveData = () => (cache ??= build());

function build() {
  const domains = loadDomains();
  const flat = new Map(domains.map((d) => [d.id, flatten(d)]));
  const byTitle = new Map<string, TopicMeta>();
  const heldByTitle = new Map<string, TopicMeta>();
  // PREVIEW_HELD=1 (tests only, never a deploy): held topics get pages and join the feed, so the reel test and the looks
  // review can check a topic that is finished but waiting for the topics before it. The flow rules still treat it as held.
  const preview = process.env.PREVIEW_HELD === '1';

  for (const t of TOPICS) {
    const list = flat.get(t.domain);
    if (!list) throw new Error(`Topic ${t.id}: unknown domain ${t.domain}`);
    if (!list.some((x) => x.title === t.syllabusTitle)) throw new Error(`Topic ${t.id}: "${t.syllabusTitle}" is not a topic in syllabus/${t.domain}.md`);
    if (t.status === 'live') byTitle.set(`${t.domain}::${t.syllabusTitle}`, t);
    else heldByTitle.set(`${t.domain}::${t.syllabusTitle}`, t);
  }
  const liveFor = (domain: string, title: string) => byTitle.get(`${domain}::${title}`);
  checkFlow(domains, flat, liveFor);
  // Every finished topic, live or held, must cover its whole scope (Rule #6).
  checkCoverage(domains, TOPICS);
  // Narration lines up with the reel and is speakable; every number on screen is executed (QUALITY.md #35).
  checkTopicFiles(TOPICS);

  // Live topics in syllabus order (the registry order doesn't matter).
  const shown = (domain: string, title: string) => liveFor(domain, title) ?? (preview ? heldByTitle.get(`${domain}::${title}`) : undefined);
  const ordered: TopicMeta[] = domains.flatMap((d) => flat.get(d.id)!.map((x) => shown(d.id, x.title)).filter((x): x is TopicMeta => !!x));

  // The next reel after each live topic: the next topic in the syllabus (refreshers are reels too).
  const nextAfter: Record<string, { title: string; live: boolean } | null> = {};
  for (const t of ordered) {
    const list = flat.get(t.domain)!;
    const i = list.findIndex((x) => x.title === t.syllabusTitle);
    const n = list.slice(i + 1).find((x) => !x.skipped);
    nextAfter[t.id] = n ? { title: liveFor(t.domain, n.title)?.title ?? n.title, live: !!liveFor(t.domain, n.title) } : null;
  }

  // What's being produced next in each domain: the earliest topics without a live reel.
  const upcoming: Record<string, string[]> = {};
  for (const d of domains) {
    upcoming[d.id] = flat.get(d.id)!.filter((x) => !x.skipped && !liveFor(d.id, x.title)).slice(0, 3).map((x) => x.title);
  }

  // Skipped topics stay in the curriculum but never get a reel, so they are not "coming".
  const totalTopics = domains.reduce((n, d) => n + d.counts.topics - d.counts.skipped, 0);
  const tree = domains
    .map((d) => ({
      id: d.id,
      title: d.title,
      coming: d.counts.topics - d.counts.skipped - ordered.filter((t) => t.domain === d.id).length,
      milestones: d.milestones
        .map((m) => ({
          number: m.number,
          title: m.title,
          chapters: m.chapters
            .map((c) => ({
              number: c.number,
              title: c.title,
              topics: c.topics.map((t) => liveFor(d.id, t.title)).filter((x): x is TopicMeta => !!x).map((x) => ({ id: x.id, title: x.title })),
            }))
            .filter((c) => c.topics.length),
        }))
        .filter((m) => m.chapters.length),
    }))
    .filter((d) => d.milestones.length);

  // Where a topic sits in its domain's order (refreshers included), for before/after checks.
  const position = (domain: string, title: string) => flat.get(domain)?.findIndex((x) => x.title === title) ?? -1;

  return {
    position,
    domains,
    ordered,
    liveFor,
    nextAfter,
    upcoming,
    tree,
    comingTotal: totalTopics - ordered.length,
    feedDomains: domains.map((d) => ({ id: d.id, title: d.title, live: ordered.filter((t) => t.domain === d.id).length })),
  };
}

/**
 * The flow rules (PROJECT_PLAN.md, Rule #5), enforced on every build:
 * no gaps before a live topic, every concept taught before it is used, and a
 * bridge and handoff on every live topic.
 */
function checkFlow(domains: Domain[], flat: Map<string, Flat[]>, liveFor: (d: string, t: string) => TopicMeta | undefined) {
  const errors: string[] = [];
  for (const d of domains) {
    const list = flat.get(d.id)!;
    const taught = new Set<string>();
    list.forEach((x, i) => {
      const t = liveFor(d.id, x.title);
      if (!t) return;
      if (x.skipped) errors.push(`${t.id} has a reel, but the syllabus marks "${x.title}" *(skipped)*: no reel is made for a skipped topic. Remove the mark or the topic.`);
      const gaps = list.slice(0, i).filter((y) => !y.skipped && !liveFor(d.id, y.title));
      if (gaps.length)
        errors.push(`${t.id} is live, but ${gaps.length} topic(s) before it are not: ${gaps.slice(0, 3).map((g) => `"${g.title}"`).join(', ')}${gaps.length > 3 ? ', …' : ''}. Hold it until they are.`);
      const missing = t.uses.filter((c) => !taught.has(c) && !t.declared?.includes(c));
      if (missing.length) errors.push(`${t.id} uses ${missing.join(', ')}, which no earlier live topic in ${d.id} introduces. Teach it earlier, explain it in this topic (introduces) or declare it.`);
      if (!t.bridge.trim() || !t.handoff.trim()) errors.push(`${t.id} needs both a bridge from the topic before it and a handoff to the next.`);
      if ((t.kind === 'refresher') !== x.refresher) errors.push(`${t.id} is a ${t.kind} topic, but the syllabus marks it ${x.refresher ? 'refresher' : 'full'}.`);
      t.introduces.forEach((c) => taught.add(c));
    });
  }
  if (errors.length) throw new Error(`Flow check failed (PROJECT_PLAN.md, Rule #5):\n- ${errors.join('\n- ')}`);
}
