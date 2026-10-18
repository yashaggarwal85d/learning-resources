Last verified: 2026-10-14.

- PostgreSQL 18 Documentation, [`CREATE FUNCTION`](https://www.postgresql.org/docs/current/sql-createfunction.html) — the `IMMUTABLE`/`STABLE`/`VOLATILE`, `PARALLEL {UNSAFE|RESTRICTED|SAFE}`, `COST`, and `ROWS` clauses, quoted verbatim, including the stated defaults.
- PostgreSQL source (`master` branch, checked 2026-10-14), [`src/backend/optimizer/util/clauses.c`](https://github.com/postgres/postgres/blob/master/src/backend/optimizer/util/clauses.c), function `inline_function` — the exact conditions under which a SQL-language function is inlined.
- K. Ramachandra, K. Park, K. V. Emani, A. Halverson, C. Galindo-Legaria, C. Cunningham, ["Froid: Optimization of Imperative Programs in a Relational Database"](https://www.vldb.org/pvldb/vol11/p432-ramachandra.pdf), PVLDB 11(4): 432–444, 2017 (presented at VLDB 2018) — the APPLY-operator algebrization technique, SQL Server 2017 implementation, and the "one to three orders of magnitude" measured improvement.
- Microsoft Learn, ["Scalar UDF Inlining"](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining) — the feature is available from SQL Server 2019 (compatibility level 150) and lists which UDF constructs can be inlined.
- Databricks Engineering Blog, ["Introducing Pandas UDF for PySpark"](https://www.databricks.com/blog/2017/10/30/introducing-vectorized-udfs-for-pyspark.html), 2017-10-30 — row-at-a-time vs Arrow-based vectorized UDF overhead, and the measured "3x to over 100x" range.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=user-defined-functions-optimizer-opacity:%20).
