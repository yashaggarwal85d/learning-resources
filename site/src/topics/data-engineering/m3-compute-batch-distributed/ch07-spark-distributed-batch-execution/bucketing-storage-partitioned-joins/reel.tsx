import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Plan-text facts measured against a real local Apache Spark 4.0.1 (PySpark, local[4]) session
// (examples.py): two tables written bucketed by the same key, with the same bucket count, join
// with zero Exchange and both scans tagged "Bucketed: true"; the identical left table joined
// against the same data bucketed with a different count pays for exactly one real Exchange, and
// the left table's own scan — still 4 buckets on its own, unchanged — is tagged
// "Bucketed: false (disabled by query planner)". Storage-partitioned join (SPJ) and
// KeyGroupedPartitioning are sourced and quoted from Spark's own docs and code; no real DSv2/
// Iceberg table runs locally.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Partition pruning skipped reading data that couldn't match. This topic asks a sharper
          question: if two tables are already split the same way at write time, does a later join
          between them skip its shuffle entirely?
        </>
      ),
      duration: 4.5,
      fig: 'two tables, already pre-split by the same key. A free join, or not?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: matching bucket counts, zero Exchange, the scan itself tagged a bucketed read',
      body: (
        <>
          Measured: when both tables are written bucketed by the join key, with the same bucket
          count, the join's own plan has no shuffle in it at all. Both scans name themselves as a
          bucketed read.
        </>
      ),
      duration: 4.8,
      fig: 'same key, same bucket count: zero Exchange nodes, both scans tagged bucketed.',
      takeaway: 'Bucketing both tables by the join key at write time can remove the join\'s shuffle completely.',
      Visual: S.RevealMatchedBuckets,
    },
    {
      title: "Predict: the two tables don't agree on bucket count",
      body: (
        <>
          Same join key on both sides, but one table was written with a different number of
          buckets than the other. Does the join still skip its shuffle, or does something change?
        </>
      ),
      duration: 2.8,
      fig: 'same key, different bucket count. Still a free join, or does it cost something now?',
      predict: {
        options: [
          { label: "Still free — bucketed is bucketed, Spark matches the buckets up regardless of count" },
          { label: 'Not free — the counts have to match too, or the whole thing falls back to a real shuffle', correct: true },
        ],
        explain: (
          <>
            A bucketed read only helps the planner if both sides' bucket structure actually lines
            up. A different count means the buckets on one side simply don't correspond to the
            buckets on the other, so there's nothing left to exploit.
          </>
        ),
      },
      Visual: S.PredictMismatchedCount,
    },
    {
      title: "Reveal: one real Exchange, and the matching side's own scan shows bucketing disabled too",
      body: (
        <>
          Measured: the join now carries one genuine shuffle. And the table whose own bucket
          count never changed — still bucketed by the same key, on its own — loses its bucketed
          read as well. The mismatch disables the optimisation on both sides, not just one.
        </>
      ),
      duration: 4.8,
      fig: 'mismatched counts: one real Exchange. Even the still-matching side is marked disabled.',
      takeaway: "Bucketing has to match exactly, counts included, or Spark withdraws it from both sides, not only the one that changed.",
      Visual: S.RevealMismatchDisablesBoth,
    },
    {
      title: 'Predict: a DSv2 table partitioned the same way',
      body: (
        <>
          A table format like Iceberg can report its own partitioning directly to Spark, without
          anyone calling a bucketing function at all. Does that lean on the exact same mechanism
          this topic just measured, or something else underneath?
        </>
      ),
      duration: 2.8,
      fig: "Iceberg's own partitioning. Same bucketing mechanism under another name, or not?",
      predict: {
        options: [
          { label: "Same mechanism — Iceberg just calls bucketBy itself under the hood" },
          { label: "A different mechanism — the table's own catalog reports a partitioning Spark reuses directly", correct: true },
        ],
        explain: (
          <>
            Nothing here is written with Spark's own `bucketBy`. The table format's own catalog
            tells Spark how the data is already laid out, and Spark's planner takes that report at
            face value instead of needing an explicit bucketing call to trust it.
          </>
        ),
      },
      Visual: S.PredictDsv2Table,
    },
    {
      title: "Reveal: storage-partitioned join reuses the table's own reported partitioning, not Hive bucketBy at all",
      body: (
        <>
          Sourced from Spark's own docs and source: a storage-partitioned join generalises this
          topic's own bucketing idea to any compatible DSv2 source. The signal is the same —
          no Exchange before the join — but what produced it is the table's own catalog, never a
          `bucketBy` call.
        </>
      ),
      duration: 4.8,
      fig: "a DSv2 table's own partitioning avoids the shuffle too, with no bucketBy call anywhere.",
      takeaway: "Storage-partitioned join is bucketing's own idea generalised to a table's own reported layout, not the same underlying mechanism.",
      Visual: S.RevealStoragePartitionedJoin,
    },
    {
      title: 'Recap',
      body: (
        <>
          Matching buckets on both sides remove the join's shuffle entirely. A mismatch, even in
          just the bucket count, withdraws that for both sides, not only the one that changed. And
          a storage-partitioned join reaches the same result from a table's own reported layout,
          with no bucketing call needed at all.
        </>
      ),
      duration: 4.8,
      fig: 'matching buckets, a mismatch, and a table format reusing its own layout instead.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
