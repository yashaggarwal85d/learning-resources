## Apache Spark documentation, "ANSI Compliance"

URL: https://spark.apache.org/docs/4.0.0/sql-ref-ansi-compliance.html
Version: 4.0.0

> By default, spark.sql.ansi.enabled is true and Spark SQL uses an ANSI compliant dialect
instead of being Hive compliant. For example, Spark will throw an exception at runtime
instead of returning null results if the inputs to a SQL operator/function are invalid.

> In Spark SQL, by default, Spark throws an arithmetic exception at runtime for both interval
and numeric type overflows.

> -- `spark.sql.ansi.enabled=true`
SELECT 2147483647 + 1;
org.apache.spark.SparkArithmeticException: [ARITHMETIC_OVERFLOW] integer overflow. Use
'try_add' to tolerate overflow and return NULL instead. If necessary set spark.sql.ansi.enabled
to "false" to bypass this error.

> If spark.sql.ansi.enabled is false, then the decimal type will produce null values and other
numeric types will behave in the same way as the corresponding operation in a Java/Scala
program (e.g., if the sum of 2 integers is higher than the maximum value representable, the
result is a negative number) which is the behavior of Spark 3 or older.

> When spark.sql.ansi.enabled is set to true, explicit casting by CAST syntax throws a runtime
exception for illegal cast patterns defined in the standard, e.g. casts from a string to an
integer.

> org.apache.spark.SparkNumberFormatException: [CAST_INVALID_INPUT] The value 'a' of the type
"STRING" cannot be cast to "INT" because it is malformed. Correct the value as per the syntax,
or change its target type. Use `try_cast` to tolerate malformed input and return NULL instead.

> By default, spark.sql.storeAssignmentPolicy is ANSI and Spark SQL complies with the ANSI
store assignment rules.

> With ANSI policy, Spark performs the type coercion as per ANSI SQL. In practice, the behavior
is mostly the same as PostgreSQL. It disallows certain unreasonable type conversions such as
converting string to int or double to boolean. On inserting a numeric type column, an overflow
error will be thrown if the value is out of the target data type's range.

> -- Examples of store assignment rules
CREATE TABLE t (v INT);

> -- `spark.sql.storeAssignmentPolicy=ANSI`
INSERT INTO t VALUES ('1');
org.apache.spark.sql.AnalysisException: [INCOMPATIBLE_DATA_FOR_TABLE.CANNOT_SAFELY_CAST] Cannot
write incompatible data for table `spark_catalog`.`default`.`t`: Cannot safely cast `v`:
"STRING" to "INT".

> try_cast: identical to CAST, except that it returns NULL result instead of throwing an
exception on runtime error.

> try_add: identical to the add operator +, except that it returns NULL result instead of
throwing an exception on integral value overflow.

> try_divide: identical to the division operator /, except that it returns NULL result instead
of throwing an exception on dividing 0.

## Apache Spark documentation, "Migration Guide: SQL, Datasets and DataFrame"

URL: https://spark.apache.org/docs/4.0.0/sql-migration-guide.html
Version: 4.0.0

Note on source naming: CHAPTER.md names "Spark SQL migration guide (3.5 to 4.0 section)" --
quoted below from that section's own text on the 4.0.0-pinned page.

> Since Spark 4.0, spark.sql.ansi.enabled is on by default. To restore the previous behavior,
set spark.sql.ansi.enabled to false or SPARK_ANSI_SQL_MODE to false.

## Apache Spark, "Spark Release 4.0.0"

URL: https://spark.apache.org/releases/spark-release-4-0-0.html
Version: 4.0.0

Note on source naming: CHAPTER.md names "Spark 4.0 release notes" as topic 28's first source
alongside the "ANSI Compliance" docs -- quoted below for the Java/Scala baseline and Mesos
removal, which the ANSI Compliance and migration-guide pages above don't cover.

> [SPARK-45314] Drop Scala 2.12 and make Scala 2.13 the default

> [SPARK-45315] Drop JDK 8/11 and make JDK 17 the default

> [SPARK-44442] Drop mesos support

> [SPARK-44444] Use ANSI SQL mode by default
