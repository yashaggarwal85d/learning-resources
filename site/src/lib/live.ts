// Joins the syllabus with the live topics in src/topics/registry.ts, at build time.
import { loadDomains, type Domain } from './syllabus';
import { TOPICS, type TopicMeta } from '../topics/registry';

type Flat = { domain: string; title: string; refresher: boolean; m: number; mTitle: string; c: number; cTitle: string };

const flatten = (d: Domain): Flat[] =>
  d.milestones.flatMap((m) =>
    m.chapters.flatMap((c) => c.topics.map((t) => ({ domain: d.id, title: t.title, refresher: t.refresher, m: m.number, mTitle: m.title, c: c.number, cTitle: c.title }))),
  );

let cache: ReturnType<typeof build> | null = null;
export const liveData = () => (cache ??= build());

function build() {
  const domains = loadDomains();
  const flat = new Map(domains.map((d) => [d.id, flatten(d)]));
  const byTitle = new Map<string, TopicMeta>();

  for (const t of TOPICS) {
    const list = flat.get(t.domain);
    if (!list) throw new Error(`Topic ${t.id}: unknown domain ${t.domain}`);
    if (!list.some((x) => x.title === t.syllabusTitle)) throw new Error(`Topic ${t.id}: "${t.syllabusTitle}" is not a topic in syllabus/${t.domain}.md`);
    byTitle.set(`${t.domain}::${t.syllabusTitle}`, t);
  }
  const liveFor = (domain: string, title: string) => byTitle.get(`${domain}::${title}`);

  // Live topics in syllabus order (the registry order doesn't matter).
  const ordered: TopicMeta[] = domains.flatMap((d) => flat.get(d.id)!.map((x) => liveFor(d.id, x.title)).filter((x): x is TopicMeta => !!x));

  // The next reel after each live topic: the next full topic in the syllabus (refreshers are short pages, not reels).
  const nextAfter: Record<string, { title: string; live: boolean } | null> = {};
  for (const t of ordered) {
    const list = flat.get(t.domain)!.filter((x) => !x.refresher);
    const i = list.findIndex((x) => x.title === t.syllabusTitle);
    const n = list[i + 1];
    nextAfter[t.id] = n ? { title: liveFor(t.domain, n.title)?.title ?? n.title, live: !!liveFor(t.domain, n.title) } : null;
  }

  // What's being produced next in each domain: the earliest full topics without a reel yet.
  const upcoming: Record<string, string[]> = {};
  for (const d of domains) {
    upcoming[d.id] = flat.get(d.id)!.filter((x) => !x.refresher && !liveFor(d.id, x.title)).slice(0, 3).map((x) => x.title);
  }

  const totalTopics = domains.reduce((n, d) => n + d.counts.topics, 0);
  const tree = domains
    .map((d) => ({
      id: d.id,
      title: d.title,
      coming: d.counts.topics - ordered.filter((t) => t.domain === d.id).length,
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
