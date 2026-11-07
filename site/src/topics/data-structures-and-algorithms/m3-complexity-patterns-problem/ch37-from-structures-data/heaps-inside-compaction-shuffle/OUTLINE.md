# OUTLINE — Heaps inside compaction, shuffle and top-N

Chapter 37's third topic. Chapter 6's heap-based k-way merge and tournament/loser tree are found,
unmodified in kind, inside five real merge points (an LSM compaction, two different Spark spill
merges, a sort's final merge) and inside a sixth job — `ORDER BY … LIMIT` — that is the same heap
turned upside down and capped.

## Storyboard (12 steps)

1. Hook + predict: a RocksDB compaction of 20 sorted files holding 4 billion keys, writing one
   output without holding more than one key per file in memory; a dashboard's top 10 of 400
   million orders. Both are a heap. Predict: for the top 10 of 400 million rows arriving in random
   order, about how many rows actually replace something in the heap?
2. Recap of Chapter 6's picture in one frame: twenty file streams, a heap of cursors beside them,
   the winner popping and re-sifting on every beat — the structure this topic finds inside real
   code, not rebuilt.
3. Pebble's `mergingIter`: one heap of child iterators serves both directions (min-heap forward,
   max-heap reverse); `Next`/`Prev` is pop, advance, "fix" — read word for word from the source.
4. RocksDB's independent `MergingIterator`, same design; the comparator that makes it a *database*
   merge and not a generic one: ties broken by decreasing sequence number, so the newest version of
   a key surfaces first with no special case.
5. A compaction's input iterator, read in `version_set.cc`: one merging iterator built over every
   file of every input level; `CompactionIterator` then drops shadowed (superseded) versions and
   expired tombstones as it advances past them.
6. Predict: is a tree of losers for a number of streams that is not a power of two still a
   complete, perfectly balanced tree? Velox's `TreeOfLosers` constructor and its own 12-stream
   worked example answer it.
7. Two Spark heaps through two different APIs: `UnsafeSorterSpillMerger`'s `PriorityQueue` (never
   enqueuing an empty reader) and `ExternalSorter.mergeSort`'s reversed-comparator max-heap — the
   same pop-then-replace kernel, one straightforward, one inverted to fit a max-heap-only API.
8. Measured, reusing Chapter 6's own lab counts (not redone here): a binary heap costs more
   comparisons per output than a loser tree at the same fan-in, by a measured ratio; three of the
   four engines read here still choose the heap anyway, and the topic says why (adaptivity, no
   separate rebuild step) without claiming the engines are wrong to.
9. The other heap: PostgreSQL's bounded top-N. `make_bounded_heap` reverses the sort direction so
   the *worst* kept tuple sits at the root, the cheap thing to discard; the switch rule itself
   (twice the bound, or `workMem` filled) quoted from the source.
10. Spark's `BoundedPriorityQueue` and `Utils.takeOrdered`: a bounded top-K per partition, shuffled,
    then one more bounded top-K over the small merged result — `RDD.takeOrdered`'s own doc comment
    naming it the opposite of `top`.
11. The arithmetic and the surprise: O(n log N) against a full sort's O(n log n); derived and then
    verified at small scale, the expected number of heap replacements for a bounded heap of size k
    over n random-order rows is k·(Hₙ − H_k) — for k=10, n=400,000,000 that is about 175 rows, out
    of 400 million.
12. Recap and handoff: a heap or loser tree picks the next-ready element among streams; turn the
    streams into tasks and the order into a dependency order, and the same shape becomes a
    scheduler. Topological sort inside schedulers, next.

## Outcomes (from CHAPTER.md, unchanged)

- Point at the heap or tree of losers inside a compaction, a sort spill and a shuffle read, and say
  what its comparator orders by and what it does on ties.
- Explain why a bounded heap keeps the worst kept element at its root, and compute the comparisons
  of top-N against a full sort for a given n and N.
- State the comparisons per output of a heap-based merge and of a tree of losers for the same k,
  and say why an engine might still choose the heap.

## Concept ledger

Introduces: `merging-iterator`, `compaction-input-iterator`, `bounded-top-n-heap`,
`distributed-top-n-merge`.
Uses (all confirmed live in the registry at build time): `binary-heap`, `sift-up-down`
(`dsa.binary-heaps-heapify`), `tournament-tree`, `loser-tree`, `k-way-merge-bound`
(`dsa.tournament-loser-trees`), `memtable`, `sstable`, `tombstone`, `bloom-filter-pruning`,
`fence-pointer` (`dsa.lsm-tree-write-read`), `compaction-policy` (`dsa.lsm-compaction-amplification`),
`external-sort-spill-path`, `sorted-run-merge-operator` (`dsa.sorting-inside-spilling-operators`,
topic 118, confirmed live at build time — see thread coordination note below), `quickselect`
(`dsa.quickselect-median-medians`, topic 58 — live, moved from `declared` since CHAPTER.md wrote
it provisionally before Chapter 16 was built).
Nothing left `declared`: every concept CHAPTER.md listed provisionally is live in the registry at
build time.

## Changes from the chapter plan

1. **Topic 118's registry entry was confirmed directly** with the sibling thread that built it
   (same session window, same repo): `introduces` is exactly
   `['external-sort-spill-path', 'spilling-hash-aggregation', 'sort-merge-join-spill',
   'sorted-run-merge-operator']`, matching CHAPTER.md word for word, and its handoff (this
   topic's bridge) is copied unchanged.
2. **Chapter 6's "256-way merge" lab does not exist.** CHAPTER.md's planning-time assumption
   (written before Chapter 6 was built) named a 256-way heap-vs-loser-tree comparison; the real
   `dsa.tournament-loser-trees` topic measured k=8 (power of two) and k=6 (padded to 8), not 256.
   This topic reuses those real measured counts (heap 4.35 comparisons/output vs loser tree's
   exact log2(8)=3.00 at k=8, a 1.45x ratio) rather than inventing a 256-way number nothing ever
   built, and records the discrepancy here per CHAPTER.md's "Assumption about Chapter 36"-style
   instruction for provisional chapter content.
3. **`compaction_iterator.h`'s shadowed-version drop is read, not quoted.** CHAPTER.md asked for
   this to be "read at research time, not read for this" originally about the deeper compaction
   logic; `NextFromInput()`'s drop logic spans several branches with no single quotable sentence,
   so SOURCES.md states what was read and found rather than a verbatim quote that doesn't exist as
   one sentence.
4. **The replacement-count arithmetic is derived, not simulated at full scale.** 400 million
   row-by-row simulation in Python is impractical; the exact formula k·(Hₙ − H_k) (order statistics
   of a random permutation: position i causes a bounded-heap replacement with probability k/i for
   i>k) is derived, checked by exact Monte Carlo simulation at n=100,000 (average over many random
   permutations matches the formula's prediction within simulation noise), and then evaluated at
   the real n=400,000,000 using the standard asymptotic for the harmonic number (error bounded and
   stated), rather than asserted from memory.
5. **The bridge is topic 118's handoff, copied word for word** (confirmed above, matches
   CHAPTER.md's own provisional text unchanged).
