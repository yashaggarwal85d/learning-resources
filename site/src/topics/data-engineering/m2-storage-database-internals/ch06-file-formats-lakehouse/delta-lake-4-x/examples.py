"""
Uses deltalake (the delta-rs Python binding) directly -- the Rust implementation of the Delta
protocol this whole chapter's Delta arc has been hand-building a simplified version of -- to
write, append, time-travel read, and evolve the protocol of a real local Delta table, with no
Spark cluster anywhere in this script.

Building on topic 29's own DML work, Demo 1 writes a real table and appends a second version, then reads the raw _delta_log JSON files
straight off disk to show delta-rs's own protocol action -- not this chapter's own hand-rolled log
format, the actual, independently-implemented thing. Demo 2 time-travels: reads an older version
by number while the table has already moved on, proving multi-version reads work with delta-rs
alone. Demo 3 enables two real table features -- deletion vectors and row tracking, the exact two
features topics 14-15 and 29 built by hand earlier in this chapter -- with one call, and shows the
table's real protocol numbers and feature lists jump for real. Demo 4 enables the Variant type
table feature on a fresh table, connecting back to topic 8's own Variant work.

Not reproduced in code, only sourced and narrated (SOURCES.md, FACT-CHECK.md): Delta Kernel
itself (a Java/Rust library with no Python bindings installable in this sandbox); Delta Lake
4.4's own compatibility -- Delta Spark, Delta Connect and Delta Sharing built and tested against
Spark 4.0.1, 4.1.0 and 4.2.0, with delta-iceberg_2.13 lagging at Spark 4.1 only; identity columns
and generated columns, both landing in Delta Lake 4.4; type widening, in preview since Delta Lake
3.2 and fully supported since Delta Lake 4.0; collations and the Geospatial table feature, both
landing in Delta Kernel at Delta Lake 4.2; and Variant shredding, which is still named
variantShredding-preview as of Delta Lake 4.3, not fully out of preview as CHAPTER.md's own
syllabus line claims.
"""

import json
import os
import shutil

import pyarrow as pa
from deltalake import DeltaTable, TableFeatures, write_deltalake

ROOT = "/tmp/delta_4x_demo"
shutil.rmtree(ROOT, ignore_errors=True)


def log_path(table_path, version):
    return os.path.join(table_path, "_delta_log", f"{version:020d}.json")


def read_protocol_action(table_path, version):
    with open(log_path(table_path, version)) as f:
        for line in f:
            record = json.loads(line)
            if "protocol" in record:
                return record["protocol"]
    return None


# ---------------------------------------------------------------------------
# Demo 1: write a real table with delta-rs, append a second version, read the raw commit log
# delta-rs itself wrote -- a genuinely different, independent implementation from this chapter's
# own hand-rolled logs, writing the real Delta protocol's own JSON shape.
# ---------------------------------------------------------------------------

TABLE_A = os.path.join(ROOT, "table_a")
base = pa.table(
    {
        "id": pa.array(range(1000), type=pa.int64()),
        "value": pa.array([i * 2 for i in range(1000)], type=pa.int64()),
    }
)
write_deltalake(TABLE_A, base)

appended = pa.table(
    {
        "id": pa.array(range(1000, 1010), type=pa.int64()),
        "value": pa.array([i * 2 for i in range(1000, 1010)], type=pa.int64()),
    }
)
write_deltalake(TABLE_A, appended, mode="append")

dt_a = DeltaTable(TABLE_A)
version_after_append = dt_a.version()
row_count_after_append = dt_a.to_pyarrow_table().num_rows
protocol_v0 = read_protocol_action(TABLE_A, 0)

assert version_after_append == 1
assert row_count_after_append == 1010
assert protocol_v0 == {"minReaderVersion": 1, "minWriterVersion": 2}

# ---------------------------------------------------------------------------
# Demo 2: time travel. Read version 0 (before the append) directly by version number, with the
# table already moved on to version 1 -- a real multi-version read, no Spark, no separate catalog
# session needed.
# ---------------------------------------------------------------------------

dt_a_v0 = DeltaTable(TABLE_A, version=0)
row_count_at_v0 = dt_a_v0.to_pyarrow_table().num_rows

assert row_count_at_v0 == 1000
assert row_count_at_v0 != row_count_after_append

# ---------------------------------------------------------------------------
# Demo 3: enable two real table features this chapter already built by hand -- deletion vectors
# (topics 14-15) and row tracking (topic 29) -- with one call, and show the table's real protocol
# numbers and feature lists jump for real, written by delta-rs itself.
# ---------------------------------------------------------------------------

TABLE_B = os.path.join(ROOT, "table_b")
write_deltalake(TABLE_B, base)
protocol_before_features = read_protocol_action(TABLE_B, 0)

dt_b = DeltaTable(TABLE_B)
dt_b.alter.add_feature(
    [TableFeatures.DeletionVectors, TableFeatures.RowTracking],
    allow_protocol_versions_increase=True,
)
protocol_after_features = read_protocol_action(TABLE_B, 1)

assert protocol_before_features == {"minReaderVersion": 1, "minWriterVersion": 2}
assert protocol_after_features["minReaderVersion"] == 3
assert protocol_after_features["minWriterVersion"] == 7
assert sorted(protocol_after_features["writerFeatures"]) == ["deletionVectors", "rowTracking"]
assert protocol_after_features["readerFeatures"] == ["deletionVectors"]

# ---------------------------------------------------------------------------
# Demo 4: enable the Variant type table feature on a fresh table -- the same real protocol
# mechanism, naming the exact feature this chapter's topic 8 (de.variant-type-semi-structured)
# built the encoding for, now switched on through delta-rs with one call.
# ---------------------------------------------------------------------------

TABLE_C = os.path.join(ROOT, "table_c")
write_deltalake(TABLE_C, base)
dt_c = DeltaTable(TABLE_C)
dt_c.alter.add_feature([TableFeatures.VariantType], allow_protocol_versions_increase=True)
protocol_variant = read_protocol_action(TABLE_C, 1)

assert protocol_variant["writerFeatures"] == ["variantType"]
assert protocol_variant["readerFeatures"] == ["variantType"]


if __name__ == "__main__":
    print(
        f"delta-rs wrote a real table, appended a version: "
        f"version {version_after_append}, {row_count_after_append} rows"
    )
    print(f"raw _delta_log v0 protocol action, written by delta-rs itself: {protocol_v0}")
    print(
        f"time travel to version 0: {row_count_at_v0} rows "
        f"(table's current version has {row_count_after_append})"
    )
    print(f"protocol before enabling features: {protocol_before_features}")
    print(f"protocol after enabling deletion vectors + row tracking: {protocol_after_features}")
    print(f"protocol after enabling the Variant type feature: {protocol_variant}")
    print("All assertions passed.")
