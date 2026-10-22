import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: `agg_demo.sales` (2,000,000 rows), grouped by `low_card` (100 distinct values) and
// `high_card` (1,500,000 distinct values) — one table demonstrating both ends of the group-cardinality
// spectrum, the same structural choice the previous topic's `join_demo` schema made for join selectivity.
// Every number below is in examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'Same table, two different winners',
      body: (
        <>
          Group 2,000,000 rows by a column with only 100 distinct values, and a hash table wins easily. Group the same rows by a column with 1,500,000
          distinct values, and the faster plan isn't a hash table at all.
        </>
      ),
      duration: 4.2,
      fig: '100 groups vs. 1,500,000 groups',
      Visual: S.TwoAggregates,
    },
    {
      title: 'Predict: 100 groups',
      body: (
        <>
          <code>GROUP BY low_card</code>, 100 distinct values out of 2,000,000 rows. A hash table needs one entry per group. A sort needs every row ordered
          first. Which wins?
        </>
      ),
      duration: 1.8,
      fig: '100 groups, 2,000,000 rows',
      predict: {
        options: [{ label: 'Hash aggregation', correct: true }, { label: 'Sort-based aggregation' }],
        explain: (
          <>
            Hash aggregation — with only 100 groups, the hash table is tiny and never has to spill, while sorting all 2,000,000 rows first is pure overhead
            this query doesn't need.
          </>
        ),
      },
      Visual: S.PredictLowCard,
    },
    {
      title: 'Reveal: hash wins by 2.1×',
      body: (
        <>
          <code>HashAggregate</code>: 558.673 ms, no spill. A forced sort: 1174.777 ms, spilling to disk first.
        </>
      ),
      duration: 4.2,
      fig: '558.673 ms vs. 1174.777 ms',
      takeaway: 'At low cardinality, a hash table this small never has a reason to lose.',
      Visual: S.RevealLowCard,
    },
    {
      title: 'How hash aggregation actually runs',
      body: (
        <>
          One hash table entry per distinct group value, built while scanning once. A row's group is looked up directly, not searched for — so the cost
          scales with the number of groups, not the number of rows.
        </>
      ),
      duration: 4.2,
      fig: 'one entry per group',
      Visual: S.HashAggMechanism,
    },
    {
      title: 'How sort-based aggregation actually runs',
      body: (
        <>
          Sort every row on the group key first — by an index, or an explicit sort — then walk the sorted stream, closing out one group's running total the
          moment the key changes. No hash table, but the sort gets paid for no matter how many groups there turn out to be.
        </>
      ),
      duration: 4.4,
      fig: 'sort, then walk the stream',
      Visual: S.SortAggMechanism,
    },
    {
      title: 'Predict: 1,500,000 groups',
      body: (
        <>
          Same table, same 2,000,000 rows, but now grouped by a column with almost as many distinct values as there are rows. Does hash aggregation still
          win?
        </>
      ),
      duration: 1.8,
      fig: '1,500,000 groups this time',
      predict: {
        options: [{ label: 'Yes — hash always wins' }, { label: 'No — sort-based aggregation wins now', correct: true }],
        explain: (
          <>
            No — with almost as many groups as rows, the hash table itself gets big enough to spill badly, while the sort's own cost never changed: it
            depends on row count, not group count.
          </>
        ),
      },
      Visual: S.PredictHighCard,
    },
    {
      title: 'Reveal: the crossover',
      body: (
        <>
          <code>HashAggregate</code> is still the planner's default, but it spills — 64 partitions, 321 batches, over 61,408 kilobytes to disk: 2479.537
          ms. Forced sort-based instead: 1737.653 ms, about 1.43× faster. The exact opposite of the 100-group case.
        </>
      ),
      duration: 4.8,
      fig: '2479.537 ms vs. 1737.653 ms',
      takeaway: "The planner's own default pick isn't always the faster one — this is measured, not assumed.",
      Visual: S.RevealHighCard,
    },
    {
      title: 'Why the winner flips',
      body: (
        <>
          Sort-based aggregation's bill tracks rows — 2,000,000 either way, so its cost barely moved. Hash aggregation's bill tracks groups against
          available memory — climb from 100 groups to 1,500,000 and the hash table itself becomes the expensive part.
        </>
      ),
      duration: 4.4,
      fig: 'rows vs. groups',
      Visual: S.CrossoverMechanism,
    },
    {
      title: 'Reveal: aggregating in two stages',
      body: (
        <>
          Each of 2 workers builds its own partial hash table on its own slice of the rows — a <code>Partial Aggregate</code> step. The leader merges those
          partial results into the final answer — a <code>Finalize Aggregate</code> step. Measured on the 100-group query: 260.757 ms, faster than even the
          single-worker hash case.
        </>
      ),
      duration: 4.8,
      fig: '2 workers → 260.757 ms',
      takeaway: 'Two cheap partial passes plus one small merge beat one worker doing the whole hash table alone.',
      Visual: S.ParallelAggMechanism,
    },
    {
      title: 'Predict: DISTINCT and parallelism',
      body: (
        <>
          <code>COUNT(DISTINCT low_card)</code> on the same table. The documentation says parallel aggregation isn't supported once an aggregate contains{' '}
          <code>DISTINCT</code>. What path does the planner reach for instead?
        </>
      ),
      duration: 1.8,
      fig: 'COUNT(DISTINCT low_card)',
      predict: {
        options: [{ label: 'A hash table, same as before' }, { label: 'A sort, to deduplicate first', correct: true }],
        explain: (
          <>
            A sort — PostgreSQL's own documentation lists <code>DISTINCT</code> alongside <code>ORDER BY</code> and merge joins as a reason sort operations
            exist at all.
          </>
        ),
      },
      Visual: S.PredictDistinct,
    },
    {
      title: 'Reveal: a plain sort, no hash table',
      body: (
        <>
          A plain <code>Aggregate</code> node sitting over an explicit <code>Sort</code>, which itself spills over 23,528 kilobytes to disk. No hash table
          anywhere in the plan, and no parallel workers either. 651.016 ms.
        </>
      ),
      duration: 4.2,
      fig: 'Sort, then Aggregate',
      takeaway: "DISTINCT doesn't get the hashed path other aggregates do — it gets the sort's dedup instead.",
      Visual: S.RevealDistinct,
    },
    {
      title: 'Why DISTINCT breaks the pattern',
      body: (
        <>
          A <code>DISTINCT</code> aggregate needs every row deduplicated before the aggregate function ever runs. Sorting already does that for free as a
          side effect of ordering the rows — which is exactly the role <code>work_mem</code>'s own documentation assigns to sorts.
        </>
      ),
      duration: 4.4,
      fig: 'dedup is a sort, not a hash',
      Visual: S.DistinctMechanism,
    },
    {
      title: 'Before you trust an aggregate plan',
      body: (
        <>
          How many groups, relative to how many rows? Is the query running in parallel at all? And does any aggregate in it carry a <code>DISTINCT</code>?
        </>
      ),
      duration: 4,
      fig: 'three questions',
      Visual: S.Recap,
    },
    {
      title: 'Prove it · 1 of 2',
      body: (
        <>
          A table has 10,000,000 rows. A <code>GROUP BY</code> on it produces only 20 distinct groups. Which aggregation strategy almost certainly wins?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'Hash aggregation', correct: true }, { label: 'Sort-based aggregation' }],
        explain: <>Hash aggregation — 20 groups is a tiny hash table no matter how many rows feed it, and sorting all 10,000,000 rows first would be pure waste.</>,
      },
      Visual: S.ProveLowCard,
    },
    {
      title: 'Prove it · 2 of 2',
      body: (
        <>
          <code>EXPLAIN (ANALYZE)</code> on a <code>HashAggregate</code> reports more than one batch. What does that tell you?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'The hash table fit in memory' },
          { label: "The hash table didn't fit, so it spilled to disk", correct: true },
        ],
        explain: <>More than one batch means the hash table outgrew its memory budget and had to spill — the same signal a spilling hash join gives.</>,
      },
      Visual: S.ProveBatches,
    },
  ],
};

export default reel;
