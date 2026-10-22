<section data-section="outcomes">

## Outcomes

Separating storage from compute removes storage as a shared bottleneck and simplifies infrastructure management, but it doesn't by itself stop one workload's load from affecting another's — that takes a separate, deliberate decision to assign each workload its own independent compute cluster against the same shared storage. Multi-cluster elastic scaling is scoped to concurrency (more simultaneous queries queuing less); it does not, by the vendor's own account, make a single slow query or a data-loading job run faster. A cache is a deliberate, partial re-coupling of storage and compute, held for the lifetime of the compute cluster that built it — it buys real speed, and pays for it the moment that compute is suspended and the cache is dropped.

</section>

<section data-section="internals">

## Internals: what a warehouse-local cache actually caches

A compute cluster's cache doesn't hold whole query results; it holds the underlying storage layer's own micro-partitions — the compressed, columnar chunks a table is physically broken into — on the compute node's own local disk. A later query that needs the same micro-partitions can read them from that local cache instead of re-fetching them across the network from the separated storage layer, which is what makes the cache a genuine re-coupling: for exactly those cached partitions, compute is temporarily acting as if storage were local again. How those micro-partitions are themselves laid out and pruned is covered in full in Chapter 6's storage internals.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own (`CHAPTER.md`). Every claim traces to a quote from a single cloud warehouse vendor's own documentation (`SOURCES.md`), disclosed as sourced-only since this sandbox has no way to run a real multi-cluster warehouse to measure against.

</section>

<section data-section="production">

## Production failures this topic warns about

**Sharing one compute cluster across workloads with different urgency.** A heavy nightly ETL job and a latency-sensitive customer-facing dashboard, sharing one cluster against the same shared storage, is exactly the noisy-neighbor scenario this topic opens with — and it costs nothing extra in storage to give each its own isolated cluster instead, since the data itself was never duplicated.

**Reaching for more clusters to fix one slow query.** A team that scales up cluster count to speed up a single heavy, slow-running query is spending money against the wrong lever — the vendor's own documentation says plainly that multi-cluster scaling addresses concurrency, not single-query runtime, which needs a differently-sized warehouse instead.

</section>

<section data-section="frontier">

## Frontier

Result caching and query acceleration services sit one layer above the warehouse-local cache covered in this topic: instead of caching a table's own data on a compute node, they cache the output of a specific query, keyed to that query's exact text and the state of the underlying tables at the time it ran. That raises the same staleness question this topic measured for the local cache, but at the level of a whole answer rather than a table's own data — and is an active area where different warehouse vendors make genuinely different tradeoffs.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every benefit here assumed a consistent layering convention for organizing data as it moves through separated storage and compute. Next: medallion architecture, the layering convention lakehouses actually settled on, and its real failure modes.

</section>
