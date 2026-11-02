# Fact-check — Disaggregated state in Flink 2.x

| Claim | Source | Status |
|---|---|---|
| Flink 2.0 introduces an asynchronous record execution framework enabling non-blocking state access and a disaggregated state store, ForSt, with an LSM-tree abstraction unifying local and remote state access | Mei et al., 2025 VLDB | Confirmed, quoted verbatim |
| The asynchronous model preserves Flink 1.x's per-key processing order, watermark correctness, and fault tolerance guarantees | Mei et al., 2025 VLDB | Confirmed, quoted verbatim |
| Checkpointing becomes a lightweight metadata update while maintaining the existing state and checkpoint file lifecycle management; checkpoints consistently complete within a few seconds | Mei et al., 2025 VLDB | Confirmed, quoted verbatim |
| All checkpoints in Flink 2.0 can finish within three seconds regardless of checkpoint size, unlike Flink 1.20 where duration is largely determined by incremental checkpoint size | Mei et al., 2025 VLDB | Confirmed, quoted verbatim |
| Compared to Flink 1.20, disaggregated state provides sixteen-times faster job recovery, twelve-times faster scale-in, and forty-nine-times faster scale-out | Mei et al., 2025 VLDB | Confirmed, quoted verbatim |
| Enabling disaggregated state without any cache degrades throughput by 48% on average for queries with heavy I/O | Mei et al., 2025 VLDB | Confirmed, quoted verbatim |
| Even with a limited 1GB local disk cache, disaggregated state outperforms the local state setup by 4% on average | Mei et al., 2025 VLDB | Confirmed, quoted verbatim |
| ForStStateBackend is an LSM-tree structured key-value store built on top of RocksDB | Apache Flink 2.0 docs | Confirmed, quoted verbatim |
| ForStStateBackend can hold sst files on remote file systems such as HDFS or S3, scaling state size beyond local disk capacity | Apache Flink 2.0 docs | Confirmed, quoted verbatim |
| Compared with EmbeddedRocksDBStateBackend, ForStStateBackend stores data on remote file systems, so the amount of state kept is unlimited; local disk is used only as a cache | Apache Flink 2.0 docs | Confirmed, quoted verbatim |
| Asynchronous state access is preferred, and ForStStateBackend is currently the only backend supporting it | Apache Flink 2.0 docs | Confirmed, quoted verbatim |
| The new async state API gives synchronous and asynchronous versions of each state type; the asynchronous API returns a non-blocking StateFuture | Apache Flink 2.0 docs | Confirmed, quoted verbatim |
| The new async state API is only available on a KeyedStream with enableAsyncState() invoked | Apache Flink 2.0 docs | Confirmed, quoted verbatim |
| A remote-primary checkpoint's cost stays flat as state size grows while a local-primary checkpoint's cost grows with state size | Modeled and measured directly in `examples.py` (`checkpoint_cost`) | Confirmed by the toy model's own real run |
| Same-key accesses complete strictly in the order issued while different keys' accesses are free to interleave | Modeled and measured directly in `examples.py` (`AsyncStateAccess`) | Confirmed by the toy model's own real run |
| Overlapping remote round trips asynchronously finishes measurably faster than serving them one at a time | Modeled and measured directly in `examples.py` (`sync_throughput_ticks`, `async_throughput_ticks`) | Confirmed by the toy model's own real run |
| A poorly cached working set pays a measurably higher effective access latency than a well-cached one | Modeled and measured directly in `examples.py` (`effective_access_latency`) | Confirmed by the toy model's own real run |

## Red-team

- **Is the per-key-ordering guarantee stated in the same document as the async API's mechanics?**
  No. The paper's own introduction states the guarantee in exactly those terms ("preserves Flink
  1.x's per-key processing order"); the State API V2 docs page documents the `StateFuture`/
  `enableAsyncState()` mechanics but doesn't restate the ordering guarantee itself. This topic
  cites the paper for the guarantee and the docs for the API shape, disclosed in SOURCES.md rather
  than treated as one interchangeable source.
- **Do the paper's own reported multiples (16x recovery, 12x scale-in, 49x scale-out) generalize
  to every deployment?** Not asserted as universal — they're the paper's own measured numbers
  against its own benchmark configuration, named and sourced as such, not presented as a guaranteed
  result for any workload or cluster size.
- **Is the toy checkpoint-cost model realistic, or does it trivially assume the conclusion?** It
  directly implements the sourced mechanism — a local-primary checkpoint must copy state, a
  remote-primary one only needs metadata when the primary copy is already durable there — and
  measures the one property the topic claims: flat cost under growth. Disclosed as a deliberately
  simplified toy model, not a port of ForSt's actual checkpoint implementation.
- **Does the toy async-access model's interleaving actually demonstrate overlap, or could ordered
  same-key completions coincidentally look sequential?** The model uses deliberately staggered,
  increasing per-request latencies for two keys so their completion times interleave at the
  millisecond level while each key's own sequence stays monotonic — verified directly by asserting
  both properties on the same run, not just one.
- **Does this topic overstate ForSt as strictly better than RocksDB?** No — post-notes.md and the
  cache-tradeoff reveal explicitly disclose the throughput cost without a cache (48% average
  degradation on heavy-I/O queries) and frame RocksDB as the better fit for a job needing
  consistently low-latency state access on every record.
