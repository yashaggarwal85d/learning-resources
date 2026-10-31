# Outline

## Scope mapped to steps

1. Hook: a daily mean computed as the average of 24 hourly averages disagrees with the raw mean, because one restart hour had far fewer samples than the rest but counted equally.
2. Reveal: which aggregates merge correctly (min, max, sum, count) and which don't (a quantile) — average is derived, never stored.
3. Predict: whether merging two hourly rollups into a daily one gives the same answer as computing from raw.
4. Reveal: it does, exactly — sum and count merge losslessly; the naive average-of-averages doesn't.
5. Reveal: a continuous aggregate and late data — a reading that arrives after its bucket is materialized forces a recompute of that one bucket.
6. Reveal: the three-tier retention plan's storage arithmetic and query routing, including a range that spans two tiers.
7. Reveal: a spike that a mean rollup hides and a max rollup keeps.
8. Recap.
9. ProveIt.

## The quantile-sketch gap

CHAPTER.md's `uses` line names Chapter 5's `quantile-sketches` and `hyperloglog-distinct-counting` as anchors. As of this topic's build, Chapter 5 only extends through §5.5 in `registry.ts` and neither id exists (verified via `loadDomains()`/`registry.ts` grep before writing this file). This topic does not claim those ids. Instead, `examples.py`'s `SimpleMergeableDigest` demonstrates only the *mergeability property* a quantile sketch needs (`merge(A, B).quantile(p) == digest(A ∪ B).quantile(p)`) using a deliberately simplified, fully-disclosed stand-in (it keeps every value at this lab's small scale, so the merge is exact rather than approximate) — never claiming to be a t-digest, KLL or DataSketches implementation. Sketch internals are explicitly left out per CHAPTER.md ("Leaves out: ... sketch internals (Chapter 5)"). Revisit once Chapter 5's sketch topics ship, the same handling as topic 6's Chapter 10/11 gap.

## What this topic leaves out (per CHAPTER.md)

The compression of the stored points themselves (topic 11); the storage engines' block and compaction structure (topic 13); the choice among TSDB, warehouse and lakehouse (topic 14); sketch internals (Chapter 5, see above); materialized-view maintenance algorithms in general (Chapter 3, built on only); cost per tier in a cloud (Chapter 10).

## Design note: the restart-hour hook

`examples.py` builds a day of synthetic readings where every hour has the same sample count except one restart hour with far fewer, hotter readings. The naive average-of-hourly-averages gives that hour equal weight despite its tiny sample count, pulling the daily figure away from the true, count-weighted mean — this is the same shape as CHAPTER.md's own hook (211.4 vs. 208.9), reproduced with this topic's own synthetic data rather than hand-asserting those exact figures.
