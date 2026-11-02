# Before you watch

- **Shuffle Exchange.** The step that redistributes rows across the cluster by a partitioning
  key, materializing an intermediate result to disk/network before the next stage can read it.
  Where you meet it: every join or `groupBy` on a large table in this chapter so far.
- **SortMergeJoin.** The default strategy for two large, equi-joined tables: sort both shuffled
  sides by the join key, then merge them in one pass. Where you meet it: last topic's own default
  strategy, now the thing AQE can revisit.
- **BroadcastHashJoin.** Send one entire side to every worker and build an in-memory hash table
  from it, skipping a shuffle on that side altogether. Where you meet it: two topics back, as the
  planner's static choice when a side's known size is small enough.
- **Shuffle partitions (`spark.sql.shuffle.partitions`).** The number of partitions a shuffle
  produces, set once per session and otherwise fixed regardless of how much data actually flows
  through it. Where you meet it: this topic's own second example, where 200 is configured but far
  too many for the real data.
- **Query stage.** A subsection of a physical plan bounded by shuffle or broadcast exchanges; each
  stage must finish materializing before the plan above it can run. Where you meet it: the exact
  unit this topic's reoptimization happens around.
- **Cost-based statistics.** Row counts, byte sizes, and other numbers the static planner uses to
  choose a strategy before anything runs, often estimated rather than measured. Where you meet it:
  the thing that's wrong, or simply missing, for a `groupBy`'s own output before it executes.
