Last verified: 31 October 2026. Every claim demonstrated on screen is executed and asserted
directly (`examples.py`, pure Python standard library, no external dependencies): a real pinned
reader's file list read twice, before and after a real second writer's commit, proven identical;
and a real compare-and-swap race between two writers, using `os.open` with `O_EXCL`, where exactly
one wins and the other gets a real, immediate rejection.

- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-10-31. The snapshot and atomic-metadata-swap mechanism this topic reproduces.
- Delta Lake, "PROTOCOL.md": [github.com](https://github.com/delta-io/delta/blob/master/PROTOCOL.md). Fetched 2026-10-31. Delta's own serial-history-of-atomic-versions design.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=snapshot-based-table-metadata:%20).
