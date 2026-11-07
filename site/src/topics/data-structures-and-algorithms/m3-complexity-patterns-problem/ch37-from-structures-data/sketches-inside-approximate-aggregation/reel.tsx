import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This chapter's eighth and last topic: a sketch is useful inside a distributed aggregate
// exactly when it is mergeable, and the chapter's own partitioned stream carries every measured
// claim. Every number shown is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: "Eight partitions, one wrong average",
      body: (
        <>
          Eight partitions each report their own median order amount. Their plain average sits
          nowhere near the true median of the whole stream. One of those partitions is far
          smaller than the rest, and holds only unusually large orders. Predict: does the true
          median land near that average, or inside the range the other seven partitions already
          show?
        </>
      ),
      duration: 5.4,
      predict: {
        options: [
          { label: 'Near the plain average of all eight medians', correct: false },
          { label: 'Inside the range the seven ordinary partitions already show', correct: true },
        ],
        explain: (
          <>
            A median is not a linear function of its inputs. The small, skewed partition pulls
            the average of medians far off, while barely moving the true median at all, since it
            holds so few of the rows.
          </>
        ),
      },
      fig: 'eight partition medians, one average, one true value',
      Visual: S.Hook,
    },
    {
      title: 'What a mergeable aggregate already is',
      body: (
        <>
          A database already answers this for an exact aggregate: run the transition function
          over each subset separately, then combine the partial states into the same result a
          single pass would have given. The combine function for the largest or smallest value
          seen is the same comparison the aggregate already used; for a total, it is addition.
          An aggregate sensitive to the order its rows arrive in has no such combine function at
          all.
        </>
      ),
      duration: 5.6,
      fig: 'two subsets, two partial states, one combine function',
      Visual: S.PartialAggregation,
    },
    {
      title: 'The same contract, for a harder question',
      body: (
        <>
          A sketch is the same contract, for a question whose exact state is too large to keep:
          how many distinct customers, what is the median amount. Two partial sketches must
          combine into what a single pass over both would have produced, either exactly or
          within a stated error. That one property, a merge law, decides whether a summary is
          useful across a partitioned stream at all.
        </>
      ),
      duration: 4.8,
      fig: 'the merge law: two partial sketches, one combined answer',
      takeaway: 'A sketch is mergeable exactly when its state is small and its combine function is correct, not merely convenient.',
      Visual: S.MergeLaw,
    },
    {
      title: "A register that only ever grows",
      body: (
        <>
          HyperLogLog hashes every value into a small register array, one register per index,
          each holding the longest run of leading zero bits any hash landing there has produced.
          A warehouse's own count-distinct function returns exactly this estimate, built from
          that array, and the array itself can be stored as an ordinary value, merged later,
          turned into a number only at the end.
        </>
      ),
      duration: 5.4,
      fig: 'a register array, one longest run per index',
      Visual: S.HllRegisters,
    },
    {
      title: 'Summed, or merged?',
      body: (
        <>
          Two partitions, each with its own distinct-customer estimate. The same customer orders
          in both of them. Summing the two partitions' own estimates, or merging their register
          arrays first and estimating once — which one answers the real question?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Sum the two partitions’ own estimates', correct: false },
          { label: 'Merge the register arrays, then estimate once', correct: true },
        ],
        explain: (
          <>
            Summing counts a repeat customer twice. Merging by element-wise maximum first asks
            the one question that actually matters: across both partitions together, what is
            the longest run any hash has produced at each index.
          </>
        ),
      },
      fig: 'one customer, counted twice by the wrong shortcut',
      Visual: S.SumVsMerge,
    },
    {
      title: 'Measured: exact at the register, wrong by the shortcut',
      body: (
        <>
          Merging every partition's register array by element-wise maximum gives exactly the
          registers a single pass over the whole stream would have produced. Summing each
          partition's own estimate instead over-counts by several times the true number of
          distinct customers, because customers who ordered in more than one partition are
          counted again for each one.
        </>
      ),
      duration: 5.2,
      fig: 'merged registers vs. single pass; summed estimate vs. the truth',
      takeaway: 'Summing per-partition distinct-count estimates over-counts; merging the registers themselves does not.',
      Visual: S.RegisterMergeMeasured,
    },
    {
      title: 'A summary that is only approximately mergeable',
      body: (
        <>
          A quantile sketch keeps a bounded sample or summary instead of every value, so it can
          only approximate, within a stated error, what sorting the whole stream would answer. A
          warehouse's own approximate-percentile function spends more memory for a tighter error
          bound, and a streaming engine's compact quantile sketch trades some of that accuracy
          back for a smaller summary. An analytics engine's own sketch library ships the same
          shape of structure for counting, for quantiles and for heavy keys together, each one
          named as mergeable.
        </>
      ),
      duration: 5.8,
      fig: 'a bounded sample standing in for every value',
      Visual: S.QuantileSketch,
    },
    {
      title: 'Measured: averaging medians is wrong',
      body: (
        <>
          The naive average of the eight partitions' own medians lands far from the true median
          of the whole stream, exactly as the hook predicted it would, pulled off by the one
          small, skewed partition. A merged, weighted sample built from each partition's own
          small reservoir lands close to the true median instead.
        </>
      ),
      duration: 5.0,
      fig: 'naive average vs. merged sample vs. the true median',
      takeaway: 'Averaging per-partition medians, or summing per-partition distinct counts, is wrong even when every partition is exact.',
      Visual: S.AveragingWrong,
    },
    {
      title: 'Where the weighting comes from',
      body: (
        <>
          A warehouse's own range-partitioning step takes a small reservoir sample from each
          partition before ever sorting a row, weighting each sampled value by how many rows its
          own partition actually held. That is the same weighting this topic's merged quantile
          sample used a moment ago: a sample is only mergeable once its weight travels with it.
        </>
      ),
      duration: 4.6,
      fig: 'a reservoir sample, weighted by its own partition size',
      Visual: S.WeightedSampling,
    },
    {
      title: 'Measured: boundaries chosen from samples alone',
      body: (
        <>
          The same weighted, merged samples, now choosing where a downstream repartition should
          cut the stream into roughly equal pieces, land close to the boundaries a full sort of
          every row would have chosen — without ever sorting the whole stream to find them.
        </>
      ),
      duration: 4.8,
      fig: 'sampled boundaries vs. the true boundaries a full sort would choose',
      Visual: S.RangeBoundaries,
    },
    {
      title: 'Named once: a filter that merges too',
      body: (
        <>
          A membership filter built the same way in two different partitions, with the same
          size and the same hash count, can be merged by a plain bitwise union: anything either
          partition's own filter would have called present still tests present in the merged
          filter. The same filter an earlier chapter built to skip a scan now travels across
          partitions the same way a sketch does.
        </>
      ),
      duration: 4.4,
      fig: 'two partitions’ filters, merged by a plain bitwise union',
      Visual: S.BloomMerge,
    },
    {
      title: 'Where a sketch travels',
      body: (
        <>
          A partial sketch is built once on each machine as the data is read, crosses the
          network as an ordinary string of bytes during a shuffle, and is merged once at the
          end into the final answer — the same shape as the distributed top-N merge an earlier
          topic already measured, with a sketch standing in for a bounded heap.
        </>
      ),
      duration: 4.6,
      fig: 'map-side sketch, shuffled as bytes, merged once at the end',
      Visual: S.WhereItTravels,
    },
    {
      title: 'Recap',
      body: (
        <>
          A hash table that spills, a sort that spills, a heap that merges, a queue that
          schedules, a union–find that clusters, a tree that indexes, a ring that places, and
          now a sketch that merges: eight textbook structures, each with one production
          constraint added. A sketch earns its place in a distributed aggregate the moment its
          merge law is checked, not assumed.
        </>
      ),
      duration: 4.4,
      fig: 'eight structures, eight constraints, recapped',
      Visual: S.Recap,
    },
    {
      title: 'Reading them was half of the skill',
      body: (
        <>
          Reading eight structures inside real systems is half of the skill the rest of this
          milestone taught; the other half is writing one that is right and fast. The next
          chapter turns from reading to practice: building each structure once, arguing it
          correct, testing it, and explaining it under a clock.
        </>
      ),
      duration: 4.2,
      fig: 'from reading real systems to building one from scratch',
      Visual: S.Handoff,
    },
  ],
};

export default reel;
