Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy keyed-state model, no real Flink cluster available): a key-group rescale
from four to six instances, verified with every key group moving as a whole and checksummed
unchanged; a recovery-time model confirming it tracks state held, not operator count; and a
measured heap-versus-RocksDB access-cost and capacity comparison. The state-backend trade-offs,
key-group/max-parallelism mechanics, state TTL, schema evolution rules, and the 1.x-to-2.x state
compatibility gap are disclosed, sourced-only claims from Apache Flink's own documentation.

- State Backends (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../ops/state/state_backends/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/ops/state/state_backends/).
  The heap-vs-RocksDB definitions and trade-offs this topic cites.
- Parallel Execution (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../execution/parallel/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/execution/parallel/).
  The key-group/max-parallelism relationship this topic cites.
- Working with State (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../fault-tolerance/state/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/fault-tolerance/state/).
  The state TTL definition and cleanup behavior this topic cites.
- State Schema Evolution (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../serialization/schema_evolution/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/fault-tolerance/serialization/schema_evolution/).
  The POJO evolution rules this topic cites.
- Upgrading Applications and Flink Versions (Apache Flink, 2.0 docs):
  [nightlies.apache.org/.../ops/upgrading/](https://nightlies.apache.org/flink/flink-docs-release-2.0/docs/ops/upgrading/).
  The savepoint compatibility table this topic cites.
- Flink 2.0 release notes (Apache Flink docs repository):
  [apache.googlesource.com/.../flink-2.0.md](https://apache.googlesource.com/flink/+show/master/docs/content/release-notes/flink-2.0.md).
  The Kryo-upgrade technical cause this topic cites.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=keyed-state-key-groups-rescaling:%20).
