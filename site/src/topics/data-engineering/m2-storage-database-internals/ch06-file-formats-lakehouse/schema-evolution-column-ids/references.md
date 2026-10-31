Last verified: 31 October 2026. Every claim demonstrated on screen is executed and asserted
directly (`examples.py`, pure Python standard library, no external dependencies): a real
rename-plus-insert reproduced on an on-disk table, read by position (corrupted) and by field ID
(correct), and a real Delta-style rename reproduced with and without column mapping, verified by
comparing the data file's own bytes before and after.

- Apache Iceberg, "Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-10-31. The schema-evolution and column-projection sections this topic quotes and reproduces.
- Delta Lake, "Delta column mapping": [docs.delta.io](https://docs.delta.io/delta-column-mapping/). Fetched 2026-10-31. The name/id mode mechanism this topic quotes and reproduces.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=schema-evolution-column-ids:%20).
