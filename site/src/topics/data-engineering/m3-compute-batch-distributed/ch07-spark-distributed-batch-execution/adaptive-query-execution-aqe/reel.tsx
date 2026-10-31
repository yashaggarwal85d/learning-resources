import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Plan-text facts measured against a real local Apache Spark 4.0.1 (PySpark, local[4]) session
// (examples.py): a 5,000,000-row table joined to the result of grouping a 2,000,000-row table
// down to 30 rows. The Initial Plan (before any shuffle runs) is a SortMergeJoin with 2 Sort
// nodes; the Final Plan, once the grouping's own shuffle stage has materialized and revealed the
// true 30-row output size, is a BroadcastHashJoin with zero Sort nodes anywhere. A second,
// separate query (two 1,000,000-row tables, one filtered down to 20 rows, 200 configured shuffle
// partitions) shows `AQEShuffleRead coalesced` present only in its Final Plan, confirming AQE
// merges small post-shuffle partitions the static plan never touches. Both leaf scans are
// identical, byte for byte, between each query's own Initial and Final plan — the measured basis
// for "AQE cannot fix what happens before the first exchange." Skewed-partition splitting is
// sourced only, per CHAPTER.md's own handoff to the next topic's lab.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A big table joins the result of grouping another big table down to just thirty rows.
          Before any of it runs, what strategy does Spark commit to?
        </>
      ),
      duration: 4.5,
      fig: 'a join against a 30-row grouped result. Which strategy, before execution?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the Initial Plan sorts both sides',
      body: (
        <>
          Measured: before any shuffle has run, the planner has no way to know the grouped side
          will end up tiny. It commits to the same default as any other large equi-join: sort
          both sides, then merge.
        </>
      ),
      duration: 4.8,
      fig: 'Initial Plan: sort-merge join, 2 Sort nodes, confirmed.',
      Visual: S.RevealInitialPlan,
    },
    {
      title: "Predict: the grouping's own shuffle finishes, and reveals only 30 real rows",
      body: (
        <>
          That grouping has to shuffle to finish its own aggregation. Once it does, Spark knows
          the true row count on that side. Does the still-unmaterialized join above it get
          revisited?
        </>
      ),
      duration: 2.8,
      fig: 'the grouped side turns out to be 30 rows. Does the join plan change?',
      predict: {
        options: [
          { label: "No — the join's strategy was already decided before anything ran" },
          { label: 'Yes — Spark reoptimizes the join using the real size now that it exists', correct: true },
        ],
        explain: (
          <>
            A shuffle boundary is the one point where every partition's real size is known before
            the next operator runs. Spark re-plans right there, using numbers the static planner
            never had.
          </>
        ),
      },
      Visual: S.PredictDemotion,
    },
    {
      title: 'Reveal: the Final Plan is a broadcast hash join, with zero sort steps',
      body: (
        <>
          Measured: the Final Plan drops the sort-merge strategy entirely. The now-known-tiny
          grouped side is broadcast, and the other side's own shuffle is read locally instead of
          sorted and merged.
        </>
      ),
      duration: 4.8,
      fig: 'Final Plan: broadcast hash join, zero Sort nodes anywhere, confirmed.',
      Visual: S.RevealBroadcastDemotion,
    },
    {
      title: 'Why that conversion only became possible once the real size existed',
      body: (
        <>
          Nothing about the join itself changed. What changed is that a number existed which
          didn't before: the grouped side's true, tiny size. That number is what cleared the
          broadcast threshold the static plan had no way to check against.
        </>
      ),
      duration: 4.8,
      fig: "the grouped side's real size, known only after its own shuffle, clearing the broadcast threshold.",
      takeaway: 'AQE can convert a statically-planned sort-merge join into a broadcast join once a real post-shuffle size justifies it.',
      Visual: S.ElaborateDemotion,
    },
    {
      title: 'Predict: a second query sets 200 shuffle partitions, but the real data is tiny',
      body: (
        <>
          A different query configures 200 shuffle partitions up front, the way any query might.
          The actual data turns out to need far fewer. Does Spark still run all 200?
        </>
      ),
      duration: 2.8,
      fig: '200 partitions configured, data much smaller. Does AQE change that count?',
      predict: {
        options: [
          { label: 'Yes, all 200 run — the configured count is fixed once the query starts' },
          { label: "No — AQE merges the small partitions it actually produced into fewer", correct: true },
        ],
        explain: (
          <>
            The same reoptimization that can change a join's strategy can also merge
            contiguous shuffle partitions once their real, usually smaller, sizes are known.
          </>
        ),
      },
      Visual: S.PredictCoalescing,
    },
    {
      title: 'Reveal: the Final Plan coalesces the shuffle read; the Initial Plan never does',
      body: (
        <>
          Measured: the Initial Plan has no coalescing step of any kind — it commits to the
          configured count. Only the Final Plan shows the small partitions actually merged
          together before the next operator reads them.
        </>
      ),
      duration: 4.8,
      fig: 'Initial Plan: no coalescing. Final Plan: partitions coalesced, confirmed.',
      Visual: S.RevealCoalescing,
    },
    {
      title: 'Why the configured count was never the real answer',
      body: (
        <>
          Two hundred was just a default somebody set once, sized to nothing in particular. The
          count AQE actually used came from the shuffle's own real output, not from that
          configuration line at all.
        </>
      ),
      duration: 4.8,
      fig: "the configured count, sized to nothing; the coalesced count, sized to the real output.",
      takeaway: 'Partition coalescing is itself a reoptimization decision — it never appears until real post-shuffle sizes exist to coalesce by.',
      Visual: S.ElaborateCoalescing,
    },
    {
      title: 'Recap',
      body: (
        <>
          AQE reoptimizes right at a shuffle boundary, where real statistics finally exist: it can
          demote a sort-merge join to broadcast and coalesce small partitions. Nothing before that
          first boundary ever changes — AQE edits the plan, not the scan that already ran.
        </>
      ),
      duration: 4.8,
      fig: 'the static plan, the reoptimized plan, and the one boundary AQE can never reach past.',
      takeaway: "AQE's own reoptimization only ever happens at a shuffle or broadcast boundary, never anywhere else in the plan.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
