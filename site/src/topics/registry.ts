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
  {
    id: 'dsa.asymptotic-notation',
    domain: 'data-structures-and-algorithms',
    slug: 'data-structures-and-algorithms/m1-data-structures/ch01-cost-models/asymptotic-notation',
    title: 'Asymptotic notation and case analysis',
    syllabusTitle: 'Asymptotic notation and case analysis',
    kind: 'refresher',
    status: 'live',
    milestone: { number: 1, title: 'Data Structures' },
    chapter: { number: 1, title: 'Cost Models and Amortized Analysis', section: '1.1' },
    minutes: 6,
    verified: '2026-10-11',
    introduces: ['big-o-theta-omega', 'little-o-omega', 'best-worst-average-case', 'expected-vs-average', 'with-high-probability', 'time-space-tradeoff', 'pseudo-polynomial'],
    // Assumed, not taught first in this domain: listed in the Prerequisites panel (sorts and hash sets get their own topics later).
    uses: ['logarithms', 'limits', 'expectation', 'standard-sorts', 'hash-set'],
    declared: ['programming', 'logarithms', 'limits', 'expectation', 'standard-sorts', 'hash-set'],
    bridge: 'Data Structures & Algorithms starts with the language its costs are written in: what a bound claims, which case it is about, and what it leaves out.',
    handoff: 'Next: the word-RAM model, the machine these step counts quietly assume, and what it hides.',
  },
  {
    id: 'dsa.recurrences-master-theorem-akra',
    domain: 'data-structures-and-algorithms',
    slug: 'data-structures-and-algorithms/m1-data-structures/ch01-cost-models-amortized/recurrences-master-theorem-akra',
    title: 'Recurrences: Master theorem and Akra–Bazzi',
    syllabusTitle: 'Recurrences: Master theorem and Akra–Bazzi',
    kind: 'full',
    status: 'held', // topic 2 (the word-RAM model) is built in parallel and is not live yet
    milestone: { number: 1, title: 'Data Structures' },
    chapter: { number: 1, title: 'Cost Models and Amortized Analysis', section: '1.1' },
    minutes: 12,
    verified: '2026-10-11',
    introduces: ['recurrence-relations', 'recursion-tree', 'master-theorem', 'akra-bazzi', 'substitution-method'],
    // word-ram and van-emde-boas-tree are introduced by topic 2 (planned in CHAPTER.md; these two ids are a contract between topics 2 and 3); the rest are assumed and listed in the Prerequisites panel.
    uses: ['big-o-theta-omega', 'word-ram', 'van-emde-boas-tree', 'logarithms', 'standard-sorts', 'binary-search', 'induction', 'geometric-series', 'integration'],
    declared: ['logarithms', 'standard-sorts', 'binary-search', 'induction', 'geometric-series', 'integration'],
    bridge: 'The word-RAM lets you count steps, and a recursive algorithm hands you that count as a recurrence. Here is how to read the answer off it.',
    handoff: 'A recurrence bounds what one algorithm costs. Next: how to prove that no algorithm can do better.',
  },
];
