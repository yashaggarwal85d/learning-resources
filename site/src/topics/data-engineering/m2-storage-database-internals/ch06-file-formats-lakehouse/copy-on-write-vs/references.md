Last verified: 31 October 2026. Every claim demonstrated on screen is executed and asserted
directly (`examples.py`, pure Python standard library, no external dependencies): a real 1%-row
update applied under copy-on-write (every touched file fully rewritten) and under merge-on-read
(a small log file, with a real, isolated, repeated-measured merge-prep read cost that grows round
over round and resets after real compaction).

- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-10-31. The deletion-vector and position-delete-file sections this topic quotes.
- Apache Hudi, "Table and Query Types": [hudi.apache.org](https://hudi.apache.org/docs/table_types/). Fetched 2026-10-31, docs version 1.2.1. The copy-on-write and merge-on-read table types, named and compared directly.
- Delta Lake, "Deletion vectors": [docs.delta.io](https://docs.delta.io/delta-deletion-vectors/). Fetched 2026-10-31. Delta's default rewrite-the-file behavior, its deletion-vector alternative, and its OPTIMIZE / REORG TABLE compaction commands.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=copy-on-write-vs:%20).
