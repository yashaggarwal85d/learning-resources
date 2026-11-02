import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Plan-text facts measured against a real local Apache Spark 4.0.1 (PySpark, local[4]) session
// (examples.py): a small table joined to a large one under the default broadcast threshold
// produces a BroadcastExchange and a BroadcastHashJoin with no shuffle Exchange anywhere; the
// identical join with the threshold forced to -1 falls back completely to a SortMergeJoin with
// exactly 2 shuffle Exchanges; the identical small table joined on a non-equi condition still
// broadcasts (a BroadcastExchange, no shuffle) but as a BroadcastNestedLoopJoin, never a
// BroadcastHashJoin. The join-hint mechanism and the driver-memory risk behind stale statistics
// are sourced and quoted from Spark's own docs and source.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Bucketing avoided a shuffle by agreement at write time. This topic is a completely
          different trick: joining a small table to a huge one, where Spark can choose to copy
          the small table everywhere instead of shuffling either side.
        </>
      ),
      duration: 4.5,
      fig: 'a small table, a huge one, a join. Copy the small one everywhere, or shuffle both?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: under the default threshold, a BroadcastExchange and BroadcastHashJoin, zero shuffle Exchanges at all',
      body: (
        <>
          Measured: under the default threshold, the small table is copied whole to every
          executor. The large table's own plan carries no shuffle at all — there's nothing left
          for it to redistribute.
        </>
      ),
      duration: 4.8,
      fig: 'small side broadcast, zero shuffle Exchanges anywhere in the plan.',
      takeaway: 'Broadcasting removes the shuffle by making one side small enough to copy to every executor, not by splitting work evenly.',
      Visual: S.RevealUnderThreshold,
    },
    {
      title: 'Predict: the same query, but the small table grows past the threshold',
      body: (
        <>
          Same join, same small table's own key, but now it's grown just past the broadcast
          threshold. Does Spark still copy it everywhere, or does something change here?
        </>
      ),
      duration: 2.8,
      fig: 'small table grows past the threshold. Still copied everywhere, or not?',
      predict: {
        options: [
          { label: 'Still broadcast — the threshold is a soft guideline, close calls still get copied' },
          { label: 'Not broadcast — crossing it falls back completely to a real shuffle join', correct: true },
        ],
        explain: (
          <>
            The threshold is a hard cutoff, not a preference. Once the estimated size crosses it,
            Spark stops considering a broadcast for that side at all.
          </>
        ),
      },
      Visual: S.PredictOverThreshold,
    },
    {
      title: 'Reveal: no broadcast at all now, a real SortMergeJoin with two shuffle Exchanges',
      body: (
        <>
          Measured: there's no broadcast anywhere in this plan now. Both sides pay for a real
          shuffle, and the join itself falls all the way back to a sort-merge join.
        </>
      ),
      duration: 4.8,
      fig: 'over the threshold: no broadcast, a sort-merge join, 2 real shuffle Exchanges.',
      takeaway: 'The broadcast threshold is a hard line: cross it and Spark falls back completely to a shuffle join.',
      Visual: S.RevealFullFallback,
    },
    {
      title: 'Predict: the join condition is non-equi, but the small side is still small enough to broadcast',
      body: (
        <>
          Back under the threshold, but the join condition is no longer an equality — it's a
          plain comparison instead. Does Spark broadcast the small side the same way, using the
          same hash-based mechanism?
        </>
      ),
      duration: 2.8,
      fig: 'small side, non-equi condition. Same hash-join mechanism underneath, or not?',
      predict: {
        options: [
          { label: "Same mechanism — Spark hashes the comparison's bucket boundaries instead" },
          { label: "A different mechanism — there's no equality to hash on, so matching changes entirely", correct: true },
        ],
        explain: (
          <>
            A hash join needs an equality to hash. Without one, Spark can't build a lookup table
            at all — it has to compare rows a different way once it's broadcast.
          </>
        ),
      },
      Visual: S.PredictNonEqui,
    },
    {
      title: "Reveal: a BroadcastNestedLoopJoin instead; still no shuffle, but matching rows pairwise rather than by a hash",
      body: (
        <>
          Measured: the small side still broadcasts, so there's still no shuffle anywhere. But the
          join itself is a nested-loop join now — every large-side row compared against the small
          side directly, not looked up by a hash.
        </>
      ),
      duration: 4.8,
      fig: 'non-equi: still broadcasts, zero shuffle, but a nested-loop join, not a hash join.',
      takeaway: 'Broadcasting without an equality condition still removes the shuffle, but trades a hash lookup for comparing every row pairwise instead.',
      Visual: S.RevealNestedLoop,
    },
    {
      title: 'Recap',
      body: (
        <>
          Under the threshold, the small side broadcasts and neither side shuffles. Cross it, and
          the fallback is total — a real shuffle join on both sides. And a non-equi condition still
          broadcasts, but changes the matching itself from a hash lookup to a full comparison.
        </>
      ),
      duration: 4.8,
      fig: 'under threshold, over threshold, and non-equi — three outcomes from one decision.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
