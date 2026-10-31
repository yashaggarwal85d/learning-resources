Last verified: 31 October 2026. Every claim demonstrated on screen is executed and asserted
directly (`examples.py`, pure Python standard library, no external dependencies): a real deletion
vector built as an array container (1,200 positions) and as a bitset container (5,000 positions),
and a real measured read cost that applying the vector adds, paid back by a real compaction pass.

- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-10-31. The deletion-vector section this topic quotes and reproduces.
- Apache Iceberg, "Puffin Spec": [iceberg.apache.org](https://iceberg.apache.org/puffin-spec/). Fetched 2026-10-31. The deletion-vector-v1 blob definition, including its stated Delta compatibility.
- Delta Lake, "What are deletion vectors?": [docs.delta.io](https://docs.delta.io/delta-deletion-vectors/). Fetched 2026-10-31. Delta's own deletion-vector mechanism and its OPTIMIZE / REORG TABLE compaction commands.
- Apache Hudi, "Table and Query Types": [hudi.apache.org](https://hudi.apache.org/docs/table_types/). Fetched 2026-10-31, docs version 1.2.1. Hudi's own non-bitmap mechanism, log-file delete records.
- RoaringBitmap, "RoaringFormatSpec": [github.com](https://github.com/RoaringBitmap/RoaringFormatSpec). Fetched 2026-10-31. The real array/bitset container threshold this topic's deletion vector reuses.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=deletion-vectors-across-formats:%20).
