import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every partition-count and plan-text fact here is measured directly against a real local
// Apache Spark 4.0.1 (PySpark, local[4]) session (examples.py): spark.sql.shuffle.partitions
// sets a group-by's output partition count one-to-one (4, then 17); repartition(3) carries a
// real Exchange in its own plan and produces exactly 3 partitions; coalesce(3) reaches the same
// 3 with no Exchange at all, and coalesce(20) from an 8-partition base stays at 8, since
// coalesce only merges, never splits; coalesce(1) on an 8-partition, 2-million-row dataset
// collapses every upstream partition into the single final one, confirmed by counting rows per
// partition directly. Input-split sizing (maxPartitionBytes, openCostInBytes) is sourced and
// quoted from Spark's own docs and source.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shuffle is the biggest single cost in this machinery. Its own biggest lever is
          simple to state and easy to get wrong: how many pieces does the work actually get cut into?
        </>
      ),
      duration: 4.5,
      fig: 'the same shuffle. How many pieces does it actually get cut into?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: one config sets the count directly',
      body: (
        <>
          Measured: the identical group-by, run twice, produces exactly as many output partitions
          as a single config says. Not estimated, not derived from the data — set directly.
        </>
      ),
      duration: 4.8,
      fig: 'shuffle partitions at 4: 4 partitions out. At 17: 17 out.',
      Visual: S.RevealShuffleConfig,
    },
    {
      title: 'Predict: does repartition shuffle?',
      body: (
        <>
          Asking for a specific, even partition count sounds like it could be free. Does actually
          getting there require redistributing every row across the cluster, or not?
        </>
      ),
      duration: 2.8,
      fig: 'repartition to fewer, even pieces. A real shuffle, or not?',
      predict: {
        options: [
          { label: "No — it's just a relabeling of how many pieces exist, nothing moves" },
          { label: 'Yes — every row gets redistributed so the pieces come out genuinely even', correct: true },
        ],
        explain: (
          <>
            Even sizes are the whole point of repartition, and the only way to guarantee that is
            to redistribute every row by hand, which is exactly what a real shuffle does.
          </>
        ),
      },
      Visual: S.PredictRepartitionShuffle,
    },
    {
      title: 'Reveal: a real shuffle, confirmed in the plan',
      body: (
        <>
          Measured: repartition's own plan carries a genuine Exchange node. Every row moves so the
          three resulting partitions actually come out close to even, not just close to three.
        </>
      ),
      duration: 4.8,
      fig: "repartition's own plan: a real Exchange. Three even partitions out.",
      takeaway: 'Repartition guarantees even partition sizes by paying for a real shuffle every single time.',
      Visual: S.RevealRepartitionShuffles,
    },
    {
      title: 'Predict: does coalesce shuffle the same way?',
      body: (
        <>
          Coalesce asks for that exact same lower count. Does reaching it cost the same real
          shuffle repartition just paid for, or is there a cheaper way to get fewer pieces?
        </>
      ),
      duration: 2.8,
      fig: 'coalesce to the same lower count. Same shuffle cost, or cheaper?',
      predict: {
        options: [
          { label: "Yes — fewer pieces is fewer pieces, it has to shuffle the same way" },
          { label: 'No — it merges existing pieces together directly, with no shuffle at all', correct: true },
        ],
        explain: (
          <>
            Coalesce only ever shrinks, never evens out, so it doesn't need every row
            redistributed — it just glues neighbouring pieces together where they already sit.
          </>
        ),
      },
      Visual: S.PredictCoalesceShuffle,
    },
    {
      title: 'Reveal: no shuffle, and no growing either',
      body: (
        <>
          Measured: coalesce reaches the same count with zero Exchange nodes, a narrow merge
          only. And asking it to grow past the starting count does nothing — it can only shrink.
        </>
      ),
      duration: 4.8,
      fig: 'coalesce(3): no Exchange. coalesce(20) from 8: stays at 8.',
      takeaway: "Coalesce merges partitions for free, with no shuffle, but it can only shrink the count, never grow it.",
      Visual: S.RevealCoalesceNoShuffle,
    },
    {
      title: 'Predict: the coalesce(1) trap',
      body: (
        <>
          Coalesce all the way down to one single final piece. Does that only shrink the final
          output, or does it reach back and touch something upstream of it as well?
        </>
      ),
      duration: 2.8,
      fig: 'coalesce down to one piece. Just the output, or more than that?',
      predict: {
        options: [
          { label: "Just the output — the earlier upstream work still runs in parallel as before" },
          { label: 'More than that — the whole upstream read collapses into that one single task too', correct: true },
        ],
        explain: (
          <>
            A narrow merge doesn't add a new stage boundary. It folds directly into whatever ran
            before it, so an upstream read that fed it loses its own parallelism right along with it.
          </>
        ),
      },
      Visual: S.PredictCoalesceOneTrap,
    },
    {
      title: 'Reveal: the whole upstream read collapses too',
      body: (
        <>
          Measured: an eight-partition read, coalesced to one, ends up with every single row of a
          two-million-row dataset counted inside that one partition — the read itself ran as one task.
        </>
      ),
      duration: 4.8,
      fig: 'eight partitions in, coalesced to one. All two million rows: one partition.',
      takeaway: 'Coalesce(1) does not just shrink the final output; it collapses the whole upstream stage into a single task.',
      Visual: S.RevealCoalesceOneCollapse,
    },
    {
      title: 'Recap',
      body: (
        <>
          A shuffle's partition count is a direct config, not a derived number. Repartition pays
          for a real shuffle to guarantee even sizes. Coalesce merges for free but only shrinks —
          and coalescing all the way to one quietly collapses everything that fed into it.
        </>
      ),
      duration: 4.8,
      fig: 'config sets the count. repartition shuffles. coalesce merges — carefully.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
