import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against a real local Apache Spark 4.0.1 (PySpark, local[4]) session (examples.py):
// one key (20,000,000 rows) among 999 other keys (10,000,000 rows total), joined to a small
// dimension table, shuffle.partitions=8. Baseline: max/median task duration ~4x, max/median
// shuffle-read bytes 12.2x. AQE's skew-join handling with default thresholds leaves the bytes
// ratio unchanged (the default 256MB threshold exceeds the ~155MB skewed partition); retuned to
// the data's own scale, it drops to 1.1x. Broadcasting the dimension table removes the shuffle
// entirely. Salting (8 buckets, dimension replicated 8x) drops the bytes ratio to 3.2x and the
// duration ratio to ~2.6x, but increases total shuffled bytes versus the baseline. A combinable
// `sum` aggregation over the same skewed key is not skewed at the shuffle at all (hot-partition
// shuffle-write: 59 bytes; a diverse-key partition: 12,750 bytes) because map-side partial
// aggregation already collapsed the hot key before any shuffle ran. A non-combinable
// `collect_list` aggregation over the same key has one reduce task running well over 10x the
// median duration, which a two-phase (salt, partially aggregate, re-aggregate) remedy drops to
// roughly 2.3x. Isolating hot keys and the preserved-side-of-an-outer-join/window-function cases
// are sourced only, per `OptimizeSkewedJoin.scala`'s own join-operator-only pattern match.
const reel: Reel = {
  steps: [
    {
      title: "Hook: one key, twice the rows of the rest combined",
      body: (
        <>
          One key in a thousand holds twenty million rows. The other nine hundred ninety-nine
          share ten million between them. One task in the join is about to get that one key.
        </>
      ),
      duration: 4.5,
      fig: "one key holds twice the rows of the other 999 combined. What happens to the task that gets it?",
      Visual: S.Hook,
    },
    {
      title: "Reveal: a 12.2x bytes gap, one straggler task",
      body: (
        <>
          Measured, without ever looking at the raw data: one task's shuffle-read bytes run
          12.2 times the median task in the same stage, and its duration runs about four times
          the median. Same stage, same join, one task doing disproportionate work.
        </>
      ),
      duration: 4.8,
      fig: "max/median shuffle-read bytes: 12.2x. max/median task duration: ~4x. One straggler.",
      Visual: S.RevealBaseline,
    },
    {
      title: "Predict: does AQE's default skew-join handling fix this?",
      body: (
        <>
          Spark already reoptimizes a plan once real shuffle statistics exist, and splitting a
          skewed partition is one of the things it knows how to do. Turn that handling on, with
          its own defaults. Does the gap close?
        </>
      ),
      duration: 2.8,
      fig: "AQE's skew-join handling, turned on with its defaults. Does the bytes ratio close?",
      predict: {
        options: [
          { label: 'Yes — skew-join splitting is on by default-adjacent config; it just works' },
          { label: "No — the default threshold for 'skewed' doesn't match this data's scale", correct: true },
        ],
        explain: (
          <>
            A partition only counts as skewed once it clears a configured byte threshold. That
            threshold has a default, and the default was not set with this data in mind.
          </>
        ),
      },
      Visual: S.PredictAqeDefault,
    },
    {
      title: "Reveal: no — the default threshold is bigger than the skew",
      body: (
        <>
          Measured: the bytes ratio doesn't move. The default skew threshold is 256 megabytes;
          this skewed partition is only around 155 megabytes. By that default's own math, nothing
          here counts as skewed at all.
        </>
      ),
      duration: 4.8,
      fig: "default skew threshold: 256 MB. This partition: ~155 MB. Never triggers.",
      Visual: S.RevealAqeDefaultFails,
    },
    {
      title: "Elaborate: retuned to the data's scale, AQE splits it",
      body: (
        <>
          Lower that threshold, and the advisory size AQE splits toward, down to the data's own
          scale, and the same rule finally sees a skewed partition. It splits it into smaller
          pieces that run in parallel instead of one. The bytes ratio collapses to roughly 1.1x.
        </>
      ),
      duration: 5,
      fig: "threshold retuned to the data's scale. Bytes ratio: 12.2x down to 1.1x.",
      takeaway: "AQE's skew-join split only fires once a partition clears a threshold sized to the data, not left at default.",
      Visual: S.ElaborateAqeTuned,
    },
    {
      title: "Predict: does broadcasting the small side fix it too?",
      body: (
        <>
          A much blunter tool, with no AQE configuration involved at all: broadcast the small
          dimension table to every task instead of shuffling the big one against it. Does that
          fix the skew too?
        </>
      ),
      duration: 2.8,
      fig: "broadcast the small side instead. Does the skew go away?",
      predict: {
        options: [
          { label: 'No — broadcasting only changes the small side; the big side still shuffles unevenly' },
          { label: "Yes — there's no shuffle left on the big side at all, so nothing can be skewed", correct: true },
        ],
        explain: (
          <>
            Skew is a property of a shuffle: some partitions get more of it than others. Remove
            the shuffle, and the question of which partition got more doesn't arise.
          </>
        ),
      },
      Visual: S.PredictBroadcast,
    },
    {
      title: "Reveal: yes — no shuffle left to skew",
      body: (
        <>
          Measured: the plan shows a broadcast hash join and nothing else — no sort-merge join,
          no shuffled hash join, no shuffle exchange on the big table's side at all.
        </>
      ),
      duration: 4.8,
      fig: "plan: broadcast hash join. No shuffle join of any kind, confirmed.",
      Visual: S.RevealBroadcastWorks,
    },
    {
      title: "Elaborate: isolate hot keys when the small side won't fit",
      body: (
        <>
          Broadcasting needs the whole small side to fit in memory everywhere. When it doesn't,
          the same idea still works for just the hot keys: filter out the handful of rows that
          match them, broadcast only those, and shuffle-join everything else normally.
        </>
      ),
      duration: 4.8,
      fig: "small side too big to broadcast whole? Broadcast only the hot keys' matching rows.",
      takeaway: "Broadcasting removes a shuffle outright; isolating hot keys gets the same effect without needing the whole small side to fit.",
      Visual: S.ElaborateIsolate,
    },
    {
      title: "Reveal: salting works, but it isn't free",
      body: (
        <>
          Measured: salting the key and replicating the small side across every salt bucket does
          shrink the gap — a bytes ratio of 3.2x, down from the baseline's 12.2x. But it's worse
          than AQE's own split on both axes, and the total bytes shuffled actually go up, not
          down, because the small side is now copied several times over.
        </>
      ),
      duration: 5,
      fig: "salting: bytes ratio 3.2x, worse than AQE's 1.1x. Total shuffled bytes increase.",
      Visual: S.RevealSaltingCost,
    },
    {
      title: "Reveal: a combinable aggregate was never skewed at all",
      body: (
        <>
          A turn: not every skew story is a join. Group the same skewed key by a plain sum, and
          measure what each task actually shuffles. The hot key's own task writes 59 bytes. A
          task with hundreds of diverse keys writes over twelve thousand. The hot key was never
          the expensive one.
        </>
      ),
      duration: 5,
      fig: "hot key's shuffle-write bytes: 59. A diverse-key partition's: 12,750. Inverted.",
      Visual: S.RevealCombinableNotSkewed,
    },
    {
      title: "Reveal: a non-combinable aggregate has nowhere to hide",
      body: (
        <>
          Measured: swap the sum for a function that can't combine partial results the same
          way — collecting every value into a list — and the hot key's whole twenty million
          rows land in one reduce task. That task runs well over ten times the median. And
          nothing about AQE's skew-join rule can reach it: sourced directly from Spark's own
          rule, it only ever rewrites a sort-merge or shuffled-hash join node. An aggregation was
          never a candidate.
        </>
      ),
      duration: 5.2,
      fig: "one reduce task, well over 10x the median. AQE's rule: join nodes only, sourced.",
      Visual: S.RevealNonCombinableSkewed,
    },
    {
      title: "Elaborate: two-phase aggregation spreads the hot key out",
      body: (
        <>
          The fix borrows salting's own trick for a different reason: not to avoid a big
          partition, but to avoid one task holding an entire key's data at all. Salt the key,
          aggregate partially per salted key, then re-aggregate by the real key alone. The same
          reduce stage's duration ratio drops to roughly 2.3x.
        </>
      ),
      duration: 5,
      fig: "salt, aggregate partially, re-aggregate. Duration ratio: well over 10x down to ~2.3x.",
      takeaway: "A non-combinable aggregate's skew isn't a join problem, so AQE's skew-join rule can't reach it — salt and re-aggregate instead.",
      Visual: S.ElaborateTwoPhase,
    },
    {
      title: "Recap: diagnose first, then reach for the ladder in order",
      body: (
        <>
          A max/median ratio on duration and shuffle bytes finds the straggler without ever
          looking at the data. For a join, reach for AQE's split first, then broadcasting, then
          isolating hot keys, then salting as the costly last resort. For an aggregation, none of
          that ladder's first rung applies at all — AQE's skew-join rule only ever rewrites a
          join, never an aggregation, the preserved side of an outer join, or a window function.
        </>
      ),
      duration: 5.2,
      fig: "evidence first, then the join ladder in order — and the cases that ladder never reaches.",
      takeaway: "Diagnose from the ratio alone; AQE's skew-join rule never touches an aggregation, an outer join, or a window.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
