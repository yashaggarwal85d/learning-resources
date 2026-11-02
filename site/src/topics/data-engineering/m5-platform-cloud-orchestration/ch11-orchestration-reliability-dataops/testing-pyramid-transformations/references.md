# References

- dbt Developer Hub, "Unit tests": https://docs.getdbt.com/docs/build/unit-tests
- Apache Spark Python API Documentation, "Testing PySpark": https://spark.apache.org/docs/latest/api/python/getting_started/testing_pyspark.html

Last verified: 2026-10-31. Expert sign-off: pending.

Software run in this sandbox: a real local Spark session (`SparkSession.builder.master("local[1]")`, PySpark 4.3.0, OpenJDK 21) for the pytest-against-Spark rung; the `hypothesis` property-based testing library (6.170.14) for the property-invariant rung, with an explicit `@example` guard forcing a known counterexample to run; Python 3 standard library for the dbt-unit-test-style mock, the golden-dataset snapshot diff, and the three real flaky-test reproductions (ordering, time, floating point). Every dbt and Apache Spark quote is verified word for word against the fetched source text.
