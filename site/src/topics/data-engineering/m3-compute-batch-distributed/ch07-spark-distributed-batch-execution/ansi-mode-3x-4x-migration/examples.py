"""
de.ansi-mode-3x-4x-migration -- measured against real PySpark 4.0.1, local[2].

Three claims, verified against real SQL statements run through a live SparkSession with
spark.sql.ansi.enabled and spark.sql.storeAssignmentPolicy toggled:

1. Integer overflow (`2147483647 + 1`) raises a real `SparkArithmeticException` when ANSI mode
   is on, and silently wraps to a negative number when ANSI mode is off (the pre-4.0 default).
2. Casting a malformed string to INT (`CAST('a' AS INT)`) raises a real `SparkNumberFormatException`
   when ANSI mode is on, and returns NULL when ANSI mode is off; the `try_cast`/`try_add`
   equivalents return NULL under ANSI mode too, on purpose, regardless of the setting.
3. Inserting a non-numeric string into an INT column raises a real `AnalysisException` under the
   default `spark.sql.storeAssignmentPolicy=ANSI`, and succeeds (silently converting) under
   `spark.sql.storeAssignmentPolicy=LEGACY` -- a setting independent of `spark.sql.ansi.enabled`.
"""
from pyspark.sql import SparkSession
from pyspark.sql.utils import AnalysisException

spark = SparkSession.builder.master("local[2]").appName("examples28").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")


def run_sql_catching(sql):
    try:
        spark.sql(sql).collect()
        return None
    except Exception as e:
        return e


# --- Claim 1: integer overflow ---

spark.conf.set("spark.sql.ansi.enabled", "true")
err = run_sql_catching("SELECT 2147483647 + 1 AS x")
assert err is not None, "expected an overflow error under ANSI mode"
assert "ARITHMETIC_OVERFLOW" in str(err) or "overflow" in str(err).lower()

spark.conf.set("spark.sql.ansi.enabled", "false")
row = spark.sql("SELECT 2147483647 + 1 AS x").collect()[0]
assert row["x"] == -2147483648, f"expected wraparound to -2147483648, got {row['x']}"

# --- Claim 2: malformed cast ---

spark.conf.set("spark.sql.ansi.enabled", "true")
err = run_sql_catching("SELECT CAST('a' AS INT) AS x")
assert err is not None, "expected a cast error under ANSI mode"
assert "CAST_INVALID_INPUT" in str(err) or "cannot be cast" in str(err).lower()

row = spark.sql("SELECT try_cast('a' AS INT) AS x").collect()[0]
assert row["x"] is None, "try_cast should return NULL even under ANSI mode"

row = spark.sql("SELECT try_add(2147483647, 1) AS x").collect()[0]
assert row["x"] is None, "try_add should return NULL on overflow even under ANSI mode"

spark.conf.set("spark.sql.ansi.enabled", "false")
row = spark.sql("SELECT CAST('a' AS INT) AS x").collect()[0]
assert row["x"] is None, "expected NULL from a malformed cast with ANSI off"

# --- Claim 3: store assignment policy, independent of spark.sql.ansi.enabled ---

spark.conf.set("spark.sql.ansi.enabled", "true")
spark.sql("DROP TABLE IF EXISTS t28")
spark.sql("CREATE TABLE t28 (v INT) USING parquet")

spark.conf.set("spark.sql.storeAssignmentPolicy", "ANSI")
try:
    spark.sql("INSERT INTO t28 VALUES ('abc')")
    raised = False
except AnalysisException:
    raised = True
assert raised, "expected AnalysisException inserting a non-numeric string under ANSI store assignment"

spark.conf.set("spark.sql.storeAssignmentPolicy", "LEGACY")
spark.sql("INSERT INTO t28 VALUES ('1')")
row = spark.sql("SELECT v FROM t28").collect()[0]
assert row["v"] == 1, f"expected the legacy policy to silently convert '1' to 1, got {row['v']}"

spark.sql("DROP TABLE IF EXISTS t28")
spark.stop()

print("all claims verified")
