import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: `mem_demo` (2,000,000 rows: sort_key, join_key, skew_key) and `mem_join_small`
// (500,000 rows), the previous topic's own build/probe vs sorted-input split now examined at the
// level of the memory budget underneath both sides of it. Every number below is in examples.py and
// SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'The same spill, two different outcomes',
      body: (
        <>
          Sort 2,000,000 rows past <code>work_mem</code>, and the sort spills about 35 megabytes to disk either way. At the default budget it finishes in
          785.415 ms. Starve the budget down to 64 kilobytes, and the same 35-megabyte spill takes 1089.428 ms.
        </>
      ),
      duration: 4.4,
      fig: '785.415 ms vs. 1089.428 ms, same spill',
      Visual: S.TwoSpills,
    },
    {
      title: 'Predict: does spilling make a sort slower?',
      body: (
        <>
          <code>ORDER BY sort_key</code> over 2,000,000 rows, no <code>LIMIT</code>, at the default <code>work_mem</code> of 4 megabytes — far too small to
          hold the whole sort in memory. Does spilling the rest to disk make this slower than giving it all the memory it wants?
        </>
      ),
      duration: 1.8,
      fig: '2,000,000 rows, work_mem = 4 MB',
      predict: {
        options: [{ label: 'Always slower' }, { label: 'Only if work_mem is severely undersized', correct: true }, { label: 'Never slower' }],
        explain: (
          <>
            Only if work_mem is severely undersized — a spill that only needs a modest number of merge passes measured no slower than staying fully in
            memory here; it's a starved budget, not the spill itself, that costs time.
          </>
        ),
      },
      Visual: S.PredictSpillSlower,
    },
    {
      title: 'Reveal: not necessarily',
      body: (
        <>
          256 megabytes of <code>work_mem</code> sorts the whole thing in memory with a <code>quicksort</code>: 849.199 ms. 4 megabytes — the default — spills
          35,248 kilobytes to disk with an <code>external merge</code> sort: 785.415 ms. The spill measured faster.
        </>
      ),
      duration: 4.4,
      fig: '849.199 ms in memory vs. 785.415 ms spilled',
      takeaway: 'A spill that fits in a handful of merge passes isn’t inherently slow — it measured faster than memory here.',
      Visual: S.RevealNotNecessarily,
    },
    {
      title: 'How work_mem actually budgets',
      body: (
        <>
          <code>work_mem</code> is the ceiling for one sort or one hash table, not for a whole query. A query with several sorts and hashes can spend it
          several times over, and so can every other session running at the same time.
        </>
      ),
      duration: 4.2,
      fig: 'one budget, per operation',
      Visual: S.HowWorkMemBudgets,
    },
    {
      title: 'Reveal: what actually gets slow',
      body: (
        <>
          Shrink <code>work_mem</code> to 128 kilobytes, then 64 kilobytes: 1065.678 ms, then 1089.428 ms — both spilling almost exactly the same 35
          megabytes the default run did. The data written barely changed; the time to merge it back together did.
        </>
      ),
      duration: 4.4,
      fig: '785.415 ms → 1065.678 ms → 1089.428 ms',
      takeaway: 'The cost isn’t the disk write — it’s how many merge passes a starved budget forces.',
      Visual: S.RevealWhatGetsSlow,
    },
    {
      title: 'How hash gets more room than sort',
      body: (
        <>
          A hash table is more sensitive to running out of room than a sort is, so PostgreSQL gives it more: <code>work_mem × hash_mem_multiplier</code>,
          2.0 by default. The same 4-megabyte <code>work_mem</code> took a hash join from 8 batches down to 2 once the multiplier went to 4.0.
        </>
      ),
      duration: 4.4,
      fig: '8 batches → 2 batches, same work_mem',
      Visual: S.HowHashGetsMoreRoom,
    },
    {
      title: 'Predict: shrink work_mem under a hash join',
      body: (
        <>
          A hash join builds its table from the smaller, 500,000-row side. Shrink <code>work_mem</code> from 256 megabytes down to 64 kilobytes. What
          happens to the join?
        </>
      ),
      duration: 1.8,
      fig: '500,000-row build side',
      predict: {
        options: [{ label: 'The query errors out' }, { label: 'It still runs, split into more partitions', correct: true }, { label: 'PostgreSQL ignores the setting' }],
        explain: (
          <>
            It still runs, split into more partitions — the planner's own choice, a hash join, never fails for lack of memory; it just divides the work into
            more batches on disk.
          </>
        ),
      },
      Visual: S.PredictHashShrink,
    },
    {
      title: 'Reveal: the batches double',
      body: (
        <>
          256 megabytes: 1 batch. 4 megabytes: 4. 1 megabyte: 16. 256 kilobytes: 64. 64 kilobytes: 256. Checked at the finer step between 1 megabyte and 256
          kilobytes too — 512 kilobytes landed at exactly 32, right between them.
        </>
      ),
      duration: 4.6,
      fig: '1 → 4 → 16 → 32 → 64 → 256 batches',
      takeaway: 'A hash join that doesn’t fit doesn’t fail — its batch count just doubles each time the budget halves.',
      Visual: S.RevealBatchesDouble,
    },
    {
      title: 'How a batch actually spills and recombines',
      body: (
        <>
          Rows that don't belong to the batch currently in memory go to a numbered partition file on disk instead — both the build side and the matching
          probe-side rows. Once the in-memory scan is done, each partition is joined on its own, one batch at a time.
        </>
      ),
      duration: 4.4,
      fig: 'numbered partition files, joined one at a time',
      Visual: S.HowBatchesSpill,
    },
    {
      title: 'Predict: two sessions, same work_mem',
      body: (
        <>
          Two sessions, each with a 4-megabyte <code>work_mem</code>, each running the same spilling sort — at the same time. What happens to the total
          memory (and temp disk) the two of them actually use?
        </>
      ),
      duration: 1.8,
      fig: '2 sessions, 4 MB work_mem each',
      predict: {
        options: [{ label: 'It’s shared and capped at 4 MB total' }, { label: 'Each gets its own, so the total multiplies', correct: true }, { label: 'PostgreSQL queues the second one' }],
        explain: (
          <>
            Each gets its own, so the total multiplies — work_mem is a per-operation budget, not a system-wide ceiling, and nothing stops two sessions from
            spending it at once.
          </>
        ),
      },
      Visual: S.PredictConcurrency,
    },
    {
      title: 'Reveal: concurrency multiplies the budget',
      body: (
        <>
          One session alone spills 35,248 kilobytes. Start two sessions together, both doing the same sort, and polling the temp directory while they
          overlap shows combined usage climbing to 69 megabytes — close to double, measured live, not assumed.
        </>
      ),
      duration: 4.4,
      fig: '35 MB alone → 69 MB combined',
      takeaway: 'work_mem is a per-operation budget, not a system-wide ceiling — every concurrent spiller pays it again.',
      Visual: S.RevealConcurrencyMultiplies,
    },
    {
      title: 'Why skew needs its own protection',
      body: (
        <>
          One value out of 2,000,000 rows carries 20,000 of them — 1%. Without special handling, every one of those rows would get rewritten into every
          partition a hash join builds. PostgreSQL keeps a frequent key's matching rows in a dedicated in-memory bucket instead, confirmed in the executor's
          own source, though this version's <code>EXPLAIN</code> gives no separate line for it.
        </>
      ),
      duration: 4.8,
      fig: '1% of rows, one key',
      Visual: S.WhySkewNeedsProtection,
    },
    {
      title: 'Recap',
      body: (
        <>
          <code>work_mem</code> budgets one operation, not one query. Hash gets <code>work_mem × hash_mem_multiplier</code>. Spilling itself measured fine
          here — too few merge passes is the real cost. A hash join partitions instead of failing. Every concurrent spiller pays its own budget again.
        </>
      ),
      duration: 4.6,
      fig: 'five ideas, one running example',
      Visual: S.Recap,
    },
    {
      title: 'Prove it · 1 of 2',
      body: (
        <>
          An <code>EXPLAIN</code> line reads <code>Buckets: 16384  Batches: 64  Memory Usage: 256kB</code>. Is this hash join spilling to disk?
        </>
      ),
      duration: 2.2,
      fig: 'read the Batches line',
      predict: {
        options: [{ label: 'No — Batches: 64 just means 64 buckets' }, { label: 'Yes — more than one batch means it partitioned to disk', correct: true }],
        explain: (
          <>
            Yes — a single in-memory hash join always reports <code>Batches: 1</code>; anything higher means rows went to partition files on disk, exactly
            the same signal the earlier hash-join topic used for a spilling hash join.
          </>
        ),
      },
      Visual: S.ProveBatches,
    },
    {
      title: 'Prove it · 2 of 2',
      body: (
        <>
          6 sessions, each budgeted 8 megabytes of <code>work_mem</code>, all spilling at the same time. What's the worst-case total memory this workload
          can actually use?
        </>
      ),
      duration: 2.2,
      fig: '6 sessions × 8 MB work_mem',
      predict: {
        options: [{ label: '8 MB — work_mem caps the whole workload' }, { label: '48 MB — each session pays its own budget', correct: true }],
        explain: (
          <>
            48 megabytes — 6 sessions × 8 megabytes each, since work_mem is a per-operation, per-session budget with no system-wide cap of its own; that's
            the same multiplication measured live two steps back.
          </>
        ),
      },
      Visual: S.ProveConcurrency,
    },
  ],
};

export default reel;
