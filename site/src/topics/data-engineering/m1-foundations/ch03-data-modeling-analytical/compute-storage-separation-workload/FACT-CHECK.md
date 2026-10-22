# FACT-CHECK — de.compute-storage-separation-workload

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Storage and compute are architecturally separate, simplifying infrastructure management and performance tuning. | Confirmed | Direct quote (Snowflake architecture docs): "Snowflake separates storage and compute, which simplifies some traditional challenges of data engineering, such as infrastructure management and performance tuning." |
| 2 | Each compute cluster is independent and isolated — one cluster's load has no effect on another's performance. | Confirmed | Direct quote: "Each virtual warehouse is an independent compute cluster that doesn't share compute resources with other virtual warehouses. As a result, each virtual warehouse has no effect on the performance of other virtual warehouses." |
| 3 | Additional compute clusters can be allocated, statically or dynamically, onto the same shared storage, scaling with concurrent load. | Confirmed | Direct quote (multi-cluster docs): "With multi-cluster warehouses, Snowflake supports allocating, either statically or dynamically, additional clusters to make a larger pool of compute resources available" and "As the number of concurrent user sessions and/or queries for the warehouse increases... Snowflake automatically starts additional clusters." |
| 4 | Multi-cluster scaling is scoped to concurrency; it does not, by itself, make one slow query or a data-loading job run faster. | Confirmed | Direct quote: "Multi-cluster warehouses are best utilized for scaling resources to improve concurrency for users/queries. They are not as beneficial for improving the performance of slow-running queries or data loading." A disclosed limit the vendor itself states, not an inferred caveat. |
| 5 | A running compute cluster caches the table data it has touched, for speed, on top of the separated storage layer. | Confirmed | Direct quote (warehouse-considerations docs): "Each warehouse, when running, maintains a cache of table data accessed as queries are processed by the warehouse. This enables improved performance for subsequent queries if they are able to read from the cache instead of from the table(s) in the query." |
| 6 | That cache is dropped when its compute cluster is suspended, and queries after resuming are slower again until the cache rebuilds. | Confirmed | Direct quote: "This cache is dropped when the warehouse is suspended, which might result in slower initial performance for some queries after the warehouse is resumed." |

## Currency

Snowflake's own documentation is a live, maintained reference, re-fetched 2026-10-22. Multi-cluster warehouses and per-cluster local caching are both long-standing, stable architectural features, not recent or experimental ones, so the quoted mechanics are not expected to be stale.

## Red team

**Predict 1 (step 3): does separating storage from compute, by itself, stop one workload's load from affecting another's?**
The plausible wrong answer treats "storage and compute are separate layers" as already meaning "workloads can't interfere with each other." The reveal at step 4 distinguishes these: separating storage from compute only means storage isn't the shared bottleneck anymore — compute itself still has to be deliberately split per workload (one cluster per team) to actually stop contention, which is a second, separate decision on top of the architectural separation.

**Predict 2 (step 6): does adding more compute clusters make a single slow query run faster?**
The plausible wrong answer generalizes "more compute resources" into "any performance problem gets better." The vendor's own documentation explicitly refutes this at step 7: multi-cluster scaling addresses concurrency (many queries queuing), not the runtime of any one query; a single slow query needs a differently-sized warehouse (vertical scaling), not more clusters (horizontal scaling for concurrency) — these are named as two different knobs, not interchangeable ones.

**Predict 3 (step 9): is a cache just an optimization with no real cost, since it only ever makes things faster?**
The plausible wrong answer treats caching as a pure win with no downside worth naming. Step 11 measures the direct, vendor-stated cost: a cache is tied to its compute cluster's own lifetime, and suspending compute (the exact lever teams pull to save money) throws the cache away, trading a cost-saving action for a real, temporary performance regression — the cache is a deliberate re-coupling of storage and compute done for speed, which is exactly why it isn't free.

No claim required inferring beyond what is directly quoted in the fetched Snowflake pages; this topic has no lab of its own (`CHAPTER.md`), so no measured claim requires separate verification against a sandbox run.
