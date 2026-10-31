# Fact-check — de.deletion-vectors-across-formats

## Claims table

| # | Claim (as stated in the reel) | Source | Verified |
|---|---|---|---|
| 1 | A deletion vector identifies deleted rows by encoding deleted positions in a bitmap; a set bit at position P means row P is deleted | Iceberg spec | Yes — direct quote |
| 2 | There can be at most one deletion vector per data file in a snapshot, more efficient at execution time than position delete files | Iceberg spec | Yes — direct quote |
| 3 | Iceberg stores deletion vectors using the deletion-vector-v1 blob definition from the Puffin spec | Iceberg spec | Yes — direct quote |
| 4 | Deletion vectors use a collection of 32-bit Roaring bitmaps to stay compact | Iceberg spec | Yes — direct quote |
| 5 | Iceberg's deletion-vector-v1 blob format uses big-endian length/CRC fields specifically for compatibility with existing Delta deletion vectors | Puffin spec | Yes — direct quote, confirms Delta/Iceberg share the underlying bitmap format |
| 6 | The blob records a cardinality (number of deleted rows) as part of its metadata | Puffin spec | Yes — direct quote |
| 7 | Delta's deletion vectors feature is in experimental support mode as of Delta Lake 2.3.0+ | docs.delta.io | Yes — direct quote |
| 8 | By default a single-row delete rewrites the whole Parquet file; deletion vectors mark rows removed without rewriting it | docs.delta.io | Yes — direct quote |
| 9 | Delta reads resolve current state by applying deletion-vector deletions at read time | docs.delta.io | Yes — direct quote |
| 10 | Delta's OPTIMIZE / REORG TABLE ... APPLY (PURGE) physically rewrites files to clear deletion-vector debt | docs.delta.io | Yes — direct quotes |
| 11 | Hudi's own mechanism is not a bitmap: deletes are written as records directly into its merge-on-read log files, merged dynamically at query time | Hudi table_types docs | Yes — direct quote |
| 12 | The real RoaringBitmap format switches a container from an array to a bitset once cardinality exceeds 4,096 | RoaringFormatSpec | Yes — direct quote |
| 13 | A real deletion vector built in this sandbox with 1,200 deleted positions (under the 4,096 threshold) stays an array container, serialized at 2,400 bytes (2 bytes/position) | examples.py demo 1 | Yes — reproduced for real |
| 14 | The same container built with 5,000 deleted positions (over the threshold) switches to a fixed 8,192-byte bitset | examples.py demo 1 | Yes — reproduced for real, matches the real format's fixed single-container bitset size (65,536 bits / 8) |
| 15 | Applying a real deletion vector at read time costs measurably more than reading with no deletes at all, and a real compaction pass that purges the deleted rows reads faster than the deletion-vector-applied scan | examples.py demo 2 | Yes — reproduced for real on local disk, verified robust across 5 consecutive runs |

## Currency note

All five sources fetched 2026-10-31. Iceberg spec's current Deletion Vectors section (v3/v4
behavior) and current Puffin spec's deletion-vector-v1 blob type. Delta's deletion-vectors doc
notes the feature is "in experimental support mode" as of Delta Lake 2.3.0+ — this topic treats
it as Delta's real, documented mechanism today, not a claim it is stable-forever or always-on by
default. Hudi's `table_types` doc is versioned 1.2.1. The RoaringFormatSpec README is read from
its `master` branch, the canonical reference for the format Iceberg's own spec explicitly builds
on.

## Red-team

1. **The "data file" in examples.py is plain CSV text, not Parquet**, disclosed in the script's
   own docstring. The measured mechanism — a bitmap indexed by row position, a real array/bitset
   size tradeoff at the real 4,096-element threshold, and a real added per-row read cost that
   compaction pays back — is the general, transferable shape every one of these formats shares,
   not a claim of reproducing Parquet's binary layout.
2. **`DeletionVectorContainer` is a simplified reimplementation of the Roaring format**, not the
   real RoaringBitmap library. It reuses the real format's own array/bitset threshold (4,096) and
   single-container bitset size (65,536 bits, i.e. 8,192 bytes) taken directly from the
   RoaringFormatSpec, but does not implement run-length containers, multi-container key layout,
   or the real on-disk serialization (cookie header, descriptive header, offset header) byte for
   byte. What transfers is the size tradeoff and the format's own crossover threshold, not the
   literal bytes a production encoder would emit.
3. **Delta and Iceberg's deletion vectors are not merely "the same idea by different names" —
   they are protocol-compatible at the bitmap level.** The Puffin spec's own text ("Big endian
   values were chosen for compatibility with existing deletion vectors in Delta tables") is cited
   directly for this claim rather than inferred, since it is a stronger and more specific claim
   than this chapter's earlier "same idea, different names" framing (topic 14's own Recap) and
   needed its own sourced justification.
4. **Hudi's own mechanism is deliberately not described as "a deletion vector" by this topic**,
   since Hudi's docs never use that term for its MOR log-file deletes — it is named here as "the
   same question, answered differently": a per-record delete marker inside a log file, not a
   bitmap at all. This is a real architectural difference, not a naming difference, and the reel
   is careful not to claim Hudi has an equivalent bitmap mechanism it does not have.
5. **The read-cost demo's "compaction" is a simple purge-and-rewrite of the CSV file**, not a
   real columnar file rewrite or a real query engine's physical plan change. What is measured and
   asserted is the real, general shape (a deletion-vector-applied scan costs more than a plain
   scan; a post-compaction scan costs less than the deletion-vector-applied one), consistent with
   the chapter's established cost-shape-only disclosure pattern from topics 13 and 14.

## Problem-solving notes

- No flaky-timing issues were hit building this topic's `examples.py` — the per-row deletion
  vector lookup is deliberately kept entirely in-process (a `frozenset`/bytearray lookup per
  line), so its added cost is consistent and large enough relative to this sandbox's I/O noise to
  assert directly with `median_timed`'s 9-repeat median, unlike topic 14's isolated-merge-prep
  fix which was needed because that signal was much smaller relative to a much larger shared base
  scan. Verified by running the full script 5 times consecutively — all 5 passed with the same
  ordering (deletion-vector-applied scan slowest, plain scan and compacted scan both faster, in
  that relative order each time).
