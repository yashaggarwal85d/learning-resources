## After this topic you can

- Explain why PostgreSQL's partition-wise join can change both a plan's shape (independent per-partition hash joins vs. one combined one) and its real memory footprint, with a measured, not assumed, spill-avoided speedup behind the claim.
- Recognize a distributed engine's exchange operators (`HASH`/repartition, `BROADCAST`) in a real plan, and explain what each one is actually doing to the data.
- State the broadcast-threshold trade-off precisely: cheap when the copied side is genuinely small, expensive once it isn't, with a real configurable number deciding which applies.
- Draw the structural connection between a partition-wise join (one machine's partitions) and a co-located join (a cluster's nodes) — the same "already aligned, nothing to move" condition, one level up.

## Into the internals

### Why partition-wise join defaults to off despite a real measured win

PostgreSQL's own documentation is explicit about the trade-off: turning on partition-wise join can increase the number of plan nodes whose memory is bounded by `work_mem` linearly with the number of partitions, which can mean substantially more total memory consumed, and query planning itself becomes measurably more expensive in CPU and memory. This topic's own measurement shows the mechanism working in its favor (four smaller hash tables fit where one combined one spilled) — but that's a demonstration under deliberately tight memory, not a claim that the setting is a free win in general, which is exactly why the documentation's default is off and why this topic also reports the converged, no-clear-winner result under ordinary default settings rather than only the favorable one.

### Why a local Spark run couldn't honestly test the broadcast/shuffle claim

A single machine (even one running Spark's own distributed execution engine locally) has no network boundary between its "workers" — they're processes on the same box, sharing the same memory bus. The entire reason broadcast and shuffle exist as distinct strategies is the cost of moving data *between physically separate machines*; a local run would make both strategies finish in comparable time, for a reason that has nothing to do with the actual trade-off being taught. This topic's broadcast/shuffle content is sourced directly from Spark's and Trino's own documentation instead, with that limitation stated plainly rather than papered over with a measurement that would have looked real while testing nothing relevant.

### The precise condition partition-wise join checks

PostgreSQL's planner doesn't attempt partition-wise join opportunistically — it requires the join condition to cover every partition key, with matching data types, and (as of the version used by this topic) either exactly matching partition bounds or a one-to-one matching set of child partitions on both sides. This topic's own schema was deliberately constructed to satisfy that condition exactly (both tables partitioned identically on `region`, with `customer_id` values engineered to land in the matching partition), which is why the measured plan-shape change could be shown cleanly rather than inferred.

## In production

- `EXPLAIN`'s own output is the way to check whether a real join in a real system is partition-wise, co-located, broadcast, or shuffled — this topic's own `Hash Join`/`Append` structure (PostgreSQL) and `HASH`/`BROADCAST` fragment types (Trino) are both read directly from each engine's own plan, not inferred from documentation alone.
- Before enabling `enable_partitionwise_join` broadly, check whether the specific joins it would affect actually share partition keys and boundaries — the setting's cost (more plan nodes, more planning time) applies to every join it touches, whether or not that particular join benefits.
- A table or join side that's grown past a broadcast threshold is a common, specific cause of a sudden performance regression in a distributed pipeline — the plan silently switches strategies, and the fix is usually either partitioning/bucketing the data to make a shuffle cheaper, or reducing what's actually being broadcast.
- Cloud warehouses (the syllabus's own §6.5 reference) are documented to implement the same broadcast-vs-shuffle choice and similar exchange-operator plan steps; this topic names that pattern once, without picking a specific vendor's implementation to verify in detail.

## Next

This topic's broadcast threshold was already a plan-time decision an engine's adaptive execution could revise mid-query. Next: how far that goes — adaptive execution and runtime filters more generally, where a plan keeps changing its mind as the query actually runs, not just at the broadcast-vs-shuffle boundary.
