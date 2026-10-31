Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy Flink runtime model, no real Flink cluster available): a slot-bounded
maximum parallelism computed directly from TaskManager and slot counts; chained operators
measurably cheaper than the same operators left unchained on the same stream; a credit-counter
simulation measurably draining backward through a chain, one channel starving after another; and
adaptive batch scheduling measurably assigning different parallelisms to different data volumes.
The JobManager/TaskManager/slot architecture, operator chaining, credit-based flow control, the
per-job-mode removal, and adaptive batch scheduling are disclosed, sourced-only claims from
Apache Flink's own documentation, its 2.0 release notes, and its engineering blog.

- Flink Architecture (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../concepts/flink-architecture/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/concepts/flink-architecture/).
  The JobManager/TaskManager/slot relationship, operator chaining, and application mode this
  topic cites.
- Flink 2.0 release notes (Apache Flink docs repository):
  [apache.googlesource.com/.../flink-2.0.md](https://apache.googlesource.com/flink/+show/master/docs/content/release-notes/flink-2.0.md).
  The per-job-mode-removal claim this topic cites, verified directly against the release notes
  rather than the 1.20 docs' own forward-looking language.
- A Deep-Dive into Flink's Network Stack (Apache Flink blog, 2019):
  [flink.apache.org/2019/06/05/...](https://flink.apache.org/2019/06/05/a-deep-dive-into-flinks-network-stack/).
  The credit-based flow control and backpressure mechanics this topic cites.
- Elastic Scaling (Apache Flink, 1.20 docs):
  [nightlies.apache.org/.../elastic_scaling/](https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/deployment/elastic_scaling/).
  The Adaptive Batch Scheduler definition this topic cites.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=flink-runtime-architecture:%20).
