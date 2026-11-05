# OUTLINE: External merge sort

A full topic, about 15 minutes. Seventh and last topic of Chapter 15, hosting the
chapter's external-memory lab. Every count below is computed and asserted directly in
`examples.py`, against `CHAPTER.md`'s own planning values.

## Storyboard

1. **Hook.** A file ten times the size of memory cannot be loaded, so no sort in this
   chapter applies as written. Sorting it still costs only a few passes: with 16 runs
   and memory for thousands of buffers, one merge pass finishes it, and every byte is
   read twice and written twice in total.
2. **Predict.** Halve the memory and keep the file the same: do the merge passes
   double? (Usually not at all — the count is a logarithm in base M/B, so it only
   changes when memory crosses a threshold; measured directly on a table of M against
   passes.)
3. **Simple run generation.** Pass 0: read M items, sort them in memory, write a run of
   M. N/M runs, each run a tight in-memory sort from earlier in this chapter. Measured
   directly: 1,000,000 keys at M = 4,000 give exactly 250 runs.
4. **Replacement selection, the snowplow.** Knuth's name: keep M items in a heap,
   repeatedly output the smallest key not smaller than the last key written to the
   current run, replace it with the next input item, and hold back anything too small
   for the current run into the next run's heap. Measured directly: 200,000 random keys
   at M = 1,000 give interior runs averaging almost exactly 2M (the first and last runs
   excluded, since each is boundary-truncated).
5. **Replacement selection on ordered input.** The same heap adapts to order: 10,000
   already-sorted keys at M = 100 give exactly one run; 10,000 reverse-sorted keys at
   M = 100 give exactly 100 runs of 100 — no better than the simple method, since every
   new key is always too small for the current run. *Takeaway:* "Replacement selection
   halves the runs on random input by writing more than M items per run, and adapts
   fully to order on the best and worst input — it never does worse than the simple
   method."
6. **Multi-way merge and the loser tree.** Pass 1 onward merges up to k runs at a time;
   the merge keeps the next key of each run in a tournament. Chapter 6 topic 31's loser
   tree gives ⌈lg k⌉ comparisons per output item — used here, not rebuilt — so a large
   fan-in costs little CPU. Measured directly: a 16,383-way fan-in costs 14 comparisons
   per output item.
7. **The fan-in limit.** Fan-in is bounded by block buffers, one per input run plus one
   for output: k ≤ M/B − 1. Larger k means smaller buffers and, on a disk, more seeks per
   item — named, with the measurement left to Data Engineering's reel and the lab. The
   in-memory alternative, DuckDB's own cascade (two-way) merge, is the contrast: the
   post's own words, K-way merge for external sorting because it minimizes I/O, cascade
   merge for in-memory sorting because it is more efficient.
8. **Pass count on the running example.** N = 2²⁷ keys, M = 2²³, B = 512: N/M = 16 runs,
   fan-in up to 16,383, so one merge pass. Measured directly: 1,048,576 block transfers
   in all (run generation plus one merge pass, read and write each) against 262,144 for
   a single scan — four times a scan.
9. **A small instance, worked.** 16 runs, three different fan-ins: 2, 4 and 16 give 4, 2
   and 1 merge passes — computed directly, showing the logarithm's base changing the
   pass count exactly as the formula predicts.
10. **The threshold table.** Holding N and B fixed and halving M six times: the pass
    count stays at 1 for five steps, then jumps to 2 only once fan-in drops below the
    run count. *Takeaway:* "The pass count is a logarithm, not a line — memory can shrink
    by a lot before the number of passes actually changes."
11. **The I/O sort bound.** The total block-transfer cost, 2(N/B)(1 + ⌈log_{M/B}(N/M)⌉),
    is the Aggarwal–Vitter sort bound Θ((N/B) log_{M/B}(N/B)) of Chapter 1 topic 8,
    realized by an actual algorithm — this topic names that the bound is met and that the
    matching lower bound belongs to Chapter 1 topic 8 and Chapter 31, not re-derived here.
12. **Where this runs for real.** A query engine's sort operator, a sort-merge join and a
    spilling aggregation all generate runs and merge them the same way. DuckDB's own
    buffer manager spills by unloading blocks and swizzling pointers to the heap blocks
    during the merge — one sentence, named, not reimplemented. Spark's shuffle merges and
    LSM compaction (Chapter 5) run the identical k-way merge; the Data Engineering reel
    `de.external-merge-sort-k` covers the engine-side detail by name, not repeated here.
13. **Recap and handoff.** A file ten times the size of memory is sorted at the cost of a
    handful of passes over the disk, and the price is worth paying because of what a
    sorted sequence makes cheap: finding one key in a million takes about twenty steps if
    the keys are in order, and a million if they are not. Binary search invariants and
    boundaries, next.

## Why no compiled benchmark

Every number here — run counts, run lengths, fan-in, pass counts, block transfers — is a
small, deterministic (or seeded-random) computation checked directly in Python against
the exact structures being taught; nothing claims a wall-clock figure. `CHAPTER.md`'s own
compiled, on-disk lab (sorting a real file ten times larger than an enforced memory
limit) is the post-notes lab, out of this file's scope.

## Changes from the chapter plan

- `CHAPTER.md`'s own planning simulation (2.0 M over 200,000 random keys with M = 1,000,
  first and last runs excluded) is reproduced on this topic's own seed; the exact average
  is asserted to round to 2.0 × M, matching the planning value rather than a tighter
  figure, since replacement selection's run length is itself a random variable.
- Knuth, *TAOCP* vol. 3 §5.4.1 (the snowplow name and the 2M derivation) stays **not
  opened** per `CHAPTER.md`'s own framing; Vitter's book is the primary source actually
  quoted for the 2M claim (see `SOURCES.md`).
- Graefe 2006, Aggarwal & Vitter's original 1988 paper, and Sedgewick & Wayne §2.2 / CLRS
  stay citation-only; no claim here rests on any of them (see `SOURCES.md`'s Red team).
- PostgreSQL's `work_mem` documentation is cited only for its stated role (the memory
  budget before a sort spills to disk), not for PostgreSQL's specific run-generation or
  merge algorithm, which the current manual does not describe in that detail.
