import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Plan-text facts measured against a real local Apache Spark 4.0.1 (PySpark, local[4]) session
// (examples.py): two large tables, equi-joined with no hint, plan as a SortMergeJoin with
// exactly 2 Sort nodes (one per side); the identical join with a SHUFFLE_HASH hint on one side
// plans as a ShuffledHashJoin with zero Sort nodes anywhere. The planner's own OOM risk for a
// big hash-join build side, and its own hint-priority and preferSortMergeJoin rules, are sourced
// and quoted directly from Spark's own source comments; no build side is deliberately driven
// toward OOM here.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Broadcasting handled the case where one side fits everywhere. Neither side fits here:
          two large tables, joined on equality, with no hint at all. Which of two valid
          strategies does Spark pick on its own?
        </>
      ),
      duration: 4.5,
      fig: 'two large tables, equi-joined, no hint. Which strategy does Spark pick?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: sort-merge join, a real Sort step on each side before the merge',
      body: (
        <>
          Measured: Spark's own default is a sort-merge join. Each side gets a real sort step of
          its own, sitting right above the shuffle, before the two sorted streams are merged.
        </>
      ),
      duration: 4.8,
      fig: 'unhinted default: sort-merge join, a Sort node on each side, confirmed.',
      takeaway: "Sort-merge is the planner's own default strategy for two large, equi-joined tables.",
      Visual: S.RevealSortMerge,
    },
    {
      title: 'Predict: a hint tells Spark to use the other strategy on one side',
      body: (
        <>
          Same two tables, same join key, but now a hint tells Spark to use the other strategy
          instead. Does the hashing approach still sort both sides first, the way the merge did?
        </>
      ),
      duration: 2.8,
      fig: "a hint for the hash strategy. Still sorts both sides first, or not?",
      predict: {
        options: [
          { label: 'Still sorts first — a hash join still needs the keys lined up to compare them' },
          { label: "Doesn't sort at all — hashing finds a match without any sort step on either side", correct: true },
        ],
        explain: (
          <>
            A hash table doesn't need its input in order to look something up. Building one skips
            the sort entirely, on both sides, not just the hinted one.
          </>
        ),
      },
      Visual: S.PredictHashHint,
    },
    {
      title: 'Reveal: a shuffled hash join, with zero Sort steps anywhere in the plan',
      body: (
        <>
          Measured: the hint switches the strategy completely. The resulting plan has no sort
          step anywhere at all — not on the hinted side, and not on the other one either.
        </>
      ),
      duration: 4.8,
      fig: 'hinted strategy: shuffled hash join, zero Sort nodes anywhere, confirmed.',
      takeaway: 'A hash-based strategy drops the sort entirely on both sides, not only the one that was hinted.',
      Visual: S.RevealShuffledHash,
    },
    {
      title: 'Predict: the build side of that hash join is made artificially huge',
      body: (
        <>
          Now imagine that hash join's own build side grows far larger than expected. Does it
          handle that the same graceful way the sort-based strategy would, just more slowly?
        </>
      ),
      duration: 2.8,
      fig: "hash join's build side made huge. Same graceful slowdown as sort-merge, or not?",
      predict: {
        options: [
          { label: 'Same graceful slowdown — both strategies shuffle the same data, so both degrade the same way' },
          { label: "Not the same — the hash table has to fit in memory at once, with no fallback if it doesn't", correct: true },
        ],
        explain: (
          <>
            A sort can always spill its sorted runs to disk and keep going, slower but correct. A
            hash table being built in memory has no equivalent fallback once it's too big to fit.
          </>
        ),
      },
      Visual: S.PredictSkewedBuildSide,
    },
    {
      title: "Reveal: the planner's own comment names the real risk directly; sort-merge has no equivalent",
      body: (
        <>
          Sourced directly from Spark's own planner comments: building that hash table is named,
          in so many words, as memory-intensive enough to run out of memory when the build side
          is big. Sort-merge's own external sort has no single point of failure like that.
        </>
      ),
      duration: 4.8,
      fig: "hash join: a named memory risk. Sort-merge: spills to disk instead, no equivalent risk.",
      takeaway: 'The two strategies fail differently under memory pressure, not just at different size thresholds.',
      Visual: S.RevealOomRisk,
    },
    {
      title: 'Recap',
      body: (
        <>
          Sort-merge is the planner's own default for two large tables, sorting both sides before
          merging. A hint can switch to a hash-based strategy, dropping every sort on both sides —
          at the real cost of a hash table that has to fit in memory all at once.
        </>
      ),
      duration: 4.8,
      fig: 'the default, the hinted switch, and the memory cost that switch actually carries.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
