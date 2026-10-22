# Outline, de.parallel-distributed-query-plans

Syllabus line: "exchange operators (gather, repartition/shuffle, broadcast), partition-wise and co-located joins, broadcast thresholds; the plan shape that Spark (§7.2) and cloud warehouses (§6.5) implement."

## Running example
Within one PostgreSQL instance: `pw_orders` (8,000,000 rows) and `pw_customers` (2,000,000 rows), both range-partitioned into 4 matching partitions on `region`, joined on `region AND customer_id` — a case engineered so every matching row pair already lives in the same partition on both sides. `enable_partitionwise_join` toggles whether PostgreSQL exploits that alignment (one combined hash join over an `Append` of everything, vs. 4 independent, smaller hash joins, one per matching partition pair). This is the single-machine version of exactly the same idea a distributed engine (Spark, a cloud warehouse, Trino) faces across *nodes*: if two tables are already partitioned the same way across the same machines, no data has to move before they can be joined; if they aren't, something — a shuffle or a broadcast — has to move it first.

## Steps
1. **Hook — "A join that never crosses a partition boundary"**: PostgreSQL's own partition-wise join, measured directly: at a constrained `work_mem`, letting the planner join matching partitions separately instead of combining everything first avoids a spill and measures about 20% faster (4619.117–4621.824 ms vs. 3497.753–3699.608 ms).
2. **Predict: why would joining matching partitions separately ever beat one big join?** (options: it never does, it's just a different plan shape / each partition's hash table is smaller and can fit memory the combined one can't / fewer rows are scanned overall). Correct: the per-partition hash table is smaller.
3. **Reveal: the plan shape changes** — one `Hash Join` over an `Append` of everything, vs. an `Append` of 4 independent `Hash Join`s, each over just its own matching partition pair. Confirmed directly from this topic's own `EXPLAIN`.
4. **How a partition-wise (co-located) join actually works** — it only applies when the join condition includes every partition key and both sides share the same partition boundaries; when that's true, matching rows are guaranteed to already be in the same partition, so there's nothing to reconcile across partitions.
5. **Reveal: the memory win** — at `work_mem = 16MB`, the one combined hash table (2,000,000 rows) spills; each of the 4 separate hash tables (500,000 rows each) doesn't. Same answer, same hardware, same memory setting — one plan shape needs a spill the other one doesn't.
6. **Predict: take the same idea to a cluster of machines — what has to happen before two tables can be joined if they aren't already split the same way?** (options: nothing, joins always just work / data has to move across the network first / the smaller table is always thrown away). Correct: something has to move data across the network first.
7. **Reveal: exchange operators** — a distributed engine's plan has explicit steps for moving data between nodes before a join or aggregate can run: Trino's own `EXPLAIN` names fragment types `HASH` (repartition/shuffle by a hash function) and `BROADCAST` (send to every node), and shows `RemoteExchange` nodes (`GATHER`, `REPARTITION`) directly in a real plan.
8. **How a shuffle (repartition) exchange works** — hash-redistribute both sides of a join by the join key, so each node ends up holding exactly the rows that could possibly match locally — manufacturing, across a network, the same alignment PostgreSQL's partition-wise join exploits for free when it's already true.
9. **How a broadcast exchange works** — instead of reshuffling both (possibly large) sides, copy the smaller side whole to every node; cheap when that side is genuinely small, since nothing about the larger side has to move at all.
10. **Predict: a table a query was broadcasting grows past the broadcast threshold — what should the engine do?** (options: broadcast it anyway, slower / switch to a shuffle/repartition join instead / fail the query). Correct: switch to a shuffle join.
11. **Reveal: the broadcast threshold is a real switch** — Spark's own `spark.sql.autoBroadcastJoinThreshold` (10 MB by default) decides broadcast vs. shuffle; its adaptive query execution can even make that switch at *run time*, once real sizes are known, converting a planned sort-merge (shuffle) join into a broadcast one.
12. **Co-located joins are partition-wise joins at cluster scale** — when both tables are already partitioned (or bucketed) the same way across the same nodes, the exchange step can be skipped entirely, exactly the condition PostgreSQL's `enable_partitionwise_join` checks for, one level up from a single machine's partitions to a cluster's nodes.
13. **Recap** — four ideas: matching partitions avoid redundant work; a distributed join needs an exchange unless data's already aligned; shuffle redistributes both sides, broadcast copies the small one; the broadcast threshold is a real, sometimes run-time, switch.
14. **Prove it · 1 of 2** — given a plan fragment's exchange type (`HASH` vs. `BROADCAST`), decide whether the engine is repartitioning both sides or copying one side everywhere.
15. **Prove it · 2 of 2** — given a build-side table's size relative to the broadcast threshold, decide whether the planner should broadcast it or fall back to a shuffle join.

## Claims and sources
1. Partition-wise join lets PostgreSQL join matching partitions independently instead of combining everything first, confirmed directly via this topic's own `EXPLAIN` plan-shape change (1 combined hash join → 4 independent ones) — PostgreSQL docs (quoted) + measured directly.
2. The real, measurable payoff at this topic's own schema is a spill avoided under memory pressure (one 2,000,000-row hash table spills at `work_mem=16MB`; four 500,000-row ones don't) — measured directly, with repeated runs: ~20% faster when partition-wise join is on.
3. A distributed engine represents data movement between nodes as explicit exchange operators in its own plan — named `HASH` (repartition/shuffle) and `BROADCAST` fragment types, with `RemoteExchange[GATHER]`/`[REPARTITION]` nodes in a real plan — Trino documentation, quoted.
4. Broadcast joins copy the smaller side of a join to every node instead of redistributing both sides; Spark's default threshold for this choice is 10 MB, configurable, and disable-able — Spark documentation, quoted.
5. The broadcast-vs-shuffle choice isn't fixed at plan time in a modern engine: Spark's adaptive query execution can convert a sort-merge (shuffle) join into a broadcast join once it sees the real runtime size of a join side — Spark documentation, quoted.
6. Partition-wise joins and co-located joins are the same idea at two different scales (one machine's partitions; a cluster's nodes) — this topic's own synthesis, built from PostgreSQL's own partition-wise join requirements (matching partition keys, matching partition bounds) and the exchange-operator mechanism that a shuffle specifically exists to manufacture when that alignment doesn't already hold.

## Honest gaps
- No multi-node Spark, Trino, or cloud-warehouse cluster is installed on this sandbox; a local, single-machine Spark run was considered and deliberately not used, because the entire point of the broadcast-vs-shuffle trade-off is the cost of moving data *across a network between machines* — a single-machine run couldn't demonstrate that cost honestly even if it ran, so claims 3–5 above are sourced from Spark's and Trino's own documentation, not independently measured here, and the reel says so explicitly rather than implying a local reproduction.
- Spark's AQE broadcast-conversion threshold and PostgreSQL's partition-wise join aren't literally the same code path; the topic draws the *conceptual* parallel (both are "can we skip moving data because of an alignment that already holds, or a size that makes one side cheap to duplicate") without claiming they're implemented identically.
- Cloud warehouses (named in the syllabus line, §6.5) are referenced once, by the general pattern they're documented to share with Spark/Trino (a broadcast-vs-shuffle choice, exchange-like plan steps), without picking one specific vendor's implementation to verify in detail.

## Engagement arc
Two main predict/reveal pairs (why partitions help; what has to happen across machines) plus a third (the broadcast threshold switch) and two closing "Prove it" checks — comparable density to topics 21–24.

## Pre-notes terms
Partition-wise join, exchange operator, shuffle (repartition), broadcast, co-located join.

## Bridge / handoff
- Bridge (from topic 24, execution models): "Morsels split the work across the cores of one machine. The same problem — how to split work, and how to move partial results between the pieces doing it — reappears one level up, across machines: exchange operators, repartitioning and the broadcast-vs-shuffle choice, next."
- Handoff: resolved once `scripts/next-topic.mjs` names the next topic after this one ships.
