Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§19.4, "Resource Consumption"](https://www.postgresql.org/docs/18/runtime-config-resource.html#GUC-WORK-MEM) — `work_mem` and `hash_mem_multiplier`, quoted verbatim.
- PostgreSQL 18 Documentation, [§14.1, "Using EXPLAIN"](https://www.postgresql.org/docs/18/using-explain.html) — plan nodes added for sorting and hashing, quoted verbatim.
- PostgreSQL source, [`src/backend/executor/nodeHash.c`](https://github.com/postgres/postgres/blob/REL_18_0/src/backend/executor/nodeHash.c) (tag REL_18_0) — the batch-doubling mechanism (`ExecHashIncreaseNumBatches`) and the skew-bucket path, quoted (the fragments that quote cleanly word for word; see `SOURCES.md`'s note on why the function's multi-line doc-comments don't).
- Measured directly on this topic's own PostgreSQL 16 instance (`mem_demo`, 2,000,000 rows; `mem_join_small`, 500,000 rows; `mem_join_skew`, 495,001 distinct values) — see `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=memory-budgets-spilling-grace:%20).
