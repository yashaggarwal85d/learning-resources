## Amazon ElastiCache — "Caching strategies for Memcached"

URL: https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html
Version: AWS documentation, fetched 2026-10-30

> Whenever your application requests data, it first makes the request to the ElastiCache cache. If the data exists in the cache and is current, ElastiCache returns the data to your application. If the data doesn't exist in the cache or has expired, your application requests the data from your data store. Your data store then returns the data to your application. Your application next writes the data received from the store to the cache.

> If data is written to the cache only when there is a cache miss, data in the cache can become stale. This result occurs because there are no updates to the cache when data is changed in the database.

Used for: AWS's own name and mechanics for cache-aside ("lazy loading" in their own terminology)
and its own stated staleness risk — the application, not the cache, owns the read-miss path.

## Oracle — Coherence Documentation, "Caching Data Sources"

URL: https://docs.oracle.com/en/middleware/standalone/coherence/14.1.1.2206/develop-applications/caching-data-sources.html
Version: Coherence 14.1.1 documentation, fetched 2026-10-30

> When an application asks the cache for an entry, for example the key X, and X is not in the cache, Coherence automatically delegates to the CacheStore and asks it to load X from the underlying data source. If X exists in the data source, the CacheStore loads it, returns it to Coherence, then Coherence places it in the cache for future use and finally returns X to the application code that requested it. This is called Read-Through caching.

> In this case, when the application updates a piece of data in the cache (that is, calls put(...) to change a cache entry,) the operation does not complete (that is, the put does not return) until Coherence has gone through the cache store and successfully stored the data to the underlying data source. This does not improve write performance at all, since you are still dealing with the latency of the write to the data source.

> In the Write-Behind scenario, modified cache entries are asynchronously written to the data source after a configured delay, whether after 10 seconds, 20 minutes, a day, a week or even longer.

> Because write-behind effectively makes the cache the system-of-record (until the write-behind queue has been written to disk), business regulations must allow cluster-durable (rather than disk-durable) storage of data and transactions.

Used for: a real cache product's own precise definitions of read-through (the cache itself, not
the application, owns the miss path), write-through (a write doesn't return until the backing
store is updated, which is its own named cost), and write-behind (a write returns immediately, and
the real risk this topic names: the cache is the system-of-record until the queued write actually
lands, so a failure before that can lose it).

## Caffeine — Efficiency (project wiki)

URL: https://raw.githubusercontent.com/wiki/ben-manes/caffeine/Efficiency.md
Version: Caffeine project wiki, fetched 2026-10-30

> Caffeine uses the `Window TinyLfu` policy due to its high hit rate and low memory footprint.

> [W-TinyLfu][wtlfu-code] uses a small admission `LRU` that evicts to a large `Segmented LRU` if accepted by the `TinyLfu` admission policy. `TinyLfu` relies on a frequency sketch to probabilistically estimate the historic usage of an entry. The window allows the policy to have a high hit rate when entries exhibit recency bursts which would otherwise be rejected.

Used for: Caffeine's own description of W-TinyLFU as a combined admission-plus-eviction policy —
an admission filter (TinyLFU's own frequency sketch) deciding what's even allowed to compete for
space, on top of eviction (the Segmented LRU) deciding what to remove once it is — the topic's own
citation for why admission matters as much as eviction.
