Last verified: 31 October 2026. The unified pool's own size, the full-eviction-plus-spill
case, the protected-minimum case, and the genuine JVM heap `OutOfMemoryError` are all measured
directly (`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session. The
container-level `OOM-kill` case was measured once in this session via a real Linux cgroup
memory limit (documented in `FACT-CHECK.md`), not re-run in `examples.py` since it needs root
and a cgroups v1 memory controller not guaranteed in every environment. User memory, reserved
memory, and off-heap memory are sourced and named only.

- Apache Spark source (GitHub), `UnifiedMemoryManager.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/scala/org/apache/spark/memory/UnifiedMemoryManager.scala) (tag v4.0.0).
- Apache Spark documentation, "Configuration": [spark.apache.org](https://spark.apache.org/docs/4.0.0/configuration.html).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=executor-memory-model:%20).
