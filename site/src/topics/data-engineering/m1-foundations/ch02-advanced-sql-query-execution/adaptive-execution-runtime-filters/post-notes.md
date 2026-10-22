## After this topic you can

- Explain why a distributed plan can still change after it starts running: a shuffle stage boundary is the moment real statistics become available to replan with.
- Read a Spark `explain()` output's `Initial Plan` vs. `Final Plan` and name which of AQE's three features (coalescing, join-strategy switching, skew-splitting) caused the difference.
- Distinguish a row-level runtime filter (a Bloom filter, built from one join side and applied to the other's scan) from dynamic partition pruning (the same idea applied at partition granularity), and explain what "sideways information passing" means precisely.
- Read a PostgreSQL `EXPLAIN` plan's `Subplans Removed` property and say whether partition pruning happened at planning time or execution time.

## Into the internals

### AQE's actual rule names

Spark's adaptive query execution isn't one monolithic feature; it's three separate optimizer rules, each gated by its own config flag and each acting independently once a shuffle stage's map output statistics are available: `CoalesceShufflePartitions` (gated by `spark.sql.adaptive.coalescePartitions.enabled`), `OptimizeSkewedJoin` (gated by `spark.sql.adaptive.skewJoin.enabled`), and a join-selection rule that reconsiders broadcast eligibility once a side's real post-shuffle size is known. This topic measured all three independently, with each one's own config turned off to isolate it from the other two.

### The `force_generic_plan` trick

PostgreSQL's own `PREPARE`/`EXECUTE` machinery normally substitutes a literal value into a *custom* plan for the first several executions of a prepared statement — which means the planner already knows the exact value and prunes at plan time, exactly as it would for an ordinary literal query. To actually observe execution-time pruning (the thing this topic measures), the parameter has to stay a genuine unknown at plan time, which this topic forced with `SET plan_cache_mode = force_generic_plan`. Without that setting, the same query would still show `Subplans Removed`, but for the wrong reason — plan-time pruning of a plan built with a literal, not execution-time pruning of a plan built around `$1`.

### Why skew-splitting needs spare capacity to pay off

Splitting one oversized task into several smaller ones doesn't reduce the total amount of work; it only changes how that work is divided among the workers available to run it. On a machine (or a cluster) with no idle capacity beyond what the un-split task would have needed, the split pieces simply queue up behind each other on the same limited set of cores, and wall-clock time doesn't improve — exactly what this topic's own 4-core measurement showed. The benefit shows up specifically when there are more free executor slots than straggler partitions, which is the normal case on an elastically-scaled cluster but wasn't the case on this sandbox.

### Why a local run couldn't test dynamic partition pruning's own benefit

Dynamic partition pruning's payoff is avoiding work across a cluster: skipping partitions a worker would otherwise have had to read from remote storage over the network, or skipping whole splits a coordinator would otherwise have had to enumerate and schedule. Like topic 25's broadcast-vs-shuffle network cost, that's a claim about *between-machine* cost, not something a single process can honestly demonstrate by running locally — so this topic's dynamic-partition-pruning and Bloom-filter claims are sourced directly to Trino's and Spark's own documentation and source code, stated as such, rather than faked with a misleading local repro.

## In production

- Splitting a skewed partition is a real plan change you can see in `EXPLAIN`/`explain()` output directly (`SortMergeJoin(skew=true)`, `AQEShuffleRead skewed` in Spark); whether it actually helps wall-clock time depends on whether the cluster has spare executor capacity at that moment, which autoscaling is specifically meant to provide.
- Trino's own documentation lists real preconditions for dynamic filtering to apply at all: planner support for the specific join type and condition, connector support for pushing a filter into the scan, and the build side's actual size — any one of those failing means no dynamic filter, however the query is written.
- A sudden performance regression after a dimension table grows can be the broadcast threshold being crossed (topic 25) or it can be dynamic filtering/partition pruning no longer kicking in because the build side got too large to filter efficiently from — both are real, config-driven cliffs worth checking for by name.
- File-format-level pruning (row-group statistics in Parquet, stripe statistics in ORC) is the same idea pushed one level further: Trino's own quoted text names this explicitly for the Hive connector pushing dynamic filters "into ORC and Parquet readers to perform stripe or row-group pruning."

## Next

This chapter has gone from a single operator (topics 16-22) to a whole distributed plan (23-25) to a plan that keeps revising itself as it runs (this topic). What's left in this chapter's own syllabus is confirmed by re-running `node scripts/next-topic.mjs de` once this topic is live.
