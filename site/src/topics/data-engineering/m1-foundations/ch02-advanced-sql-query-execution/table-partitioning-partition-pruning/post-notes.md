## After this topic you can

- Choose a partitioning method (range, list, or hash) based on the predicates queries actually use and the needs of a retention policy.
- Distinguish plan-time partition pruning from run-time pruning, and recognize the two different signals each one leaves in `EXPLAIN` — a partition simply missing from the plan, versus `Subplans Removed`.
- Explain why dropping a partition is dramatically faster than a bulk `DELETE` for retention, and why having too many partitions carries a real planning-time and memory cost even when most of them get pruned.
- Contrast PostgreSQL's physical table partitioning with a warehouse's logical clustering, and explain why they solve a similar problem with different mechanisms.

## Into the internals

### Constraint exclusion vs. partition pruning

PostgreSQL's own documentation distinguishes these as two different mechanisms: constraint exclusion is the older technique, used with legacy table inheritance, that proves a child table's own `CHECK` constraint rules it out at planning time only. Partition pruning is the newer mechanism for declarative partitioning, and unlike constraint exclusion, it can act at both planning time and execution time — exactly the plan-time/run-time distinction this topic measures directly. The two are related in spirit but are not the same feature, and only partition pruning gets the run-time case this topic's own `Subplans Removed: 59` measurement shows.

### The exact moments run-time pruning can happen

PostgreSQL's own documentation describes run-time pruning as happening at two distinct points during execution, not just one: once during the initial startup of the plan, before any rows are fetched, and again — for certain plan types — as execution actually proceeds row by row. This topic's own measurement, via a forced generic plan with a genuinely unresolved parameter, captures the startup case; the finer distinction between the two run-time moments is in the documentation for anyone who needs to reason about a parameter that only becomes known mid-execution.

## In production

- PostgreSQL's own documentation gives a concrete rule of thumb: partitioning only pays off once a table would otherwise exceed the amount of memory the database server has available. A table that comfortably fits in memory rarely benefits from the added planning and metadata overhead this topic measures directly.
- The same documentation states that the planner can generally handle partition hierarchies with up to a few thousand partitions reasonably well, provided most queries only need to access a small number of them after pruning — this topic's own ~36x/~198x overhead measurement is exactly the cost that scales with partition count, whether or not pruning ends up helping a specific query.
- A retention policy designed around `DROP TABLE` or `DETACH PARTITION` needs its partition key chosen so that "the data to retire" and "a clean set of whole partitions" are the same thing — a key that does not line up with the retention boundary turns every cleanup back into the slower, VACUUM-needing bulk `DELETE` this topic measures as the alternative.

## Next

This chapter's own next topic is zone maps and BRIN indexes, confirmed via `node scripts/next-topic.mjs de` once this topic is live.
