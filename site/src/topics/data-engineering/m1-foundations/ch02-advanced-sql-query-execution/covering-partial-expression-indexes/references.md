Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§11.9, "Index-Only Scans and Covering Indexes"](https://www.postgresql.org/docs/18/indexes-index-only-scans.html) — INCLUDE columns and the visibility map, quoted verbatim.
- PostgreSQL 18 Documentation, [§11.8, "Partial Indexes"](https://www.postgresql.org/docs/18/indexes-partial.html) — partial indexes over hot subsets, quoted verbatim.
- PostgreSQL 18 Documentation, [§11.7, "Indexes on Expressions"](https://www.postgresql.org/docs/18/indexes-expressional.html) — expression indexes, quoted verbatim.
- Measured directly: PostgreSQL 16.15 (the existing instance from topics 23–28) for all four comparisons — INCLUDE/index-only scans, visibility-map dependence before and after an UPDATE and a VACUUM, partial-index storage size, and the expression-index exact-match requirement. See `SOURCES.md`, "Measured directly", and `examples.py` for the exact numbers used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=covering-partial-expression-indexes:%20).
