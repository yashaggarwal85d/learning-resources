Last verified: 2026-10-14.

- PostgreSQL 18 Documentation, [§9.19, "Array Functions and Operators"](https://www.postgresql.org/docs/current/functions-array.html) — `unnest`'s single- and multi-argument forms, quoted verbatim, including the NULL-padding rule for mismatched lengths.
- PostgreSQL 18 Documentation, [§7.2.1.4, "Table Functions"](https://www.postgresql.org/docs/current/queries-table-expressions.html) — `WITH ORDINALITY`, `ROWS FROM`, and the equivalence of multi-argument `UNNEST` to per-argument `unnest` combined via `ROWS FROM`.
- PostgreSQL 18 Documentation, [§9.16, "JSON Functions and Operators"](https://www.postgresql.org/docs/current/functions-json.html) — the `->`/`->>`/`#>` operators and §9.16.4 "`JSON_TABLE`," including its documented lateral-join behavior.
- PostgreSQL 17 Release Notes, [§E.12.1](https://www.postgresql.org/docs/17/release-17.html) — `JSON_TABLE()` dated to the 2024-09-26 release.
- Snowflake Documentation, ["Semi-structured data types"](https://docs.snowflake.com/en/sql-reference/data-types-semistructured) and ["Considerations for semi-structured data stored in VARIANT"](https://docs.snowflake.com/en/user-guide/semistructured-considerations) — `VARIANT`'s size limit and the flatten-for-pruning guidance.
- Databricks Documentation, ["VARIANT type"](https://docs.databricks.com/en/sql/language-manual/data-types/variant-type.html) — availability (Databricks Runtime 15.3+) and the Iceberg v2-vs-v3 support boundary.
- Apache Parquet Format specification, [`VariantShredding.md`](https://github.com/apache/parquet-format/blob/master/VariantShredding.md) — the binary `value`/`metadata` encoding and the shredding mechanism, quoted verbatim.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=nested-semi-structured-data-sql:%20).
