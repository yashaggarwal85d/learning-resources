import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running examples: Spark 3.5.9 in local[4] mode (Python 3.11 venv; see SOURCES.md) for the three
// AQE measurements, and PostgreSQL 16.15's own `pw_orders` table (topic 25) for execution-time
// partition pruning. Every number below is in examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'A plan that changes its own shape while it runs',
      body: (
        <>
          Same query, same tables. Its own <code>explain()</code> shows an <code>Initial Plan</code> joining both sides with a{' '}
          <code>SortMergeJoin</code> — and a <code>Final Plan</code>, for that same run, joining them with a <code>BroadcastHashJoin</code> instead.
        </>
      ),
      duration: 4.8,
      fig: 'Initial Plan: SortMergeJoin → Final Plan: BroadcastHashJoin',
      Visual: S.Hook,
    },
    {
      title: 'Predict: why would a plan decided once need deciding again?',
      body: (
        <>
          The planner already chose a join strategy before the query ran at all. Why would that choice ever need to change once the query is already
          executing?
        </>
      ),
      duration: 2,
      fig: 'one query, two plans',
      predict: {
        options: [
          { label: 'The planner made a mistake the first time' },
          { label: 'Something about the data wasn’t knowable until part of the plan had already run', correct: true },
          { label: 'Spark always re-plans every query twice, as a safety check' },
        ],
        explain: (
          <>
            Something about the data wasn't knowable until part of the plan had already run — not a mistake, and not a blanket re-check: a targeted
            revision, once real numbers exist to revise it with.
          </>
        ),
      },
      Visual: S.PredictWhyReplan,
    },
    {
      title: 'Reveal: re-optimization happens at stage boundaries',
      body: (
        <>
          A distributed plan is built from stages, split at shuffle boundaries. Once a stage finishes, its real output size is known — and everything
          still ahead of it, not yet run, can be redecided using that real number instead of the planner's original guess.
        </>
      ),
      duration: 4.8,
      fig: 'a stage finishes; real stats become known',
      Visual: S.RevealStageBoundaries,
    },
    {
      title: 'Reveal: coalescing shuffle partitions',
      body: (
        <>
          200 shuffle partitions configured, every one of them kept, whatever the real data turns out to be. Turn on partition coalescing, and the
          same query's real post-shuffle data — 50 tiny groups — collapses that down to 1.
        </>
      ),
      duration: 4.4,
      fig: '200 configured partitions → 1 real one',
      Visual: S.RevealCoalescing,
    },
    {
      title: 'How a skewed partition gets found and split',
      body: (
        <>
          One join key can dominate a single hash partition while the rest sit nearly empty. A partition counts as skewed once it's both far bigger
          than the median partition and bigger than an absolute size limit — and once it does, Spark splits it into several smaller, more even pieces.
        </>
      ),
      duration: 4.8,
      fig: 'one tall bar, two gates it has to clear',
      Visual: S.HowSkewDetected,
    },
    {
      title: 'Predict: does splitting a skewed partition always run faster?',
      body: (
        <>
          Splitting a skewed partition's own single, oversized task into several smaller ones sounds like it should always finish sooner. Does it?
        </>
      ),
      duration: 2,
      fig: 'one big task vs. several small ones',
      predict: {
        options: [
          { label: 'Yes — splitting always helps' },
          { label: 'Only if there’s spare capacity to run the split pieces on', correct: true },
          { label: 'No — splitting never changes wall-clock time' },
        ],
        explain: (
          <>
            Only if there's spare capacity to run the split pieces on — the total work is exactly the same either way; splitting just changes how it's
            divided, not how much of it there is.
          </>
        ),
      },
      Visual: S.PredictSkewSpeedup,
    },
    {
      title: 'Reveal: splitting needs spare capacity to pay off',
      body: (
        <>
          On this sandbox's 4 cores, with no idle capacity to give the split pieces, the measured times didn't move cleanly either way across repeated
          runs. The mechanism is real and plan-visible — the win only shows up with workers free to pick up what got split off.
        </>
      ),
      duration: 4.8,
      fig: 'same 4 cores, no clean before/after',
      takeaway: 'Splitting a skewed partition is a real plan change, but its payoff depends on spare capacity.',
      Visual: S.RevealNoCleanWin,
    },
    {
      title: 'Predict: a join’s small side turns out small only after another stage finishes — then what?',
      body: (
        <>
          A dimension table's real size, after its own filter and aggregation, is only known once that stage has actually finished running. The join
          below it was already planned before that. What happens to that join's plan?
        </>
      ),
      duration: 2.4,
      fig: 'a join planned before its input’s real size was known',
      predict: {
        options: [
          { label: 'It stays whatever was decided at compile time' },
          { label: 'It can still change, once that stage’s real output size is known', correct: true },
          { label: 'The query fails — a plan can’t change after compiling' },
        ],
        explain: (
          <>
            It can still change — the exact mechanism behind the very first frame of this topic: a join plan decided once, and decided again once a
            real number exists to decide it with.
          </>
        ),
      },
      Visual: S.PredictSwitchStrategy,
    },
    {
      title: 'Reveal: AQE switches join strategy at runtime',
      body: (
        <>
          That dimension table's real size after its own aggregation: 10 rows, comfortably under the broadcast threshold. The <code>Initial Plan</code>{' '}
          joined both sides with a <code>SortMergeJoin</code>; the <code>Final Plan</code>, once that real size was known, switched to a{' '}
          <code>BroadcastHashJoin</code> instead.
        </>
      ),
      duration: 4.8,
      fig: '10-row dimension side, known only after its own stage',
      takeaway: 'A compile-time join strategy is still a draft — AQE can replace it once the real size is known.',
      Visual: S.RevealSwitchedPlan,
    },
    {
      title: 'Reveal: a runtime filter built from the small side',
      body: (
        <>
          Build a compact summary of one side's actual key values — a Bloom filter, say yes-or-maybe to membership — and hand it to the larger side's
          scan before that scan has even finished reading. Rows that the filter proves can't match never make it into the join at all.
        </>
      ),
      duration: 4.8,
      fig: 'a small side’s keys, folded into one filter, handed to the big scan',
      Visual: S.RevealRuntimeFilter,
    },
    {
      title: 'Reveal: dynamic partition pruning',
      body: (
        <>
          The same idea at the partition level: Trino collects the real join-key values on one side and passes them sideways into the other side's
          own table scan — not down a fixed plan tree, but across it — skipping whole partitions it can prove will never match.
        </>
      ),
      duration: 4.8,
      fig: 'real values, passed sideways into the other side’s scan',
      Visual: S.RevealDynamicPruning,
    },
    {
      title: 'How PostgreSQL prunes partitions at execution time',
      body: (
        <>
          A parameterized query, run against a planner that can't yet see the actual value: with pruning on, <code>EXPLAIN</code> reports{' '}
          <code>Subplans Removed: 3</code>, one partition scanned, ~3.2× faster and a quarter of the buffer reads. Turn pruning off, and all 4
          partitions get scanned regardless.
        </>
      ),
      duration: 4.8,
      fig: 'Subplans Removed: 3, one partition instead of four',
      takeaway: 'Not knowing which partitions matter yet is a problem on a single machine too, not only across a cluster.',
      Visual: S.RevealPgPruning,
    },
    {
      title: 'Recap',
      body: (
        <>
          A stage finishing hands the rest of the plan real numbers to replan with. That's what lets AQE coalesce empty shuffle partitions, split a
          skewed one when there's room to, and swap a join strategy mid-query. A runtime filter does the same trick at the row level; dynamic partition
          pruning does it at the partition level — both are one side passing its own real values sideways into the other.
        </>
      ),
      duration: 4.8,
      fig: 'one idea, four places it shows up',
      Visual: S.Recap,
    },
    {
      title: 'Prove it · 1 of 2',
      body: (
        <>
          A query's <code>explain()</code> shows <code>Initial Plan: SortMergeJoin</code> and <code>Final Plan: BroadcastHashJoin</code>. Which AQE
          feature did this?
        </>
      ),
      duration: 2.4,
      fig: 'Initial Plan vs. Final Plan',
      predict: {
        options: [
          { label: 'Coalescing shuffle partitions' },
          { label: 'Switching join strategy at runtime', correct: true },
          { label: 'Splitting a skewed partition' },
        ],
        explain: (
          <>
            Switching join strategy at runtime — a changed join operator between the initial and final plan is specifically this feature's signature,
            not coalescing (which changes partition counts) or skew-splitting (which changes a partition's own task count).
          </>
        ),
      },
      Visual: S.ProveSwitchOrNot,
    },
    {
      title: 'Prove it · 2 of 2',
      body: (
        <>
          An <code>EXPLAIN</code> plan reports <code>Subplans Removed: 3</code> out of 4 partitions. Did this pruning happen at planning time, or at
          execution time?
        </>
      ),
      duration: 2.4,
      fig: 'Subplans Removed: 3 of 4',
      predict: {
        options: [
          { label: 'Planning time' },
          { label: 'Execution time', correct: true },
        ],
        explain: (
          <>
            Execution time — a plan-time pruning decision never shows up as "Subplans Removed" at all, since the pruned partitions are never added to
            the plan in the first place; this property only appears when pruning happens after the plan is already built.
          </>
        ),
      },
      Visual: S.ProveSubplansRemoved,
    },
  ],
};

export default reel;
