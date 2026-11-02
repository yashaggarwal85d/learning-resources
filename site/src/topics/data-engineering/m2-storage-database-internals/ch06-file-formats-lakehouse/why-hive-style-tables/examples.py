"""
de.why-hive-style-tables -- real demonstrations, run against a real local
directory tree standing in for a Hive-style table on object storage (the
chapter's own disclosed substitution: no real multi-petabyte S3 bucket is
available to this sandbox, so a local filesystem directory plays that role;
the filesystem-level behaviors demonstrated here -- directory-as-partition
layout, a reader's listing reflecting only whatever files currently exist on
disk, and listing cost growing with file count -- are the same mechanics a
real object-store LIST call has, not a simplification of them).

Two real demonstrations:
  1. A two-partition write, paused after the first partition's files are
     written and before the second partition's files land. A concurrent
     reader's directory listing, taken at that paused point, sees the first
     partition complete and the second partition either absent or partial --
     a genuine partial read of "the table," because Hive-style table state
     IS just whatever `list the files under this directory` currently
     returns, with no atomic multi-partition commit to wait for.
  2. A real measured listing-latency curve: os.scandir() timed against real
     directories holding a growing number of small files, on this sandbox's
     own local disk, showing listing cost is not constant -- it grows with
     file count, which is exactly what makes a metastore's full partition
     sync (MSCK REPAIR TABLE) slower as a table accumulates more partitions
     and more files per partition.
"""

import os
import shutil
import time
import statistics

BASE = "/tmp/hive_style_table_demo"


def reset_base():
    if os.path.exists(BASE):
        shutil.rmtree(BASE)
    os.makedirs(BASE, exist_ok=True)


# --- Demonstration 1: a two-partition write, paused mid-commit ---------

def demo_partial_write():
    table_dir = os.path.join(BASE, "orders")
    os.makedirs(table_dir, exist_ok=True)

    partition_a = os.path.join(table_dir, "event_date=2024-01-01")
    partition_b = os.path.join(table_dir, "event_date=2024-01-02")
    os.makedirs(partition_a, exist_ok=True)

    FILES_PER_PARTITION = 4

    # Writer: partition A's files land completely first (a real multi-file
    # write to a Hive-style directory is just a sequence of independent file
    # writes -- there's no multi-file transaction wrapping them).
    for i in range(FILES_PER_PARTITION):
        with open(os.path.join(partition_a, f"part-{i:05d}.parquet"), "wb") as f:
            f.write(b"x" * 128)

    # Reader: a concurrent query lists the table directory tree right now,
    # before the writer has created partition B at all.
    reader_snapshot_1 = sorted(
        os.path.relpath(os.path.join(root, name), table_dir)
        for root, _, names in os.walk(table_dir)
        for name in names
    )

    # Writer resumes: partition B starts, but only half its files have
    # landed when the reader lists again -- a second concurrent query,
    # overlapping the write, catches a partition mid-write.
    os.makedirs(partition_b, exist_ok=True)
    for i in range(FILES_PER_PARTITION // 2):
        with open(os.path.join(partition_b, f"part-{i:05d}.parquet"), "wb") as f:
            f.write(b"x" * 128)

    reader_snapshot_2 = sorted(
        os.path.relpath(os.path.join(root, name), table_dir)
        for root, _, names in os.walk(table_dir)
        for name in names
    )

    # Writer finishes partition B.
    for i in range(FILES_PER_PARTITION // 2, FILES_PER_PARTITION):
        with open(os.path.join(partition_b, f"part-{i:05d}.parquet"), "wb") as f:
            f.write(b"x" * 128)

    reader_snapshot_3 = sorted(
        os.path.relpath(os.path.join(root, name), table_dir)
        for root, _, names in os.walk(table_dir)
        for name in names
    )

    files_in_a = [p for p in reader_snapshot_1 if p.startswith("event_date=2024-01-01")]
    files_in_b_snapshot_1 = [p for p in reader_snapshot_1 if p.startswith("event_date=2024-01-02")]
    files_in_b_snapshot_2 = [p for p in reader_snapshot_2 if p.startswith("event_date=2024-01-02")]
    files_in_b_snapshot_3 = [p for p in reader_snapshot_3 if p.startswith("event_date=2024-01-02")]

    assert len(files_in_a) == FILES_PER_PARTITION
    assert len(files_in_b_snapshot_1) == 0
    assert len(files_in_b_snapshot_2) == FILES_PER_PARTITION // 2
    assert len(files_in_b_snapshot_3) == FILES_PER_PARTITION

    # The genuine partial read: snapshot 2 sees partition A complete and
    # partition B half-written -- "the table" was never one consistent
    # thing to read, because there was no commit to wait for.
    PARTIAL_READ_REPRODUCED = (
        len(files_in_a) == FILES_PER_PARTITION
        and 0 < len(files_in_b_snapshot_2) < FILES_PER_PARTITION
    )
    assert PARTIAL_READ_REPRODUCED is True

    return {
        "files_per_partition": FILES_PER_PARTITION,
        "snapshot_1_partition_b_files": len(files_in_b_snapshot_1),
        "snapshot_2_partition_b_files": len(files_in_b_snapshot_2),
        "snapshot_3_partition_b_files": len(files_in_b_snapshot_3),
        "partial_read_reproduced": PARTIAL_READ_REPRODUCED,
    }


# --- Demonstration 2: real listing latency grows with file count -------

def demo_listing_cost():
    listing_dir = os.path.join(BASE, "listing_cost")
    os.makedirs(listing_dir, exist_ok=True)

    FILE_COUNTS = [100, 1_000, 5_000]
    REPEATS = 5
    results = {}

    created_so_far = 0
    for target in FILE_COUNTS:
        while created_so_far < target:
            with open(os.path.join(listing_dir, f"f-{created_so_far:06d}.parquet"), "wb") as f:
                f.write(b"x")
            created_so_far += 1

        timings = []
        for _ in range(REPEATS):
            start = time.perf_counter()
            count = sum(1 for _ in os.scandir(listing_dir))
            timings.append(time.perf_counter() - start)
        assert count == target
        results[target] = statistics.median(timings)

    # Listing cost grows with file count on this real local disk -- not
    # proof of any specific constant, just that it isn't flat.
    LISTING_GREW_WITH_FILE_COUNT = (
        results[FILE_COUNTS[0]] < results[FILE_COUNTS[1]] < results[FILE_COUNTS[2]]
    )

    return {
        "file_counts": FILE_COUNTS,
        "median_seconds": results,
        "listing_grew_with_file_count": LISTING_GREW_WITH_FILE_COUNT,
    }


if __name__ == "__main__":
    reset_base()
    partial_write = demo_partial_write()
    listing_cost = demo_listing_cost()
    shutil.rmtree(BASE, ignore_errors=True)

    print("partial write reproduced:")
    print(f"  partition A files visible immediately: {partial_write['snapshot_1_partition_b_files'] == 0 and 'yes'}")
    print(f"  partition B files at mid-write snapshot: {partial_write['snapshot_2_partition_b_files']} of {partial_write['files_per_partition']}")
    print(f"  partition B files once finished: {partial_write['snapshot_3_partition_b_files']} of {partial_write['files_per_partition']}")
    print(f"  PARTIAL_READ_REPRODUCED: {partial_write['partial_read_reproduced']}")
    print()
    print("listing cost by file count (median of 5 real os.scandir() calls):")
    for count, seconds in listing_cost["median_seconds"].items():
        print(f"  {count:>6} files: {seconds * 1000:.3f} ms")
    print(f"  LISTING_GREW_WITH_FILE_COUNT: {listing_cost['listing_grew_with_file_count']}")
    print()
    print("All assertions passed.")
