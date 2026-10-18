Last verified: 2026-10-14.

- PostgreSQL 18 Documentation, [`MERGE`](https://www.postgresql.org/docs/current/sql-merge.html) — the `WHEN MATCHED`/`NOT MATCHED [BY SOURCE/TARGET]` semantics, the duplicate-source-row error, and the `wines` RETURNING/merge_action()/OLD/NEW example, quoted verbatim.
- PostgreSQL 18 Documentation, [`INSERT`, "ON CONFLICT Clause"](https://www.postgresql.org/docs/current/sql-insert.html) — the atomicity guarantee of `ON CONFLICT DO UPDATE` ("UPSERT"), quoted verbatim.
- PostgreSQL 18 Documentation, [§13.2, "Transaction Isolation"](https://www.postgresql.org/docs/current/transaction-iso.html) — the exact statement that `MERGE` does not guarantee an atomic insert-or-update outcome and can raise a uniqueness violation under a concurrent insert, quoted verbatim.
- PostgreSQL 17 Release Notes, [§E.12.3.4, "MERGE"](https://www.postgresql.org/docs/17/release-17.html) — `RETURNING`/`merge_action()` added to `MERGE`.
- PostgreSQL 18 Release Notes, [§E.6.1](https://www.postgresql.org/docs/18/release-18.html) — `OLD`/`NEW` support added to `RETURNING` for `INSERT`/`UPDATE`/`DELETE`/`MERGE`.
- Delta Lake Documentation, ["Table deletes, updates, and merges"](https://docs.delta.io/latest/delta-update.html) — the file-rewrite cost of `MERGE INTO`, the `WHEN NOT MATCHED BY SOURCE` full-rewrite warning, and shuffle-driven output file counts.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=merge-upsert-concurrent-writers:%20).
