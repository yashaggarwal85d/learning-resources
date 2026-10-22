import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: PostgreSQL 16.15 (the existing "shop" database, topics 23-29), same sandbox.
// Every number below is in examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'Same query, same data, 60x fewer buffers',
      body: (
        <>
          The same count query, against the same 60-partition table, with the same filter: without pruning, all 60 partitions get scanned. With
          pruning, exactly one does.
        </>
      ),
      duration: 4.8,
      fig: '300 buffers (60 partitions) vs. 5 buffers (1 partition)',
      Visual: S.Hook,
    },
    {
      title: 'Predict: why would the planner ever scan every partition?',
      body: (
        <>
          The filter value is a literal, known the moment the query is written. Why would the planner ever need to scan a partition that literal
          can't possibly match?
        </>
      ),
      duration: 2.4,
      fig: 'a literal filter value, known before anything runs',
      predict: {
        options: [
          { label: 'It always does — partitioning never changes what gets scanned' },
          { label: 'It would not, once pruning is actually enabled', correct: true },
          { label: 'Only indexes, never partitions, can be skipped this way' },
        ],
        explain: (
          <>
            Once pruning is enabled, the planner proves which partitions a literal value can't match and drops them from the plan entirely —
            exactly the mechanism this topic measures directly.
          </>
        ),
      },
      Visual: S.PredictWhyScanAll,
    },
    {
      title: 'Reveal: range/list/hash partitioning',
      body: (
        <>
          A range partition's boundary is an ordered interval; a list partition's is a fixed set of values; a hash partition's is a bucket number.
          Each shape matches a different kind of predicate.
        </>
      ),
      duration: 4.4,
      fig: 'range: an interval. list: discrete values. hash: a bucket.',
      Visual: S.RevealPartitionTypes,
    },
    {
      title: 'Reveal: plan-time pruning',
      body: (
        <>
          With a literal filter value and pruning enabled, the planner proves most partitions can't match before scanning starts: 300 buffers
          drops to 5, 3.633 milliseconds drops to 0.146.
        </>
      ),
      duration: 4.8,
      fig: '300 → 5 buffers, 3.633 → 0.146 ms — proven at planning time',
      takeaway: 'Plan-time pruning proves most partitions cannot match a literal filter before any scan ever starts.',
      Visual: S.RevealPlanTimePruning,
    },
    {
      title: 'Predict: can pruning happen without a known literal value?',
      body: (
        <>
          A query's filter value is a parameter, not known until the query actually runs. Can any partition still be pruned at all in that case?
        </>
      ),
      duration: 2.4,
      fig: 'a parameter, not a literal — can pruning still happen?',
      predict: {
        options: [
          { label: 'No — pruning requires a literal known at planning time' },
          { label: 'Yes — pruning can also happen once execution begins', correct: true },
        ],
        explain: (
          <>
            Yes — PostgreSQL can prune partitions during execution too, once a parameter's real value is actually available, not only while the
            plan is being built.
          </>
        ),
      },
      Visual: S.PredictRuntimeValue,
    },
    {
      title: 'Reveal: run-time pruning',
      body: (
        <>
          Force a genuinely unresolved parameter through a prepared statement, and <code>EXPLAIN</code> reports <code>Subplans Removed: 59</code> —
          pruning performed once execution began, not when the plan was built.
        </>
      ),
      duration: 4.8,
      fig: 'Subplans Removed: 59 — pruned during execution, not planning',
      Visual: S.RevealRuntimePruning,
    },
    {
      title: 'Reveal: two different signals for two different moments',
      body: (
        <>
          Plan-time pruning simply leaves a partition out of the plan — it's just gone. Run-time pruning leaves it in the plan but reports it as{' '}
          <code>Subplans Removed</code>, since it genuinely could not be ruled out until execution began.
        </>
      ),
      duration: 4.4,
      fig: 'missing from the plan (plan-time) vs. Subplans Removed (run-time)',
      Visual: S.RevealTwoSignals,
    },
    {
      title: 'Predict: is partitioning ever a cost with no filter at all?',
      body: (
        <>
          A query with no filter genuinely needs every single partition — nothing can be pruned. Is partitioning itself ever a cost in that case?
        </>
      ),
      duration: 2.4,
      fig: 'no filter, every partition genuinely needed',
      predict: {
        options: [
          { label: 'No — partitioning only ever helps, never costs anything' },
          { label: 'Yes — more partitions means more to plan around, even unpruned', correct: true },
        ],
        explain: (
          <>
            Yes — every partition the planner has to consider adds real planning work, whether or not it ends up pruned, which is exactly what
            this topic measures next.
          </>
        ),
      },
      Visual: S.PredictPartitionCost,
    },
    {
      title: 'Reveal: overhead of too many partitions',
      body: (
        <>
          The identical data, in a 60-partition table versus one unpartitioned table: planning time climbs from 0.107 to 3.875 milliseconds,
          planning buffers from 4 to 791 — about 36 and 198 times more, from partition count alone.
        </>
      ),
      duration: 4.8,
      fig: 'planning: 0.107 → 3.875 ms, 4 → 791 buffers — same data, more partitions',
      takeaway: 'More partitions cost real planning time and memory, whether or not a given query gets to prune most of them.',
      Visual: S.RevealPartitionOverhead,
    },
    {
      title: 'Predict: DROP a partition, or DELETE the rows, for retention?',
      body: (
        <>
          A retention policy needs to remove a full year of old data. Is dropping the partition that holds it, versus deleting those rows
          directly, actually any different?
        </>
      ),
      duration: 2.8,
      fig: 'remove a year of data: DROP the partition, or DELETE the rows?',
      predict: {
        options: [
          { label: 'No difference — the same rows disappear either way' },
          { label: 'Yes — dropping the partition is dramatically faster', correct: true },
        ],
        explain: (
          <>
            Yes — dropping a partition removes it as one object, instantly; deleting the same rows one by one is a bulk operation this topic
            measures directly, and a slower one.
          </>
        ),
      },
      Visual: S.PredictDropVsDelete,
    },
    {
      title: 'Reveal: DROP vs. DELETE for retention',
      body: (
        <>
          Dropping a 1,000,000-row partition: 15.440 milliseconds. Deleting the identical 1,000,000 rows from an unpartitioned table instead:
          584.947 milliseconds — about 38 times slower, and that doesn't even include the VACUUM a bulk DELETE still needs afterward.
        </>
      ),
      duration: 4.8,
      fig: 'DROP: 15.440 ms. DELETE: 584.947 ms (plus a VACUUM DROP never needs).',
      takeaway: 'Dropping a partition for retention is dramatically faster than a bulk DELETE and skips the VACUUM a DELETE still needs.',
      Visual: S.RevealDropVsDelete,
    },
    {
      title: 'Reveal: choosing a partition key means choosing what retention can drop',
      body: (
        <>
          A partition key built around the predicates queries use is also, usually, the key a retention policy drops by — the same column decides
          both what gets pruned and what gets dropped whole.
        </>
      ),
      duration: 4.4,
      fig: 'one key, two jobs: pruning queries, dropping old data',
      Visual: S.RevealKeyChoice,
    },
    {
      title: 'Reveal: contrast with warehouse clustering',
      body: (
        <>
          A warehouse's clustering sorts rows into storage blocks instead of splitting the table into separate physical partitions — no
          DROP-a-partition retention trick, and no per-partition metadata overhead to manage.
        </>
      ),
      duration: 4.4,
      fig: 'partitioning: separate physical objects. clustering: sorted storage blocks.',
      Visual: S.RevealClusteringContrast,
    },
    {
      title: 'Recap',
      body: (
        <>
          Choose a partitioning method to match the predicates queries actually use. Plan-time pruning proves exclusions before scanning; run-time
          pruning does the same once a real value is known. More partitions cost real planning time. Dropping a partition beats deleting its rows.
        </>
      ),
      duration: 4.8,
      fig: 'match the predicate → prune early or late → watch partition count → drop, not delete',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A table has 24 partitions. A query's filter matches exactly one of them, and the value is a literal known when the query is written. How
          many partitions should EXPLAIN show as scanned?
        </>
      ),
      duration: 2.8,
      fig: '24 partitions, one literal match — how many scanned?',
      predict: {
        options: [
          { label: 'All 24 — every partition still has to be checked' },
          { label: 'Just 1 — the other 23 get pruned at plan time', correct: true },
        ],
        explain: (
          <>
            Just 1 — a literal value known at planning time is exactly the case plan-time pruning handles, proving the other 23 partitions can't
            possibly match before any scan begins.
          </>
        ),
      },
      Visual: S.ProvePartitionCount,
    },
  ],
};

export default reel;
