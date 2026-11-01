"""
de.rocksdb-state-store-checkpointing -- measured against real PySpark 4.0.1, local[2].

Two claims, verified against real local Structured Streaming queries:

1. A streaming aggregation growing toward a large, distinct key count produces real, climbing
   JVM garbage-collection time on the default HDFS-backed state store provider; the identical
   workload on the RocksDB provider produces far less GC time, since RocksDB keeps the state in
   native memory and on local disk rather than as JVM objects on the heap.
2. Changelog checkpointing uploads real, measurably fewer bytes per checkpoint than traditional
   snapshot checkpointing, for the identical RocksDB workload -- it uploads only what changed,
   not the whole state, on every commit.
"""
import json
import os
import shutil
import time
import urllib.request

from pyspark.sql import SparkSession
from pyspark.sql.functions import col

CKPT_HDFS = "/tmp/examples27-ckpt-hdfs"
CKPT_ROCKSDB_SNAPSHOT = "/tmp/examples27-ckpt-rocksdb-snap"
CKPT_ROCKSDB_CHANGELOG = "/tmp/examples27-ckpt-rocksdb-changelog"
for d in (CKPT_HDFS, CKPT_ROCKSDB_SNAPSHOT, CKPT_ROCKSDB_CHANGELOG):
    shutil.rmtree(d, ignore_errors=True)

HDFS_PROVIDER = "org.apache.spark.sql.execution.streaming.state.HDFSBackedStateStoreProvider"
ROCKSDB_PROVIDER = "org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider"

RUN_SECONDS = 8
ROWS_PER_SECOND = 60_000  # distinct keys: each row is a new key, growing the state every batch.


def get_json(sc, path):
    url = f"http://localhost:4040/api/v1/applications/{sc.applicationId}{path}"
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())


def total_gc_ms(sc):
    execs = get_json(sc, "/executors")
    return sum(e.get("totalGCTime", 0) for e in execs)


def run_growing_key_aggregation(provider_class, checkpoint_dir):
    spark = (
        SparkSession.builder.master("local[2]")
        .appName(f"examples27-{provider_class.split('.')[-1]}")
        .config("spark.sql.shuffle.partitions", "2")
        .config("spark.sql.streaming.stateStore.providerClass", provider_class)
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")

    gc_before = total_gc_ms(spark.sparkContext)

    stream = spark.readStream.format("rate").option("rowsPerSecond", ROWS_PER_SECOND).option("numPartitions", 2).load()
    # value is already a monotonically increasing long -- every row is a brand-new key,
    # so the aggregation's own state keeps growing rather than updating existing entries.
    aggregated = stream.groupBy(col("value").alias("key")).count()
    query = (
        aggregated.writeStream.format("noop")
        .outputMode("update")
        .option("checkpointLocation", checkpoint_dir)
        .trigger(processingTime="1 second")
        .start()
    )
    time.sleep(RUN_SECONDS)
    query.stop()
    time.sleep(1)

    gc_after = total_gc_ms(spark.sparkContext)
    spark.stop()
    time.sleep(1)
    return gc_after - gc_before


gc_hdfs = run_growing_key_aggregation(HDFS_PROVIDER, CKPT_HDFS)
gc_rocksdb = run_growing_key_aggregation(ROCKSDB_PROVIDER, CKPT_ROCKSDB_SNAPSHOT)

# --- Claim 1: the HDFS-backed provider pays real, measurable GC time growing a large state;
# the identical workload on RocksDB pays far less, since its state lives off the JVM heap. ---
assert gc_hdfs > 0, "growing a large aggregation state on the HDFS-backed provider should cost real GC time"
assert gc_rocksdb < gc_hdfs * 0.6, (
    f"RocksDB's own GC time should be meaningfully lower than the HDFS-backed provider's for "
    f"the identical growing-key workload, got hdfs={gc_hdfs}ms rocksdb={gc_rocksdb}ms"
)


def checkpoint_bytes_written(checkpoint_dir):
    total = 0
    state_dir = os.path.join(checkpoint_dir, "state")
    for root, _dirs, files in os.walk(state_dir):
        for f in files:
            if f.endswith(".crc"):
                continue
            total += os.path.getsize(os.path.join(root, f))
    return total


def run_rocksdb_with_changelog(changelog_enabled, checkpoint_dir):
    spark = (
        SparkSession.builder.master("local[2]")
        .appName(f"examples27-changelog-{changelog_enabled}")
        .config("spark.sql.shuffle.partitions", "2")
        .config("spark.sql.streaming.stateStore.providerClass", ROCKSDB_PROVIDER)
        .config("spark.sql.streaming.stateStore.rocksdb.changelogCheckpointing.enabled", str(changelog_enabled).lower())
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")

    stream = spark.readStream.format("rate").option("rowsPerSecond", ROWS_PER_SECOND).option("numPartitions", 2).load()
    aggregated = stream.groupBy(col("value").alias("key")).count()
    query = (
        aggregated.writeStream.format("noop")
        .outputMode("update")
        .option("checkpointLocation", checkpoint_dir)
        .trigger(processingTime="1 second")
        .start()
    )
    time.sleep(RUN_SECONDS)
    query.stop()
    time.sleep(1)
    spark.stop()
    time.sleep(1)
    return checkpoint_bytes_written(checkpoint_dir)


bytes_snapshot = checkpoint_bytes_written(CKPT_ROCKSDB_SNAPSHOT)  # from the claim-1 RocksDB run above (changelog off by default).
bytes_changelog = run_rocksdb_with_changelog(True, CKPT_ROCKSDB_CHANGELOG)

# --- Claim 2: changelog checkpointing writes real, measurably fewer bytes than snapshot
# checkpointing, for the identical growing-key workload. ---
assert bytes_snapshot > 0, "snapshot checkpointing should have written real state files"
assert bytes_changelog > 0, "changelog checkpointing should have written real state files"
assert bytes_changelog < bytes_snapshot * 0.5, (
    f"changelog checkpointing should write meaningfully fewer total bytes than snapshot "
    f"checkpointing for the identical workload, got snapshot={bytes_snapshot} changelog={bytes_changelog}"
)

print("all claims verified")
