Last verified against these sources: 24 October 2026. Real measurements run in this sandbox
(`examples.py`, against this sandbox's own PostgreSQL 16 cluster): `pg_control_checkpoint()`'s
own `redo_lsn`, `pg_current_wal_lsn()`, and `pg_stat_wal`'s own `wal_fpi` counter, read directly
around ten rounds of updates checkpointed every round versus checkpointed only once. ARIES's own
three-pass recovery structure is a disclosed, sourced-only claim: the only available copies of
the paper are badly OCR-scrambled scans, so it's cited by full reference rather than block-quoted
(see SOURCES.md for the reliability note).

- PostgreSQL docs, "WAL Configuration": [postgresql.org](https://www.postgresql.org/docs/16/wal-configuration.html). The redo record itself, and the checkpoint-frequency trade-off in the engine's own words.
- PostgreSQL docs, "Write-Ahead Logging (WAL)": [postgresql.org](https://www.postgresql.org/docs/16/wal-intro.html). Crash recovery described as roll-forward/REDO.
- PostgreSQL docs, "Continuous Archiving and Point-in-Time Recovery (PITR)": [postgresql.org](https://www.postgresql.org/docs/16/continuous-archiving.html). Point-in-time recovery as partial WAL replay.
- PostgreSQL docs, "Log-Shipping Standby Servers": [postgresql.org](https://www.postgresql.org/docs/16/warm-standby.html). Physical replication as continuous WAL application.
- PostgreSQL docs, "Logical Decoding Concepts": [postgresql.org](https://www.postgresql.org/docs/16/logicaldecoding-explanation.html). Logical decoding as the same WAL, decoded into row changes.
- Mohan, C. et al., "ARIES: A Transaction Recovery Method...", *ACM TODS* Vol. 17 No. 1, 1992. Named by full reference; not block-quoted (OCR-scrambled scans only).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=checkpoints-crash-recovery:%20).
