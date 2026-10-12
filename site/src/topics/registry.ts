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
    id: 'de.asymptotic-notation-logarithms',
    domain: 'data-engineering',
    slug: 'data-engineering/m1-foundations/ch01-cs-foundations/asymptotic-notation-logarithms',
    title: 'Asymptotic notation and logarithms',
    syllabusTitle: 'Asymptotic notation and logarithms',
    kind: 'refresher',
    // Built ahead of its turn: it waits until every topic before it is live.
    status: 'held',
    milestone: { number: 1, title: 'Foundations' },
    chapter: { number: 1, title: 'Computer-science foundations', section: '1.1' },
    minutes: 5,
    verified: '2026-10-12',
    introduces: ['big-o', 'logarithms', 'change-of-base'],
    uses: ['git-bisect'],
    declared: ['high-school-algebra'],
    bridge: "Tests check that a change gives the right answer; they don't say how its cost grows with the data. That takes O, Θ and Ω, and logarithms in any base.",
    handoff: 'Big-O counts steps as if each cost the same. Next: the memory hierarchy, where the same step costs anything from a nanosecond to tens of milliseconds.',
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
    id: 'de.software-delivery-workflow',
    domain: 'data-engineering',
    slug: 'data-engineering/m1-foundations/ch01-cs-foundations/software-delivery-workflow',
    title: 'Software delivery workflow',
    syllabusTitle: 'Software delivery workflow',
    kind: 'refresher',
    // Built in parallel with the topics before it (Git, shell): it waits until every topic before it is live.
    status: 'held',
    milestone: { number: 1, title: 'Foundations' },
    chapter: { number: 1, title: 'Computer-science foundations', section: '1.1' },
    minutes: 5,
    verified: '2026-10-12',
    introduces: ['code-review-norms', 'unit-tests', 'ci-pipelines', 'semantic-versioning', 'dependency-pinning'],
    uses: ['python-functions', 'decorators', 'type-hints', 'exit-status', 'pr-merge-strategies', 'trunk-based-development', 'git-bisect', 'pipes-redirection', 'text-tools', 'signals', 'pip-install', 'github-actions-basics'],
    // Assumed by the Prerequisites panel (sections 04 and 05): installing with pip and reading a workflow file.
    declared: ['pip-install', 'github-actions-basics'],
    bridge: 'The shell runs one job by hand; a CI pipeline runs the same commands on every change and stops at the first non-zero exit.',
    handoff: 'Last of the five refreshers: the notation for how costs grow, and the logarithms the rest of the chapter counts with.',
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
    id: 'rust.single-ownership-move-semantics',
    domain: 'rust-systems-engineering',
    slug: 'rust-systems-engineering/m1-ownership-types-concurrency/ch01-ownership-moves/single-ownership-move-semantics',
    title: 'Single ownership and move semantics',
    syllabusTitle: 'Single ownership and move semantics',
    kind: 'full',
    // First topic of its domain: nothing comes before it, so it can be live.
    status: 'live',
    milestone: { number: 1, title: 'Ownership, Types, and Concurrency Primitives' },
    chapter: { number: 1, title: 'Ownership and Moves', section: '1.1' },
    minutes: 18,
    verified: '2026-10-11',
    introduces: ['ownership', 'move-semantics', 'deinitialized-place', 'copy-trait', 'clone-cost', 'move-cost', 'box-ownership', 'ownership-signatures', 'e0382', 'e0505'],
    uses: [],
    declared: ['programming', 'rust-book-basics', 'stack-and-heap', 'references-and-borrowing', 'slices', 'structs-traits-generics', 'closures'],
    bridge: "Rust Systems Engineering starts here. You've read the Book through chapter 10; now ownership becomes a design tool, starting with its smallest unit: one value, one owner, one destruction.",
    handoff: 'One owner decides who destroys a value. Next: exactly when that happens: drop order, temporaries, and why leaking memory is still safe.',
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
    id: 'dsa.word-ram-model-assumptions',
    domain: 'data-structures-and-algorithms',
    slug: 'data-structures-and-algorithms/m1-data-structures/ch01-cost-models-amortized/word-ram-model-assumptions',
    title: 'The word-RAM model and its assumptions',
    syllabusTitle: 'The word-RAM model and its assumptions',
    kind: 'full',
    status: 'live',
    milestone: { number: 1, title: 'Data Structures' },
    chapter: { number: 1, title: 'Cost Models and Amortized Analysis', section: '1.1' },
    minutes: 12,
    verified: '2026-10-11',
    introduces: ['word-ram', 'word-size-assumption', 'comparison-model', 'cache-miss', 'branch-misprediction', 'word-level-parallelism', 'integer-sorting', 'van-emde-boas-tree', 'fusion-tree'],
    uses: ['big-o-theta-omega', 'pseudo-polynomial', 'time-space-tradeoff', 'with-high-probability', 'expected-vs-average', 'logarithms', 'standard-sorts', 'binary-numbers', 'binary-search'],
    // The first five come from the topic before it (Asymptotic notation and case analysis); the last four are assumed, and listed in the Prerequisites panel.
    declared: ['logarithms', 'standard-sorts', 'binary-numbers', 'binary-search'],
    bridge: 'Every count in the last reel assumed each step costs the same. Here is the machine that makes that true, one word at a time, and the costs it leaves out.',
    handoff: 'Counting a loop on this machine is easy. A recursive algorithm hands you its count as a recurrence; next, how to solve one.',
  },
  {
    id: 'dsa.recurrences-master-theorem-akra',
    domain: 'data-structures-and-algorithms',
    slug: 'data-structures-and-algorithms/m1-data-structures/ch01-cost-models-amortized/recurrences-master-theorem-akra',
    title: 'Recurrences: Master theorem and Akra–Bazzi',
    syllabusTitle: 'Recurrences: Master theorem and Akra–Bazzi',
    kind: 'full',
    status: 'live',
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
  {
    id: 'dsa.lower-bounds-adversary-arguments',
    domain: 'data-structures-and-algorithms',
    slug: 'data-structures-and-algorithms/m1-data-structures/ch01-cost-models-amortized/lower-bounds-adversary-arguments',
    title: 'Lower bounds and adversary arguments',
    syllabusTitle: 'Lower bounds and adversary arguments',
    kind: 'full',
    status: 'held', // topics 2 (the word-RAM model) and 3 (recurrences) are built in parallel and are not live yet
    milestone: { number: 1, title: 'Data Structures' },
    chapter: { number: 1, title: 'Cost Models and Amortized Analysis', section: '1.1' },
    minutes: 13,
    verified: '2026-10-12',
    introduces: ['decision-tree-model', 'sorting-lower-bound', 'information-theoretic-bound', 'adversary-argument', 'element-distinctness', 'min-max-comparisons', 'lower-bound-scope'],
    // comparison-model, word-ram, integer-sorting, van-emde-boas-tree and recurrence-relations are introduced by topics 2 and 3 (planned in CHAPTER.md; these ids are a contract between topics); the rest are assumed and listed in the Prerequisites panel.
    uses: ['comparison-model', 'word-ram', 'integer-sorting', 'van-emde-boas-tree', 'recurrence-relations', 'big-o-theta-omega', 'best-worst-average-case', 'expected-vs-average', 'logarithms', 'standard-sorts', 'binary-search', 'hash-set'],
    declared: ['logarithms', 'standard-sorts', 'binary-search', 'hash-set'],
    bridge: 'You can now bound what an algorithm costs. A lower bound says what every algorithm in a model must pay, and an adversary is how you prove it.',
    handoff: 'Every bound so far priced one run on its worst input. A data structure lives through a sequence of operations, where one expensive step can be paid for by many cheap ones, with no probability involved. Next: amortized analysis.',

  },
];
