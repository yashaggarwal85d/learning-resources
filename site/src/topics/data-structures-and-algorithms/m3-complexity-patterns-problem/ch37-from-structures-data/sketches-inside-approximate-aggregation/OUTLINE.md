# Outline — Sketches inside approximate aggregation

## Concept ledger

- **Introduces:** `mergeable-partial-aggregate`, `sketch-merge-law`, `sketch-as-value`, `range-boundary-sampling`.
- **Uses:** `bounded-top-n-heap`, `distributed-top-n-merge` (topic 119, held: top-N per partition then one merge is the same shape), `fixed-slot-table`, `token-ring-partitioning` (topic 123, held: the same stream partitioned), `bloom-filter` (Chapter 12, live), `bloom-filter-pushdown` (topic 117, held: a Bloom filter is also mergeable by OR if built with equal parameters, said once).
- **Declared** (Chapters 29, 30, Chapter 32 topic 106, all planned, ids provisional): `hyperloglog`, `quantile-sketch`, `count-min-sketch`, `heavy-hitters-summary`, `reservoir-sampling`, `map-reduce-combiner`. Checked against the registry at build time: `dsa.reservoir-sampling` (held) introduces `reservoir-sampling` exactly, so that id moves to `uses`. `de.hyperloglog-distinct-counting` (live) introduces `hyperloglog-distinct-counting`, not `hyperloglog`; `de.quantile-sketches-t-digest` (live) introduces `quantile-sketches`, not `quantile-sketch`; both ids differ from the plan's provisional spelling, so this topic's `uses` cites the registry's own ids instead of the plan's guesses. No live or held topic introduces `count-min-sketch`, `heavy-hitters-summary` or `map-reduce-combiner`, so those stay `declared`.

## Storyboard (14 steps)

1. **Hook / predict 1.** Eight partitions report their own median order amount (illustrative values replaced by the builder's measured ones). Their plain average is far from the true median. Predict: does the true median sit near that average, or inside the range the seven ordinary partitions already show?
2. **PostgreSQL's own definition.** Partial aggregation: run the transition function over subsets, combine the partial states. Quote the exact combine-function passage. MAX/MIN combine by the same comparison; SUM combines by addition; row-order-sensitive aggregates have no combine function at all.
3. **The merge law, stated once.** A sketch is the same contract, for a question whose exact state is not small: two partial sketches must combine into what a single pass would have produced, exactly or within a stated error.
4. **HyperLogLog: the register array.** Spark's `approx_count_distinct`, "estimated cardinality by HyperLogLog++", `relativeSD` default. BigQuery's `HLL_COUNT.INIT`/`MERGE`/`MERGE_PARTIAL`/`EXTRACT`: the sketch travels as a value. The register array and why merging is element-wise maximum.
5. **Predict 2.** Two partitions' distinct-customer estimates, summed — right or wrong?
6. **Measured: the wrong sum, the exact OR.** The merged HLL registers equal the single-pass registers exactly; the naive sum of per-partition estimates over-counts because customers repeat across partitions.
7. **Quantile sketches: KLL, Spark's `percentile_approx` accuracy default, `kll_sketch_agg` default k.** Druid's DataSketches: Theta, Tuple, Quantiles, KLL, HLL, all "approximate streaming mergeable algorithms."
8. **Measured: averaging medians is wrong.** The naive average of the eight partitions' own medians versus the true median versus a merged, weighted sample's median.
9. **Where the weighting comes from.** Spark's `RangePartitioner.sketch`: reservoir sampling per partition, a weight of total-rows-over-sample-size per candidate — the same weighting this topic's own merged quantile sketch used in step 8.
10. **Measured: sampled range boundaries.** The same weighted-sample machinery, now choosing partition boundaries for a downstream repartition, checked against the true quartiles.
11. **Named once: a Bloom filter is also mergeable, by OR**, when built with equal parameters — the same filter topic 117 pushes to a probe side, now merged across two partitions' own filters.
12. **Where the sketch travels.** Map-side partial sketch, shuffle as bytes, final merge — the shape every mergeable summary in this topic shares, and the same shape as topic 119's distributed top-N merge.
13. **Recap / takeaways.**
14. **Handoff** to Chapter 38, "Implement once from scratch."

## Takeaways (>= 3, <= 20 words each)

- A sketch is mergeable exactly when its state is small and its combine function is correct, not merely convenient.
- Averaging per-partition medians, or summing per-partition distinct counts, is wrong even when every partition is exact.
- HyperLogLog's registers merge by element-wise maximum, exactly; a quantile sketch merges only within a stated error.

## Predict steps and answers

- Step 1: the true median sits inside the seven ordinary partitions' own range; the tiny, skewed eighth partition barely moves it, since the average weighs every partition equally regardless of size.
- Step 5: summing is wrong. The same customer can order in more than one partition, so the sum of per-partition distinct counts double-counts every customer who appears in more than one.

## Changes from the chapter plan

1. The chapter plan's provisional declared ids (`hyperloglog`, `quantile-sketch`) do not match the live registry's actual ids (`hyperloglog-distinct-counting`, `quantile-sketches`); this topic's `uses` list cites the registry's own ids, as the plan's own instruction requires, and the ledger above records the mismatch explicitly.
2. No source read at planning or research time describes t-digest or DDSketch usage inside any named product; this topic makes no such claim, matching the plan's own restriction.
3. The partitioned stream's exact sizes (six thousand rows in seven ordinary partitions, sixty rows in one small, skewed partition) are this topic's own chosen values for the chapter's shared running example, not read from any source, matching CHAPTER.md's instruction that each topic computes and asserts its own planning values.
4. `node scripts/check-all.mjs --only reels` bundles a fixed, topic-independent `test:editor` check alongside the topic's own reel smoke test in this cloud sandbox; it fails here exactly as it does on a clean, unmodified `main` ("a save did not open a new GitHub issue"), a pre-existing environment issue other threads have independently confirmed, not a regression this topic introduced. The reel smoke test itself passed at both sizes.
