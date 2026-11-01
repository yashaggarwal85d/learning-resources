"""
de.variant-type-semi-structured -- measured against real PySpark 4.0.1, local[2].

Two claims, verified against real local DataFrames:

1. Extracting one field repeatedly from a JSON-string column is real, measurably slower than
   extracting the same field from the identical data stored as VARIANT -- the string column
   re-parses the whole JSON text on every extraction, while VARIANT was already parsed once,
   into self-describing binary, at write time.
2. Casting a field whose actual type varies row to row into a fixed-schema struct silently
   turns the row whose value doesn't match the declared type into NULL, losing it; the
   identical data read back through VARIANT preserves and extracts every row's own value
   correctly, whatever type it actually is.

Shredding (promoting a VARIANT field into its own typed Parquet column) is GA only as of Spark
4.1 -- this chapter's examples are pinned to 4.0.1, which has no automatic shredding-schema
inference (`spark.sql.variant.inferShreddingSchema` doesn't exist as a config in 4.0.1), so
shredding's own read/write trade-off is sourced in SOURCES.md, not measured here.
"""
import shutil
import time

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, concat, from_json, lit
from pyspark.sql.types import IntegerType, StructField, StructType

STR_DIR = "/tmp/examples29-str"
VARIANT_DIR = "/tmp/examples29-var"
for d in (STR_DIR, VARIANT_DIR):
    shutil.rmtree(d, ignore_errors=True)

ROWS = 300_000
RUNS = 4  # first run pays JIT/codegen warmup; steady-state compares the later runs.

spark = SparkSession.builder.master("local[2]").appName("examples29").getOrCreate()
spark.sparkContext.setLogLevel("ERROR")

# --- Claim 1: extraction cost, JSON string vs VARIANT ---

base = spark.range(ROWS).select(
    concat(
        lit('{"user_id":'), col("id"),
        lit(',"event":"click","nested":{"a":1,"b":2,"c":3,"d":4,"e":5}}'),
    ).alias("json_str")
)
base.write.mode("overwrite").parquet(STR_DIR)
base.selectExpr("parse_json(json_str) AS v").write.mode("overwrite").parquet(VARIANT_DIR)

str_df = spark.read.parquet(STR_DIR)
variant_df = spark.read.parquet(VARIANT_DIR)


def timed(action):
    t0 = time.time()
    action()
    return time.time() - t0


str_times = [
    timed(lambda: str_df.selectExpr("get_json_object(json_str, '$.user_id') AS x").agg({"x": "count"}).collect())
    for _ in range(RUNS)
]
variant_times = [
    timed(lambda: variant_df.selectExpr("variant_get(v, '$.user_id', 'int') AS x").agg({"x": "count"}).collect())
    for _ in range(RUNS)
]

str_steady = str_times[1:]
variant_steady = variant_times[1:]
assert min(str_steady) > max(variant_steady), (
    f"expected every steady-state JSON-string extraction to be slower than every steady-state "
    f"VARIANT extraction; got str={str_steady}, variant={variant_steady}"
)
assert sum(str_steady) > sum(variant_steady) * 1.5, (
    f"expected JSON-string extraction to take meaningfully longer overall; "
    f"got str_total={sum(str_steady):.3f}s, variant_total={sum(variant_steady):.3f}s"
)

# --- Claim 2: a type that varies row to row, struct cast vs VARIANT ---

mixed_rows = ['{"x": 1}', '{"x": "not a number"}', '{"x": 3}']
mixed_df = spark.createDataFrame([(r,) for r in mixed_rows], ["json_str"])

struct_schema = StructType([StructField("x", IntegerType())])
struct_result = [r["s"]["x"] for r in mixed_df.select(from_json(col("json_str"), struct_schema).alias("s")).collect()]
assert struct_result == [1, None, 3], f"expected the mismatched-type row to become NULL under the struct cast, got {struct_result}"

variant_result = [
    r["x_str"]
    for r in mixed_df.selectExpr("parse_json(json_str) AS v").selectExpr("variant_get(v, '$.x', 'string') AS x_str").collect()
]
assert variant_result == ["1", "not a number", "3"], f"expected VARIANT to preserve every row's own value, got {variant_result}"

spark.stop()

print("all claims verified")
