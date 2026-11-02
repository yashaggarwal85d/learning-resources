"""de.sort-based-shuffle-mechanics — every number the reel shows, measured against a real local
Apache Spark 4.0.1 session (PySpark, local[4]), including the actual shuffle files it writes to
disk, found by pointing spark.local.dir at a directory this script controls and listing it.
"""
import glob
import os
import shutil
import tempfile

from pyspark.sql import SparkSession
from pyspark.sql.functions import col


def shuffle_files(local_dir):
    data_files = glob.glob(f"{local_dir}/**/shuffle_*.data", recursive=True)
    index_files = glob.glob(f"{local_dir}/**/shuffle_*.index", recursive=True)
    return data_files, index_files


def main():
    work_dir = tempfile.mkdtemp(prefix="spark-local-dir-")
    try:
        spark = (
            SparkSession.builder.appName("de.sort-based-shuffle-mechanics")
            .master("local[4]")
            .config("spark.local.dir", work_dir)
            .getOrCreate()
        )

        # Four map tasks (four input partitions), grouped by a derived key: a real shuffle.
        df = spark.range(0, 1_000_000, numPartitions=4)
        grouped = df.groupBy((col("id") % 97).alias("bucket")).count()
        rows = grouped.collect()
        assert len(rows) == 97, len(rows)

        data_files, index_files = shuffle_files(work_dir)
        # One data file AND one index file per map task: four map tasks, four of each.
        assert len(data_files) == 4, len(data_files)
        assert len(index_files) == 4, len(index_files)

        total_data_bytes = sum(os.path.getsize(f) for f in data_files)
        total_index_bytes = sum(os.path.getsize(f) for f in index_files)
        assert total_data_bytes > 0
        # The index file is small and roughly constant-sized per reduce-partition-count entry,
        # not proportional to the data volume — it is tiny next to the data file it indexes.
        assert total_index_bytes < total_data_bytes, (total_index_bytes, total_data_bytes)

        # Repeat with the SAME row count but EIGHT input partitions: eight map tasks now, so
        # eight NEW data/index files appear (a new shuffle id, so no filename collision with the
        # first run) — the file count tracks map-task count, not the data volume, which is
        # identical both times. Diff against the first run's files rather than resetting the
        # directory: Spark's BlockManager already created internal subdirectories under work_dir
        # and expects them to still be there for later shuffle writes.
        data_files_before, index_files_before = set(data_files), set(index_files)
        df8 = spark.range(0, 1_000_000, numPartitions=8)
        grouped8 = df8.groupBy((col("id") % 97).alias("bucket")).count()
        rows8 = grouped8.collect()
        assert len(rows8) == 97, len(rows8)

        data_files_all, index_files_all = shuffle_files(work_dir)
        data_files8 = set(data_files_all) - data_files_before
        index_files8 = set(index_files_all) - index_files_before
        assert len(data_files8) == 8, len(data_files8)
        assert len(index_files8) == 8, len(index_files8)

        # Logical block count: every map task's one file holds a span for every reduce bucket, so
        # the fetch side sees M (map tasks) times R (reduce buckets) logical blocks, not M plus R.
        num_buckets = 97
        logical_blocks = len(data_files) * num_buckets
        assert logical_blocks == 388, logical_blocks

        print(f"4 map tasks: {len(data_files)} shuffle data files, {len(index_files)} index files")
        print(f"  data bytes: {total_data_bytes}, index bytes: {total_index_bytes}")
        print(f"8 map tasks, identical row count: {len(data_files8)} new data files, {len(index_files8)} new index files")
        print(f"logical blocks (4 map tasks x {num_buckets} buckets): {logical_blocks}")

        spark.stop()
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
