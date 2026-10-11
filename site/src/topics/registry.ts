// Every finished topic, live or held. A topic goes live by adding its folder
// under src/topics/ and one entry here. The build (src/lib/live.ts) enforces
// the flow rules (PROJECT_PLAN.md, Rule #5):
//   - `syllabusTitle` must match a topic in the domain's syllabus;
//   - a topic is live only if every topic before it in its domain is live;
//   - every concept a live topic `uses` must be introduced by an earlier live
//     topic in the same domain, or listed in `declared` (another track, or
//     knowledge every reader of this course has);
//   - every live topic has a `bridge` from the topic before it and a
//     `handoff` to the topic after it.
export type TopicMeta = {
  id: string; // permanent: progress and links key on it
  domain: string;
  slug: string; // URL path below the site root
  title: string;
  syllabusTitle: string;
  kind: 'full' | 'refresher';
  status: 'live' | 'held'; // held: finished, waiting for the topics before it
  milestone: { number: number; title: string };
  chapter: { number: number; title: string; section: string };
  minutes: number; // typical time through the reel
  verified: string; // date the content was last checked against its sources
  introduces: string[]; // concepts this topic teaches
  uses: string[]; // concepts it relies on
  declared?: string[]; // concepts it relies on that this domain doesn't teach first
  bridge: string; // the opening line: how it follows from the topic before
  handoff: string; // the closing line: why the next topic follows
};

export const TOPICS: TopicMeta[] = [
  {
    id: 'de.python-essentials',
    domain: 'data-engineering',
    slug: 'data-engineering/m1-foundations/ch01-cs-foundations/python-essentials',
    title: 'Python essentials',
    syllabusTitle: 'Python language essentials',
    kind: 'refresher',
    status: 'live',
    milestone: { number: 1, title: 'Foundations' },
    chapter: { number: 1, title: 'Computer-science foundations', section: '1.1' },
    minutes: 5,
    verified: '2026-10-10',
    introduces: ['python-functions', 'mutable-defaults', 'comprehensions', 'generators', 'context-managers', 'decorators', 'dataclasses', 'type-hints'],
    uses: [],
    declared: ['programming'],
    bridge: 'Data Engineering opens with five quick refreshers. Skim what you know; stop where you are rusty.',
    handoff: 'Next refresher: Git, the history behind every pipeline change.',
  },
  {
    id: 'de.git-branching-history-workflows',
    domain: 'data-engineering',
    slug: 'data-engineering/m1-foundations/ch01-cs-foundations/git-branching-history-workflows',
    title: 'Git branching and history',
    syllabusTitle: 'Git branching and history workflows',
    kind: 'refresher',
    status: 'live',
    milestone: { number: 1, title: 'Foundations' },
    chapter: { number: 1, title: 'Computer-science foundations', section: '1.1' },
    minutes: 5,
    verified: '2026-10-11',
    introduces: ['commit-graph', 'merge-vs-rebase', 'interactive-rebase', 'reflog', 'merge-conflicts', 'git-bisect', 'exit-status', 'pr-merge-strategies', 'trunk-based-development'],
    uses: [],
    declared: ['git-basics'],
    bridge: "You've got the Python; every change to it lands as a commit. Here is how to shape that history, search it and share it.",
    handoff: 'Next refresher: the Linux shell, where exit codes like the ones bisect reads come from.',
  },
  {
    id: 'de.io-cost-model',
    domain: 'data-engineering',
    slug: 'data-engineering/m1-foundations/ch01-cs-foundations/io-cost-model',
    title: 'The I/O cost model',
    syllabusTitle: 'The external-memory (I/O) cost model',
    kind: 'full',
    // Built ahead of its turn: it waits until every topic before it is live.
    status: 'held',
    milestone: { number: 1, title: 'Foundations' },
    chapter: { number: 1, title: 'Computer-science foundations', section: '1.3' },
    minutes: 12,
    verified: '2026-10-10',
    introduces: ['io-model', 'scan-cost', 'index-crossover', 'random-vs-sequential-cost', 'clustered-vs-unclustered', 'external-sort-passes', 'block-size-per-tier', 'db-pages'],
    uses: ['big-o', 'logarithms', 'memory-hierarchy', 'storage-devices', 'object-storage', 'b-tree-lookup'],
    declared: ['merge-sort', 'sql-select'],
    bridge: 'You have just revised how a B+-tree finds a row in a few page reads. Now: what happens when the index finds thousands of them?',
    handoff: 'Next: hash tables, the other structure behind every join and aggregation, and what they cost when memory runs out.',
  },
];
