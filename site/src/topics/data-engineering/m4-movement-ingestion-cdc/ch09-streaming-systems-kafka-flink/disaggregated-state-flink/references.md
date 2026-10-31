Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy disaggregated-state model, no real Flink/ForSt cluster available): a
checkpoint-cost comparison showing a remote-primary checkpoint stays flat as state grows while a
local-primary one grows with it; a per-key-ordering model proving same-key accesses stay ordered
while different keys interleave; a sync-vs-async throughput comparison; a warm-vs-cold cache
effective-latency comparison. ForSt's own architecture, the async state API's mechanics, and the
paper's own reported recovery/scale-in/scale-out multiples are disclosed, sourced-only claims from
the paper and Apache Flink's own documentation.

- Disaggregated state in Flink 2.0 (Mei et al., 2025 VLDB):
  [vldb.org/pvldb/vol18/p4846-mei.pdf](https://www.vldb.org/pvldb/vol18/p4846-mei.pdf).
  The async execution framework, ForSt's role, per-key order preservation, and the reported
  checkpoint/recovery/scale-in/scale-out numbers this topic cites.
- State Backends (Apache Flink, 2.0 docs):
  [nightlies.apache.org/.../ops/state/state_backends/](https://nightlies.apache.org/flink/flink-docs-release-2.0/docs/ops/state/state_backends/).
  The ForStStateBackend definition, remote-file-system storage, and async-access-is-preferred
  guidance this topic cites.
- Working with State V2 (Apache Flink, 2.0 docs):
  [nightlies.apache.org/.../fault-tolerance/state_v2/](https://nightlies.apache.org/flink/flink-docs-release-2.0/docs/dev/datastream/fault-tolerance/state_v2/).
  The async state API's `StateFuture`/`enableAsyncState()` mechanics this topic cites.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=disaggregated-state-flink:%20).
