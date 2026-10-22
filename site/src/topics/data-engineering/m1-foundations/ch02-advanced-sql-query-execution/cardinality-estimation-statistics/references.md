Last verified: 2026-10-22.

- PostgreSQL 18 Documentation, [§14.2, "Statistics Used by the Planner"](https://www.postgresql.org/docs/18/planner-stats.html) — single-column statistics (`pg_class`, `pg_statistic`/`pg_stats`, `default_statistics_target`) and extended statistics (why correlation breaks the independence assumption, functional dependencies, multivariate n-distinct and MCV lists), quoted verbatim.
- PostgreSQL 18 Documentation, [§69.1, "Row Estimation Examples"](https://www.postgresql.org/docs/18/row-estimation-examples.html) — every selectivity formula this topic uses (`scalarltsel`'s histogram interpolation, `eqsel`'s in-MCV and off-MCV cases, the independence assumption, `eqjoinsel`), with PostgreSQL's own worked numbers, quoted verbatim.
- PostgreSQL 18 Documentation, [CREATE STATISTICS](https://www.postgresql.org/docs/18/sql-createstatistics.html) — the three statistics kinds (`ndistinct`, `dependencies`, `mcv`) and their syntax, quoted verbatim.
- PostgreSQL 18 Documentation, [§53.29, "pg_stats"](https://www.postgresql.org/docs/18/view-pg-stats.html) — `n_distinct`'s sign convention, quoted verbatim.
- Kipf, Kipf, Radke, Leis, Renz, Kemper, ["Learned Cardinalities: Estimating Correlated Joins with Deep Learning"](https://arxiv.org/abs/1809.00677) (CIDR 2019) — the frontier mention, quoted verbatim from the abstract.
- Measured directly on this topic's own PostgreSQL 16 instance (a 2,000,000-row `orders` table built to the chapter's shop schema, plus a 400,000-row bulk load) — see `SOURCES.md`, "Measured directly", and `examples.py` for the exact setup and every number used in the reel.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=cardinality-estimation-statistics:%20).
