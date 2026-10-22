# OUTLINE — de.compute-storage-separation-workload

## Learning outcomes

1. Explain what elastic stateless compute over shared storage actually buys over a coupled architecture.
2. Assign isolated per-workload compute to avoid noisy-neighbor contention.
3. Explain why a cache is a deliberate, partial re-coupling of storage and compute, done for speed, and what it costs when it goes stale.

Running thread: separating storage from compute buys isolation and elasticity, but a cache is a deliberate exception to that separation, reached for on purpose, that pays for speed with staleness risk.

## Steps and storyboard (13 steps)

1. **Hook.** Two teams share one compute cluster against one shared storage layer. One team's heavy batch job starts running. What happens to the other team's quick dashboard queries?
2. **Reveal: the separated architecture, quoted directly.** Storage and compute are architecturally separate, simplifying infrastructure management and performance tuning.
3. **Predict (index 2): does separating storage from compute, by itself, stop one workload's load from affecting another's?** Wrong: yes, separation alone isolates workloads. Right: no — compute itself still has to be split per workload.
4. **Reveal: independent compute clusters, quoted directly.** Each compute cluster is independent and doesn't share compute resources with other clusters — one cluster's load has no effect on another's performance.
5. **Reveal: elastic scaling, quoted directly.** Additional compute clusters can be allocated, statically or dynamically, onto the same shared storage, in response to concurrent load.
6. **Predict: does adding more compute clusters make a single slow query run faster?** Wrong: yes, more compute always speeds up any query. Right: no — it's scoped to concurrency, not to one query's own speed.
7. **Reveal: the vendor's own disclosed limit, quoted directly.** More clusters help many simultaneous queries queue less; they don't make one slow or heavy query itself run faster. **Takeaway.**
8. **Reveal: the noisy-neighbor fix, assembled.** Isolating each workload (ETL, BI, ad hoc) onto its own compute cluster against the same shared storage removes the step-1 scenario entirely — nothing to contend over, because nothing is shared except the data. **Takeaway.**
9. **Predict: is a cache just an optimization with no real cost, since it only ever makes things faster?** Wrong: yes, a cache has no downside worth naming. Right: no — a cache is a re-coupling of storage and compute, done on purpose, and it can go stale.
10. **Reveal: the cache, quoted directly.** A running compute cluster maintains a cache of the table data it's touched, so later queries can skip rereading the separated storage layer.
11. **Reveal: the cache's real cost, quoted directly.** Suspending that compute cluster drops its cache entirely — the next queries after resuming are slower again until the cache rebuilds. **Takeaway.**
12. **Recap.**
13. **Prove it.** A team wants to save money by aggressively auto-suspending its compute cluster the moment it's idle. What does that decision actually trade away?

## Engagement arc

- Hook: step 1.
- First predict: step 3 (index 2).
- Three predicts: steps 3, 6, 9.
- Surprising count: step 7 (scaling is scoped to concurrency, not to a single query's speed).
- Takeaways: steps 7, 8, 11.
- Recap: step 12.

## Post-notes headings

- **Outcomes.**
- **Internals:** how a virtual warehouse's local cache is actually implemented (a cache of remote storage's own micro-partitions on the compute node's local SSD) — pointer to Chapter 6's storage internals, deferred there.
- **Lab:** none of this topic's own (`CHAPTER.md`).
- **Production:** the real failure — one team's heavy batch job sharing a compute cluster with another team's latency-sensitive dashboard, when isolating them onto separate clusters against the same storage would have cost nothing extra in storage and removed the contention entirely.
- **Frontier:** result caching and query acceleration services sit one layer above the warehouse-local cache covered here, caching whole query results rather than table data, and raise the same staleness question at a different layer.
- **Where this goes next:** topic 19, medallion architecture — the layering convention lakehouses actually settled on for organizing data as it moves through this separated storage and compute, and its real failure modes.

## Bridge and handoff (from CHAPTER.md)

- Bridge: "This billing model is exactly what made separating storage from compute economically attractive in the first place. This topic is compute-storage separation itself, the architectural consequence of that economics."
- Handoff: "Every benefit here assumed a consistent layering convention for organizing data as it moves through separated storage and compute. Next: medallion architecture, the layering convention lakehouses actually settled on, and its real failure modes."

## Concept ledger

- Introduces: `compute-storage-separation`, `noisy-neighbor-isolation`.
- Uses: `object-storage-billing-model`, `warehouse-lake-lakehouse-history`.
- Declared: basic familiarity with cloud compute.

## Claims list

1. Storage and compute are architecturally separate, simplifying infrastructure management and performance tuning. Source: Snowflake architecture docs.
2. Each compute cluster ("virtual warehouse") is independent and isolated — one cluster's load has no effect on another's performance. Source: Snowflake architecture docs.
3. Additional compute clusters can be allocated, statically or dynamically, onto the same shared storage, scaling with concurrent load. Source: Snowflake multi-cluster warehouse docs.
4. Multi-cluster scaling is scoped to concurrency; it is not beneficial for making one slow query, or data loading, run faster by itself. Source: Snowflake multi-cluster warehouse docs.
5. A running compute cluster caches the table data it has touched, for speed, on top of the separated storage layer. Source: Snowflake warehouse-considerations docs.
6. That cache is dropped when its compute cluster is suspended, and queries after resuming are slower again until the cache rebuilds. Source: Snowflake warehouse-considerations docs.
