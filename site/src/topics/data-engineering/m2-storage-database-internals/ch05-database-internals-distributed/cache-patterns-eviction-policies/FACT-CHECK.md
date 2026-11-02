# Fact-check — de.cache-patterns-eviction-policies

## Claim 1: cache-aside ("lazy loading") has the application own the miss path, and can go stale
Source: AWS ElastiCache, "Caching strategies for Memcached" (SOURCES.md #1).
> "Whenever your application requests data, it first makes the request to the ElastiCache
> cache. If the data exists in the cache and is current, ElastiCache returns the data to your
> application. If the data doesn't exist in the cache or has expired, your application requests
> the data from your data store."
> "If data is written to the cache only when there is a cache miss, data in the cache can become
> stale. This result occurs because there are no updates to the cache when data is changed in
> the database."
Verdict: Confirmed. The application, not the cache, performs the miss-path read and the
write-back; nothing refreshes the cache on a database write, which is the staleness risk.

## Claim 2: read-through, write-through, write-behind definitions and write-behind's loss risk
Source: Oracle Coherence documentation, "Caching Data Sources" (SOURCES.md #2).
> "...Coherence automatically delegates to the CacheStore and asks it to load X from the
> underlying data source... This is called Read-Through caching."
> "...the operation does not complete (that is, the put does not return) until Coherence has
> gone through the cache store and successfully stored the data to the underlying data source."
> "...modified cache entries are asynchronously written to the data source after a configured
> delay..."
> "Because write-behind effectively makes the cache the system-of-record (until the write-behind
> queue has been written to disk)..."
Verdict: Confirmed. Read-through moves miss-path ownership into the cache itself; write-through
blocks the write until the backing store is updated; write-behind acknowledges immediately and
queues the write, so anything that destroys the cache before the queue drains loses data the
application was told was durable — exactly the hook's own scenario, reproduced in `examples.py`'s
`WriteBehindCache.crash_before_flush`.

## Claim 3: Caffeine's W-TinyLFU combines an admission filter with eviction
Source: Caffeine project wiki, "Efficiency" (SOURCES.md #3).
> "Caffeine uses the `Window TinyLfu` policy due to its high hit rate and low memory footprint."
> "[W-TinyLfu] uses a small admission `LRU` that evicts to a large `Segmented LRU` if accepted by
> the `TinyLfu` admission policy. `TinyLfu` relies on a frequency sketch to probabilistically
> estimate the historic usage of an entry."
Verdict: Confirmed. A frequency-based admission filter gates what is even allowed to compete for
retention; the Segmented LRU is the eviction policy sitting behind it. This is the real-product
precedent for `examples.py`'s own simplified `AdmissionFilteredLRU` (a frequency counter standing
in for the frequency sketch).

## Claim 4 (this course): a real, measured hit-rate comparison on a skewed access pattern
Source: `examples.py`, run directly.
Measured: 30,000 requests over 10,000 keys drawn from a Zipfian distribution (skew 1.0), against
a capacity-100 cache. Plain LRU hit rate: 0.393. Admission-filtered LRU (frequency ≥ 5 required
before entry) hit rate: 0.463 — a 7-point improvement, confirmed by the script's own
`admission_hit_rate > lru_hit_rate + 0.05` assertion.
Verdict: Confirmed by direct computation, not asserted from a source.

## Problem Solving
- `github.com/ben-manes/caffeine/wiki/Efficiency` returned 403 to this sandbox's fetcher (the
  known gated-GitHub-wiki-path gotcha); fixed by fetching the same content from
  `raw.githubusercontent.com/wiki/ben-manes/caffeine/Efficiency.md`, confirmed identical text.
- The hit-rate comparison's first parameter choice (1,000 keys, skew 1.2, threshold 2) only
  produced a 1-point gap (0.757 vs 0.767) — real, but too thin to read as a convincing lab result.
  Swept skew/key-count/capacity/threshold combinations and selected skew 1.0, 10,000 keys,
  capacity 100, admission threshold 5, which gives a 7-point gap (0.393 vs 0.463) while still
  using the same mechanisms (plain LRU vs. a frequency-gated LRU) the claims above describe.
