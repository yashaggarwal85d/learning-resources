# Sources — de.compute-storage-separation-workload

This topic has no lab of its own (`CHAPTER.md`). Its sources are a single cloud warehouse
vendor's own documentation, disclosed as sourced-only per CHAPTER.md's instruction, since this
sandbox has no way to run a real multi-cluster warehouse to measure against.

## Snowflake, "Snowflake key concepts and architecture"

URL: https://docs.snowflake.com/en/user-guide/intro-key-concepts
Fetched: 2026-10-22.

Quotes:
> Each virtual warehouse is an independent compute cluster that doesn't share compute resources with other virtual warehouses. As a result, each virtual warehouse has no effect on the performance of other virtual warehouses.

> Snowflake separates storage and compute, which simplifies some traditional challenges of data engineering, such as infrastructure management and performance tuning.

Items: (1) storage and compute are architecturally separate; (2) each compute cluster ("virtual warehouse") is independent and isolated from every other one, so load on one has no effect on another's performance — the direct mechanism behind noisy-neighbor isolation.

## Snowflake, "Multi-cluster warehouses"

URL: https://docs.snowflake.com/en/user-guide/warehouses-multicluster
Fetched: 2026-10-22.

Quotes:
> With multi-cluster warehouses, Snowflake supports allocating, either statically or dynamically, additional clusters to make a larger pool of compute resources available.

> As the number of concurrent user sessions and/or queries for the warehouse increases, and queries start to queue due to insufficient resources, Snowflake automatically starts additional clusters, up to the maximum number defined for the warehouse.

> Multi-cluster warehouses are best utilized for scaling resources to improve concurrency for users/queries. They are not as beneficial for improving the performance of slow-running queries or data loading.

Items: (1) additional compute clusters can be added, statically or dynamically, to the same shared pool of compute, without touching storage at all; (2) this elasticity is automatic in response to concurrency (more simultaneous queries), not in response to any one query being slow; (3) the vendor's own documentation explicitly scopes this benefit to concurrency, not to making a single slow query faster — a deliberately disclosed limit on the claim, not a universal "more clusters is always better."

## Snowflake, "Warehouse considerations"

URL: https://docs.snowflake.com/en/user-guide/warehouses-considerations
Fetched: 2026-10-22.

Quotes:
> Each warehouse, when running, maintains a cache of table data accessed as queries are processed by the warehouse. This enables improved
performance for subsequent queries if they are able to read from the cache instead of from the table(s) in the query.

> This cache is dropped when the warehouse is suspended, which might result in slower initial performance for some queries after the warehouse
is resumed.

Items: (1) a running compute cluster caches table data locally, for speed, on top of the separated storage layer underneath it; (2) that cache is tied to the compute cluster's own lifetime — suspending compute drops the cache entirely, and performance is worse again until it rebuilds, a direct, named cost of caching going stale.
