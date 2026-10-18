Last verified: 2026-10-13.

- D. Goldberg, "What Every Computer Scientist Should Know About Floating-Point Arithmetic", *ACM Computing Surveys* 23(1), 1991. [doi:10.1145/103162.103163](https://doi.org/10.1145/103162.103163) — the ulp, the non-associativity of floating-point addition, and the compensated-summation framing (the reason a float `SUM` depends on row order comes from here, not from the Python tutorial below).
- Python documentation, ["Floating-Point Arithmetic: Issues and Limitations"](https://docs.python.org/3/tutorial/floatingpoint.html) (the `0.1` representation error, printed in full) and [`math.fsum`](https://docs.python.org/3/library/math.html#math.fsum) ("almost always correctly rounded to within 1/2 ulp") and the [`decimal`](https://docs.python.org/3/library/decimal.html) module.
- PostgreSQL 18 documentation, ["Numeric Types"](https://www.postgresql.org/docs/18/datatype-numeric.html) — integer ranges and the out-of-range error, `numeric` exactness and precision/scale, rounding ties away from zero, `double precision` as IEEE 754.
- Apache Spark documentation, ["ANSI Compliance"](https://spark.apache.org/docs/latest/sql-ref-ansi-compliance.html) — `spark.sql.ansi.enabled` true by default, arithmetic overflow raises `ARITHMETIC_OVERFLOW`, `try_*` functions, and the Spark 3 / ANSI-off wrapping behavior. ANSI became the default in [Spark 4.0](https://spark.apache.org/releases/spark-release-4-0-0.html).
- Snowflake documentation, ["Scale and precision in arithmetic operations"](https://docs.snowflake.com/en/sql-reference/operators-arithmetic) — the multiplication, division and addition rules, and the precision cap of 38.
- NumPy documentation, ["Data types"](https://numpy.org/doc/stable/user/basics.types.html) — fixed-width integer overflow and C casting rules (`Overflow errors`).
- pandas 3.0.0 release notes, ["Datetime/timedelta resolution inference"](https://pandas.pydata.org/docs/whatsnew/v3.0.0.html) — microsecond default when parsing strings, falling back to nanoseconds.
- Apache Parquet format, [`LogicalTypes.md`](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md) — `TIMESTAMP` as an `int64` with unit `MILLIS`/`MICROS`/`NANOS` and `isAdjustedToUTC`.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=numeric-representation-data-bugs:%20).
