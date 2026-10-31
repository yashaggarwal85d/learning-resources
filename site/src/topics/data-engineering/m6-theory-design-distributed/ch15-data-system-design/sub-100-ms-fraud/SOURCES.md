# Sources — de.sub-100-ms-fraud

`CHAPTER.md` names Chapter 5's quantile-sketch and serving-store topics and Chapter 9's
Flink-state topics as in-course anchors, the Flink and Redis documentation for state backends
and latency diagnosis, Dean and Barroso's "The Tail at Scale" for the fan-out tail, and Uber's
Michelangelo write-up for the scoring-pipeline precedent as candidates. This topic quotes the
Apache Flink documentation (the RocksDB state backend this topic's streaming-feature state is
sized against) and Redis's own documentation (the sub-microsecond processing time and the
single-threaded design this topic's online-store latency budget is built on) — two sources,
satisfying the ≥2-source rule. Chapter 5's quantile-sketch and serving-store material and
Chapter 9's Flink-state material are prior topics on this same site and this chapter's own
established method, used and not re-taught, not external sources.

## Apache Flink documentation, "State Backends"

URL: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/ops/state/state_backends/
Fetched: 2026-10-31. Covers Flink release 2.3.

Quotes:
> holds in-flight data in a RocksDB database that is (per default) stored in the TaskManager local data directories.

> Note that the amount of state that you can keep is only limited by the amount of disk space available.

> This allows keeping very large state, compared to the HashMapStateBackend that keeps state in memory.

Items: (1) where the streaming-feature state this topic sizes actually lives — on disk, per
TaskManager, not only in memory; (2) the reason the RocksDB backend is chosen once state outgrows
memory, rather than a design preference; (3) the explicit contrast with the in-memory backend
this topic's state-size estimate decides between.

## Redis documentation, "Diagnosing latency issues"

URL: https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/
Fetched: 2026-10-31.

Quotes:
> Usually Redis processing time is extremely low, in the sub microsecond range, but there are certain conditions leading to higher latency figures.

> This means that Redis can serve a single request in every given moment, so all the requests are served sequentially.

> When executing normal commands, like GET or SET or LPUSH this is not a problem at all since these commands are executed in constant (and very small) time.

Items: (1) the online store's own processing-time floor this topic's latency-budget table
allocates against; (2) the single-threaded design behind why one slow command can delay every
other request on the same store, the mechanism behind this topic's degraded-mode design; (3) the
constant-time guarantee for the simple lookups this topic's feature-fetch hop relies on.
