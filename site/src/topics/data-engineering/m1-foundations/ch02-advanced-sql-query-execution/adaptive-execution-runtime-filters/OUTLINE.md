# Outline: Adaptive execution and runtime filters (`de.adaptive-execution-runtime-filters`)

Syllabus line: "re-optimization at stage boundaries (Spark AQE: coalescing partitions, switching join strategy, splitting skewed partitions), runtime Bloom and min/max filters, dynamic partition pruning (sideways information passing)."

Bridge from topic 25 (parallel-distributed-query-plans): its handoff said the broadcast threshold was already a plan-time decision an engine's adaptive execution could revise mid-query, and that this topic goes further into how far that revising goes.

## Learning outcomes
1. Explain why a distributed query's plan can be redecided mid-run, and name the moment (a stage boundary) where real statistics become available to redecide it.
2. Read Spark's own Initial Plan vs. Final Plan in `explain()` output and say which of AQE's three features (coalesce, switch join strategy, split skew) changed it, and why.
3. Explain what a runtime filter (a Bloom filter or a min/max range) buys a scan that a plan-time filter can't, and what dynamic partition pruning adds on top of a row-level runtime filter.
4. Read a PostgreSQL `EXPLAIN` plan's "Subplans Removed" line and say whether partition pruning happened at planning time or execution time.

## Reel, 15 steps

1. **A plan that changes its own shape while it runs.** `fig`: Spark's own `Initial Plan` (SortMergeJoin) and `Final Plan` (BroadcastHashJoin) for the exact same query, side by side. Moves: draw both plan labels, lock-on the one word that differs (the join operator name). Final frame: two plan trees, same leaves, different join node. Caption: the same query's own plan, decided twice.
2. **Predict: why would a plan decided once need deciding again?** Options: (a) the planner made a mistake the first time; (b) something about the data wasn't knowable until part of the plan had already run; (c) Spark always re-plans every query twice as a safety check. Answer: (b). Wrong-option notes: (a) implies a bug, not a design; (c) is a real-sounding but false mechanism (it's targeted, not universal).
3. **Reveal: re-optimization happens at stage boundaries.** `fig`: a pipeline of stages, a shuffle boundary marked, a "real stats known here" label. AQE's three features (coalesce shuffle partitions, switch join strategy, split skew) all act only once the stage before them has actually run and reported real sizes — never earlier. Takeaway candidate.
4. **Reveal: coalescing shuffle partitions.** `fig`: 200 configured shuffle partitions vs. 1 real one, this topic's own measurement (`spark.range` grouped into 50 tiny groups). Takeaway: "you don't have to guess the right shuffle-partition count; AQE measures the real output and picks it instead."
5. **How a skewed partition gets found and split.** `fig`: a bar chart of per-partition shuffle sizes, one bar far taller than the rest; the rule from Spark's docs (bigger than a factor times the median, and bigger than an absolute threshold) drawn as two gates the tall bar must clear.
6. **Predict: does splitting a skewed partition always run faster?** Options: (a) yes, splitting always helps; (b) only if there's spare capacity to run the split pieces on; (c) no, splitting never changes wall-clock time. Answer: (b).
7. **Reveal: splitting needs spare capacity to pay off.** `fig`: this topic's own measured times — a 2.3x range of inconsistent results on a 4-core sandbox with no idle cores to give the split pieces. The total work is the same either way; only more available workers turn the split into a real wall-clock win. Takeaway: an honest result, not a clean before/after.
8. **Predict: a join's small side turns out small only after another stage finishes — then what?** Options: (a) the join plan stays whatever it was decided at compile time; (b) the join plan can still change, once that stage's real output size is known; (c) the query fails, since the plan can't be changed after compilation. Answer: (b).
9. **Reveal: AQE switches join strategy at runtime.** `fig`: this topic's own measured Initial Plan (SortMergeJoin) → Final Plan (BroadcastHashJoin), because the dimension side's real size — known only once its own aggregation stage finished — fell under the broadcast threshold. Takeaway.
10. **Reveal: a runtime filter built from the small side.** `fig`: the small side's actual key values folded into one compact structure (a Bloom filter, or a min/max range), handed to the big side's own scan before it's even fully read. Spark's own optimizer comment: insert a filter on one side when the other has a selective predicate — a bloom filter is one such filter.
11. **Reveal: dynamic partition pruning.** `fig`: the same idea at the partition level — Trino's dynamic filtering, collecting real join-key values from the build side and pushing them sideways into the probe side's own table scan, skipping whole partitions it proves can't match. This is "sideways information passing": one side of a join passing what it knows sideways, not down a fixed plan tree.
12. **How PostgreSQL prunes partitions at execution time.** `fig`: this topic's own measurement — a parameterized query with pruning on (`Subplans Removed: 3`, 1 partition scanned) vs. off (all 4 scanned), a real ~3.2x faster, 4x fewer buffer reads. Takeaway: the same idea (not yet knowing which partitions matter until a real value shows up) exists on a single machine's own planner, not only across a cluster.
13. **Recap.**
14. **Prove it · 1 of 2.** Given an `Initial Plan: SortMergeJoin` / `Final Plan: BroadcastHashJoin` pair, name which AQE feature did this.
15. **Prove it · 2 of 2.** Given `Subplans Removed: 3` out of 4 partitions, say whether this happened at planning time or at execution time.

## Engagement arc
Hook (step 1, a real measured plan that changed its own join operator) → early predict (step 2, within the first four) → surprising/honest numbers (steps 4, 7, 9, 12) → recap (13) → two closing checks (14–15). Three predicts (2, 6, 8), four takeaway-bearing steps (3 or 4, 7, 9, 12 — pick at least 3 at build time per DESIGN.md's ≥3 rule).

## Post-notes layers
- **Internals:** AQE's actual rule names (`CoalesceShufflePartitions`, `OptimizeSkewedJoin`, the broadcast-conversion rule), and Spark's `InjectRuntimeFilter` source comment in full.
- **Lab:** the exact local[4] configs used for each of the three AQE measurements, and the PostgreSQL `force_generic_plan` trick needed to see execution-time pruning instead of plan-time pruning with a literal substituted in.
- **Production:** why skew-join splitting needs real spare executors to pay off (cluster autoscaling, not just local parallelism); Trino's own stated connector/join-type conditions for dynamic filtering to apply at all.
- **Frontier:** cross-engine runtime filtering pushed all the way into columnar file formats (row-group/stripe pruning), which this topic's Trino quote already names for the Hive connector.
- **Where this goes next:** this chapter has now gone from a single operator (topics 16–22) to a whole plan (23–25) to a plan that keeps revising itself (26). The chapter's next and final arc turns to how the planner decides a plan's shape in the first place when statistics are wrong — cardinality estimation and statistics were already covered (topic 19); what's left is explicitly named in the next syllabus line.

## Concept ledger
- **Introduces:** `adaptive-query-execution`, `runtime-filter`, `dynamic-partition-pruning`.
- **Uses:** `broadcast-threshold`, `exchange-operator`, `partitionwise-join` (topic 25); `cardinality-estimation` (topic 19).
- **Declared:** `sql-select`, `group-by`.

## Claims list (→ FACT-CHECK.md)
1. AQE enabled by default since Spark 3.2.0; three major features since Spark 3.0. [Spark docs]
2. Coalescing post-shuffle partitions avoids needing to tune the shuffle-partition count; measured locally (200 → 1).
3. A partition counts as skewed if it's bigger than a factor times the median partition size, and bigger than an absolute byte threshold; splits (and replicates) it. [Spark docs] + measured locally (plan marker).
4. Splitting a skewed partition's wall-clock benefit depends on spare executor capacity; not shown as a clean win on this 4-core sandbox — an honest, disclosed local limitation.
5. AQE can convert a sort-merge join to a broadcast join once a side's real, post-stage size is known, even when the static plan chose sort-merge. Measured locally (Initial Plan → Final Plan).
6. Spark's own optimizer can inject a runtime filter (an IN-subquery semi join, or a Bloom filter) against the larger side, built from a selective predicate on the smaller side. [Spark source] — not independently measured (needs a more elaborate selectivity setup than this sandbox's simple test data provides).
7. Trino's dynamic filtering collects a min/max-style range of real join-key values from the build side and pushes it to the probe-side scan; for a partitioned source this is dynamic partition pruning. [Trino docs] — not independently measured (no Trino installed; honest gap).
8. PostgreSQL performs partition pruning at execution time, not only planning time, for parameter values unknown at plan time; `EXPLAIN` shows this via "Subplans Removed". [PostgreSQL docs] + measured locally (~3.2x faster, 4x fewer buffer reads).

## Bridge and handoff
- **Bridge:** "Topic 25's broadcast threshold was already a plan-time decision an engine's adaptive execution could revise mid-query. This is how far that goes."
- **Handoff:** set once the next-topic lookup for the chapter's remaining syllabus lines is confirmed (`node scripts/next-topic.mjs de` after this topic ships).

## Progress
- [x] Research, sources fetched and verified, expert list
- [x] examples.py written and verified (`python3 examples.py`)
- [x] OUTLINE.md (this file)
- [ ] FACT-CHECK.md
- [ ] coverage.json
- [ ] reel.tsx / scenes.tsx
- [ ] pre-notes.md / post-notes.md / prerequisites.mdx / references.md / narration.json
- [ ] registry.ts entry
- [ ] checks, content + looks review, ship
