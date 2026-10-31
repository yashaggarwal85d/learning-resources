Sources fetched and quoted for `de.disaggregated-state-flink`.

## Disaggregated state in Flink 2.0 (Mei et al., 2025 VLDB)

URL: https://www.vldb.org/pvldb/vol18/p4846-mei.pdf

> Flink 2.0 introduces two major innovations: (i) an asynchronous record execution framework that enables non-blocking state access and leverages out-of-order execution to improve performance, and (ii) a new disaggregated state store, ForSt (short for For Streaming), that provides an LSM-tree abstraction to seamlessly unify local and remote state access.

> We discuss how the asynchronous model preserves Flink 1.x's per-key processing order, watermark correctness, and fault tolerance guarantees

> This results in a lightweight metadata update when checkpointing, while maintaining the existing state and checkpoint file lifecycle management. As we show in Section 6.1, checkpoints in Flink 2.0 consistently complete within a few seconds.

> Overall, all the checkpoints in Flink 2.0 can finish within 3 seconds, no matter how big the checkpoint size is, while Flink 1.20's checkpoint duration is largely determined by the incremental checkpoint size.

> Compared to Flink 1.20, it provides 16× faster job recovery, 12× faster scale-in, and 49× faster scale-out.

> Enabling disaggregated state management without any cache (Flink 2.0-HDFS-async) incurs a moderate overhead, degrading throughput by 48% on average for queries with heavy I/O.

> Even with a limited 1GB local disk cache, it outperforms local state setup (Flink 1.20 and Flink 2.0-local-sync) by 4% on average.

## State Backends (Apache Flink, 2.0 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.0/docs/ops/state/state_backends/

> The ForStStateBackend is a state backend that is based on ForSt project, which is also a LSM-tree structured key-value store and built on top of the RocksDB.

> Most importantly, it can hold its sst files on remote file systems that Flink supports, such as HDFS, S3, etc. This allows Flink to scale the state size beyond the local disk capacity of the TaskManager.

> Compared with EmbeddedRocksDBStateBackend, ForStStateBackend stores data on remote file system, thus the amount of state that you can keep is unlimited. The local disk of TaskManager is only used to store cache of file, to provide better performance.

> Note that when most of the active state is on remote file system, the performance of state access may be affected by the network latency. Flink introduces asynchronous state access to mitigate this issue.

> Asynchronous state access is preferred. Since the ForStStateBackend is the only one supporting asynchronous state access.

## Working with State V2 (Apache Flink, 2.0 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.0/docs/dev/datastream/fault-tolerance/state_v2/

> Unlike the previous state API, the new state API is designed for asynchronous state access. Each type of state gives two versions of the API: synchronous and asynchronous. The synchronous API is a blocking API that waits for the state access to complete. The asynchronous API is non-blocking and returns a StateFuture that will be completed when the state access

> The new API set are only available on KeyedStream with enableAsyncState() invoked.

Notes on this topic's research: all three documents fetched clean on the first attempt (the VLDB
paper found via WebSearch while researching topic 21, not yet fetched until this topic). The
per-key-ordering claim is stated most precisely in the paper's own introduction ("preserves Flink
1.x's per-key processing order"); the 2.0 docs' State API V2 page documents the mechanics
(`enableAsyncState()`, `StateFuture`) but doesn't restate the ordering guarantee in those exact
words, so this topic cites the paper for the guarantee and the docs for the API shape, rather than
treating them as a single interchangeable source.
