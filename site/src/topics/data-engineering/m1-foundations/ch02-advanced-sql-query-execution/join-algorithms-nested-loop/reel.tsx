import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: `join_demo` schema (`customers` 100,000 rows, `orders2` 2,000,000 rows, `customer_id`
// indexed on orders2) — sized so a single-customer filter is extremely selective and a full join touches every
// row of the larger table, letting the same two tables show both ends of the cardinality spectrum.
// Every number below is in examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'Two queries, two algorithms',
      body: (
        <>
          Same two tables. One customer's orders: 9.681 ms. Every order joined to its customer: 383.6 ms. The planner didn't just run the second one longer
          — it picked a different algorithm.
        </>
      ),
      duration: 4.2,
      fig: '9.681 ms vs. 383.6 ms',
      Visual: S.TwoQueries,
    },
    {
      title: 'Predict: one customer out of 100,000',
      body: (
        <>
          One customer's row matched against 2,000,000 orders, with <code>orders2.customer_id</code> indexed. Which join algorithm will the planner pick?
        </>
      ),
      duration: 1.8,
      fig: '1 of 100,000 customers',
      predict: {
        options: [{ label: 'Nested Loop', correct: true }, { label: 'Hash Join' }, { label: 'Merge Join' }],
        explain: (
          <>
            Nested Loop — with only one outer row and an index on the inner side, the join never has to build a hash table or sort anything; it just looks
            up this one customer's orders directly.
          </>
        ),
      },
      Visual: S.PredictFiltered,
    },
    {
      title: 'Reveal: 14.6× apart',
      body: (
        <>
          Nested Loop, by default: 9.681 ms. Force the planner into a Hash Join on the identical query: 141.187 ms — about 14.6× slower, for the exact same
          tables, same filter, same data.
        </>
      ),
      duration: 4,
      fig: '9.681 ms → 141.187 ms',
      takeaway: 'A tiny outer side with an indexed inner side is a nested loop winning by a wide margin.',
      Visual: S.RevealFiltered,
    },
    {
      title: 'How a nested loop actually runs',
      body: (
        <>
          For every row the outer side produces, the inner side is scanned again. With one outer row, that's one inner scan. An index on the inner side
          turns "scan again" into "one lookup" — which is exactly why it wins when the outer side is tiny.
        </>
      ),
      duration: 4.2,
      fig: 'outer row → inner lookup',
      Visual: S.NestedLoopMechanism,
    },
    {
      title: 'How a hash join actually runs',
      body: (
        <>
          Build an in-memory hash table on one side; scan the other side once and probe the table for each row. One pass over each input — no repeated
          inner scans — but it needs an equality condition, and the table has to fit in memory.
        </>
      ),
      duration: 4.2,
      fig: 'build, then probe',
      Visual: S.HashJoinMechanism,
    },
    {
      title: 'Predict: the full join',
      body: (
        <>
          Same two tables, no filter at all — every one of the 2,000,000 orders joined to its customer. Which algorithm wins now?
        </>
      ),
      duration: 1.8,
      fig: 'every row, no filter',
      predict: {
        options: [{ label: 'Nested Loop' }, { label: 'Hash Join', correct: true }, { label: 'Merge Join' }],
        explain: (
          <>
            Hash Join — with no selective filter to shrink one side, there's no small outer side for a nested loop to exploit, and no free sort order for a
            merge join to rely on. One hash table, one pass over each side, wins.
          </>
        ),
      },
      Visual: S.PredictFull,
    },
    {
      title: 'Reveal: hash wins, merge loses',
      body: (
        <>
          Hash Join by default: 339.6–383.6 ms. Forced Nested Loop: 431.269 ms. Forced Merge Join: 543.876 ms — the most expensive of the three, measured as
          it came out, not adjusted to make merge join look better.
        </>
      ),
      duration: 4.6,
      fig: '383.6 → 431.269 → 543.876 ms',
      takeaway: 'No index to exploit and no free sort order left hash join the cheapest of the three, here.',
      Visual: S.RevealFull,
    },
    {
      title: 'How a merge join actually runs',
      body: (
        <>
          Both inputs have to already be sorted on the join key — by an index, or by an explicit sort step the planner adds. No hash table, no repeated
          inner scans, but paying for that sort (or not having to) is what decides whether it was worth it.
        </>
      ),
      duration: 4.2,
      fig: 'two sorted streams, zipped',
      Visual: S.MergeJoinMechanism,
    },
    {
      title: 'What actually decides the choice',
      body: (
        <>
          Cardinality and selectivity, existing sort order, memory, and whether the condition is even an equality — four factors, and a nested loop is the
          only algorithm that never needs the last one.
        </>
      ),
      duration: 4.4,
      fig: 'four factors',
      Visual: S.DecisionFactors,
    },
    {
      title: 'Predict: shrinking work_mem',
      body: (
        <>
          The full join, forced to Hash Join, with <code>work_mem</code> cut from its 4MB default down to 64kB. What happens to the plan?
        </>
      ),
      duration: 1.8,
      fig: '4 MB → 64 kB',
      predict: {
        options: [
          { label: "Nothing — work_mem doesn't affect hash joins" },
          { label: 'The hash table spills to disk in more batches', correct: true },
          { label: 'The planner switches to a different algorithm' },
        ],
        explain: (
          <>
            More batches — once the hash table no longer fits in <code>work_mem</code>, PostgreSQL partitions it and spills the extra partitions to
            temporary disk files, still as a Hash Join, just across more batches.
          </>
        ),
      },
      Visual: S.PredictWorkMem,
    },
    {
      title: 'Reveal: 1 batch becomes 64',
      body: (
        <>
          At the default 4MB: 1 batch, 383.577 ms. At 64kB: 64 batches, 413.237 ms — about 7.7% slower. The hash table had to spill, but spilling cost far
          less than the nested-loop-vs-hash gap on the filtered query did.
        </>
      ),
      duration: 4.4,
      fig: '1 batch → 64 batches',
      takeaway: 'A hash join spilling to disk is visible directly in its own batch count, not just its timing.',
      Visual: S.RevealWorkMem,
    },
    {
      title: 'work_mem: the budget before the spill',
      body: (
        <>
          <code>work_mem</code> is the memory a sort or hash table gets before it starts writing to temporary disk files — 4MB by default. Hash-based
          operations get extra headroom from <code>hash_mem_multiplier</code>; batches are how they keep running once even that runs out.
        </>
      ),
      duration: 4.4,
      fig: 'work_mem, then batches',
      Visual: S.WorkMemMechanism,
    },
    {
      title: 'Predict: an inequality, and nested loop disabled',
      body: (
        <>
          Same tables, but the join condition is now a range, not an equality — and <code>enable_nestloop = off</code>. Does the planner still manage to
          avoid a nested loop?
        </>
      ),
      duration: 1.8,
      fig: 'a range, nested loop off',
      predict: {
        options: [{ label: 'Yes — it finds a hash or merge join instead' }, { label: "No — it's still a Nested Loop", correct: true }],
        explain: (
          <>
            No — hash join and merge join both need an equality condition to work with; a range predicate leaves nested loop as the only algorithm that was
            ever an option, setting or not.
          </>
        ),
      },
      Visual: S.PredictInequality,
    },
    {
      title: 'Reveal: impossible to suppress entirely',
      body: (
        <>
          The plan is still Nested Loop. The alternative paths don't disappear from <code>EXPLAIN</code> — they're priced at an inflated cost instead, on
          the order of 1e10, discouraged rather than disallowed.
        </>
      ),
      duration: 4,
      fig: 'Nested Loop, cost ~1e10 elsewhere',
      takeaway: "The docs say it plainly: it's impossible to suppress nested-loop joins entirely.",
      Visual: S.RevealInequality,
    },
    {
      title: 'Before you trust a join',
      body: (
        <>
          Does one side have an index the other side can drive into? Is either side already sorted on the join key? And is this even an equality condition
          at all?
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
          An outer side has exactly 1 row. The inner table's join column is indexed. Which join algorithm will almost certainly win?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'Nested Loop', correct: true }, { label: 'Hash Join' }],
        explain: <>Nested Loop — one outer row means the inner index lookup only ever has to run once.</>,
      },
      Visual: S.ProveFiltered,
    },
    {
      title: 'Prove it · 2 of 2',
      body: (
        <>
          <code>EXPLAIN (ANALYZE)</code> on a hash join reports 12 batches. What does that tell you, and which setting controls it?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'The hash table fit in work_mem' },
          { label: "The hash table didn't fit, so it spilled to disk — work_mem", correct: true },
        ],
        explain: (
          <>
            More than 1 batch means the hash table outgrew <code>work_mem</code> and had to spill to temporary disk files across multiple batches.
          </>
        ),
      },
      Visual: S.ProveBatches,
    },
  ],
};

export default reel;
