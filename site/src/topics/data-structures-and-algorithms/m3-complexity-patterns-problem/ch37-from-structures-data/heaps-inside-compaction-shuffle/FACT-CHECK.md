# FACT-CHECK — Heaps inside compaction, shuffle and top-N

| # | Claim | Checked against |
|---|---|---|
| 1 | Pebble's `mergingIter` keeps one heap of child iterators that operates as a min-heap forward and a max-heap backward, and "fixes" the heap on each `Next`/`Prev` | `merging_iter.go`, quoted word for word |
| 2 | RocksDB's `MergingIterator` independently uses a min/max heap over point iterators | `merging_iterator.cc`, quoted word for word |
| 3 | RocksDB's internal-key comparator breaks ties on the user key by decreasing sequence number | `dbformat.h`, quoted word for word |
| 4 | A compaction's input iterator is built by `VersionSet::MakeInputIterator`, which opens one iterator per input file across every input level and feeds a `NewCompactionMergingIterator` | `version_set.cc`, read — the function signature and the trace point name are quoted; the full construction logic was read, not quoted verbatim, since it is not one sentence |
| 5 | `CompactionIterator` is where a compaction drops versions a newer one has shadowed | `compaction_iterator.h`, read (`NextFromInput()`); not quotable as one sentence, stated as read in SOURCES.md |
| 6 | Velox's `TreeOfLosers` returns the stream with the lowest first value on each call to `next()` | `TreeOfLosers.h`, quoted word for word |
| 7 | For 12 streams, the tree of losers puts 8 on the last level and 4 as inner nodes on the level above, per the constructor's own worked example | `TreeOfLosers.h`, quoted word for word |
| 8 | `UnsafeSorterSpillMerger` never enqueues an empty spill reader, to avoid an extra empty record | `UnsafeSorterSpillMerger.java`, quoted |
| 9 | `ExternalSorter.mergeSort` builds a `PriorityQueue` with the comparator reversed, because the queue dequeues the maximum | `ExternalSorter.scala`, quoted word for word |
| 10 | `BoundedPriorityQueue` retains only the top K elements, replacing the current lowest only when a new element ranks higher | `BoundedPriorityQueue.scala`, quoted and reproduced in `examples.py`'s `bounded_top_n` |
| 11 | `Utils.takeOrdered` runs a bounded top-K per partition, shuffles the small result, then runs the same bounded top-K once more | `limit.scala`, quoted (`localTopK`, the second `Utils.takeOrdered` call) |
| 12 | `RDD.takeOrdered`'s own doc comment calls it the opposite of `top` | `RDD.scala`, quoted word for word |
| 13 | A comment attributing "This could have been named TopK..." to `limit.scala` (named provisionally in CHAPTER.md) does not appear in the current `master` branch | `spark-limit.txt` (fetched research copy), grepped directly for "TopK" and "opposite" — not found; not attributed anywhere in this topic's files |
| 14 | PostgreSQL's `make_bounded_heap` reverses the sort direction so the largest (worst, for an ascending bound) entry sits at the root, to discard it cheaply | `tuplesort.c`, quoted word for word |
| 15 | The switch into a bounded heapsort fires once the input exceeds twice the bound, or once `workMem` fills with enough tuples to meet the bound | `tuplesort.c`, quoted word for word |
| 16 | At a fan-in of 8, Chapter 6's own lab measured a binary heap at 4.35 comparisons per output and a loser tree at exactly `log2(8) = 3.00`, a 1.45× ratio | `dsa.tournament-loser-trees/examples.py`, re-run directly, output matches `examples.py`'s embedded constants exactly |
| 17 | CHAPTER.md's "256-way merge" assumption does not correspond to anything Chapter 6 actually built | `dsa.tournament-loser-trees/examples.py`, grepped for "256" — not present; the file measures k=8 and k=6 |
| 18 | A merging iterator over four small "sstables," one holding a newer tombstone over an older live version of the same key, drops that key entirely after compaction | `examples.py`, `compaction_drop_shadowed`, `"d" not in RESULT` asserted and holds |
| 19 | The expected number of bounded-heap replacements over n random-order rows, keeping the top k, is k·(Hₙ − H_k) | derived from first principles (row i > k replaces with probability k/i, by symmetry of a uniformly random arrival order) in `examples.py`'s own comment; verified by exact Monte Carlo at n=2000, k=10 against the formula's prediction, within 8% over 400 trials |
| 20 | For n=400,000,000 and k=10, the formula predicts about 175 replacements | `examples.py`, `HOOK_REPLACEMENTS_ROUNDED`, computed via the standard harmonic-number asymptotic, itself checked against the exact harmonic sum at n=100,000 to under 1e-9 before being trusted at 400,000,000 |
| 21 | Topic 118's (`dsa.sorting-inside-spilling-operators`) registry `introduces` and handoff match this topic's bridge word for word | confirmed directly with the thread that built topic 118, and against `registry.ts` after merging `origin/main` |
| 22 | Chapter 16 topic 58 ("Quickselect and median-of-medians") is live, so `quickselect` moves from `declared` to `uses` | `registry.ts`, grepped directly, `status: 'live'` confirmed at build time (2026-11-07) |

## Red-team pass

- **Does the compaction example actually exercise a tombstone shadowing a live version across
  different files, or could it pass by coincidence?** Checked: the tombstone (`"d", 25, None`)
  and the live version (`"d", 20, "d@20"`) are in different input streams, and the assertion
  `"d" not in RESULT` would fail if the merge order, or the drop logic, mishandled either.
- **Is the 175-replacement number stated from a textbook formula, or actually derived here?**
  Derived from first principles in `examples.py`'s own comment (the per-row probability
  argument), not copied from any source; the formula is a known one (order statistics of a
  random permutation) but the derivation and the numeric evaluation are this topic's own work,
  checked against Monte Carlo before being trusted at scale.
- **Does "three of four engines choose the heap" overclaim from only four data points?** No —
  post-notes.md and the reel state only what was read in these four files (Pebble, RocksDB,
  Spark's two merges), not a claim about engines generally; PostgreSQL's own final merge
  (`tuplesort.c`) also uses a heap, which would make it four of five if counted, not contradicting
  the claim as scoped.
- **Is the Spark `limit.scala` quote about `localTopK` actually describing a bounded heap, or
  just a `.take(limit)` on an already-sorted partition?** Checked: the `orderingSatisfies`
  branch does use a plain `.take(limit)` when the child's output is already ordered; the other
  branch, which this topic's claim is about, calls `Utils.takeOrdered`, which is the bounded-heap
  path — both branches are visible in the quoted excerpt in SOURCES.md, and the claim is scoped
  to the `Utils.takeOrdered` branch only.

## Corrections applied

1. The provisional "256-way merge" comparison from CHAPTER.md was replaced with Chapter 6's real
   measured k=8/k=6 counts (see claim #16–17 above and OUTLINE.md → "Changes from the chapter
   plan").
2. The `limit.scala` comment CHAPTER.md attributed provisionally ("This could have been named
   TopK...") was dropped entirely after it could not be found in the current source (claim #13);
   `RDD.scala`'s doc comment on `takeOrdered` is used in its place, and is itself verified.
