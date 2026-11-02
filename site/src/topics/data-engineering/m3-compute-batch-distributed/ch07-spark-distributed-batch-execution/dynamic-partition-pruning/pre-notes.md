# Before you watch

- **Star join.** A fact table joined to one or more much smaller dimension tables, each on a
  key the fact table is often partitioned by. Where you meet it: the shape this entire topic's
  worked example is built around.
- **Partitioned table.** A table stored as separate files per distinct value of a chosen
  column, so a query can skip whole files by skipping whole partitions. Where you meet it: the
  fact table's own storage layout, and the first of this topic's two preconditions.
- **BroadcastHashJoin.** Sending one entire side of a join to every worker and building an
  in-memory hash table from it, instead of shuffling both sides. Where you meet it: two topics
  back as the planner's static choice; here, as the second of this topic's two preconditions.
- **`EXPLAIN FORMATTED`.** A plan-printing mode that separates a query's main operator tree from
  a dedicated `Subqueries` section listing anything planned and run independently of that main
  tree. Where you meet it: the exact place this topic's own mechanism becomes visible.
- **Broadcast reuse.** Using the same already-computed broadcast result for two different
  purposes within one query, instead of computing it twice. Where you meet it: this topic's own
  central mechanism — the dimension side's broadcast, reused as a pruning filter.
