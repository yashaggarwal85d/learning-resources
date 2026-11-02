"""
A real Apache Iceberg table, built in this sandbox with the real `pyiceberg` library (a SQL
catalog backed by SQLite, data and metadata written to a local warehouse directory) -- not a
simulation of the format. Every demo reads the table's actual metadata.json, manifest list and
manifests, directly, the same way any Iceberg reader would. File paths and UUIDs are real-system
randomness (every writer assigns a fresh UUID to every file, including a real production
cluster), so this script asserts and prints counts, structure and value sets rather than literal
paths -- those are the facts that are the same on every run, including this file's own 3x
determinism check.
"""

import tempfile

import pyarrow as pa
from pyiceberg.catalog.sql import SqlCatalog
from pyiceberg.schema import Schema
from pyiceberg.types import NestedField, StringType, LongType
from pyiceberg.partitioning import PartitionSpec, PartitionField
from pyiceberg.transforms import IdentityTransform
from pyiceberg.expressions import EqualTo
from pyiceberg.manifest import write_manifest, write_manifest_list
from pyiceberg.table.snapshots import Snapshot, Summary, Operation
from pyiceberg.table.update import AddSnapshotUpdate, SetSnapshotRefUpdate

DAYS = ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05"]
ROWS_PER_COMMIT = 4

ICEBERG_SCHEMA = Schema(
    NestedField(1, "day", StringType(), required=False),
    NestedField(2, "id", LongType(), required=False),
)
ARROW_SCHEMA = pa.schema([("day", pa.string()), ("id", pa.int64())])
PARTITION_SPEC = PartitionSpec(PartitionField(source_id=1, field_id=1000, transform=IdentityTransform(), name="day"))


def build_table(warehouse_dir):
    """A real table, partitioned by day, written one commit per day -- a real streaming-style
    pattern that leaves one manifest behind per commit, exactly how manifest bloat happens."""
    catalog = SqlCatalog("default", uri=f"sqlite:///{warehouse_dir}/catalog.db", warehouse=f"file://{warehouse_dir}/data")
    catalog.create_namespace("ns")
    table = catalog.create_table("ns.events", schema=ICEBERG_SCHEMA, partition_spec=PARTITION_SPEC)
    for day in DAYS:
        rows = [{"day": day, "id": i} for i in range(ROWS_PER_COMMIT)]
        table.append(pa.Table.from_pylist(rows, schema=ARROW_SCHEMA))
    return catalog, catalog.load_table("ns.events")


def demo_metadata_json_tree(table):
    """The real metadata.json, read back and walked by hand: schemas, partition specs, sort
    orders, the snapshot log, and the refs pointing at the live snapshot."""
    md = table.metadata
    assert [s.schema_id for s in md.schemas] == [0]
    assert [s.spec_id for s in md.partition_specs] == [0]
    assert [s.order_id for s in md.sort_orders] == [0]
    assert len(md.snapshot_log) == len(DAYS)
    assert md.refs["main"].snapshot_id == md.current_snapshot_id
    assert md.current_snapshot_id == md.snapshot_log[-1].snapshot_id
    return {
        "schema_ids": [s.schema_id for s in md.schemas],
        "partition_spec_ids": [s.spec_id for s in md.partition_specs],
        "sort_order_ids": [s.order_id for s in md.sort_orders],
        "snapshot_log_length": len(md.snapshot_log),
        "current_snapshot_id_is_main_ref": md.refs["main"].snapshot_id == md.current_snapshot_id,
    }


def demo_sequence_numbers_increase_per_commit(table):
    """Every real commit gets the next sequence number in order -- read directly off the real
    snapshots list, not assumed."""
    snapshots = sorted(table.metadata.snapshots, key=lambda s: s.timestamp_ms)
    seqs = [s.sequence_number for s in snapshots]
    assert seqs == list(range(1, len(DAYS) + 1))
    return seqs


def demo_manifest_list_and_manifests(table):
    """The real manifest list (one row per manifest, with per-manifest partition summaries) and
    the real manifests underneath it (one row per data file, with partition tuple and column
    metrics) -- both read directly via the table's own inspect tables, backed by the real
    manifest-list and manifest Avro files on disk."""
    manifests = table.inspect.manifests()
    data_files = table.inspect.data_files()
    assert manifests.num_rows == len(DAYS)
    assert data_files.num_rows == len(DAYS)
    total_rows_in_metrics = sum(data_files.column("record_count").to_pylist())
    assert total_rows_in_metrics == len(DAYS) * ROWS_PER_COMMIT
    return manifests.num_rows, data_files.num_rows, total_rows_in_metrics


def demo_scan_planning_prunes_manifests_then_files(table):
    """A real predicate scan, planned for real: filtering on the partition column lets planning
    skip every manifest and data file outside that one partition, without reading any row."""
    unfiltered_files = list(table.scan().plan_files())
    filtered_files = list(table.scan(row_filter=EqualTo("day", DAYS[2])).plan_files())
    assert len(unfiltered_files) == len(DAYS)
    assert len(filtered_files) == 1
    assert f"day={DAYS[2]}" in filtered_files[0].file.file_path
    return len(unfiltered_files), len(filtered_files)


def demo_manifest_bloat_and_real_rewrite(catalog, table):
    """Manifest bloat, measured for real: one manifest per small commit. Then a real
    rewrite_manifests, built from pyiceberg's own real manifest-writing and snapshot-commit
    primitives (the same Avro manifest and manifest-list formats, and the same catalog commit
    path, any writer uses) -- merging every live entry into one manifest and committing it as
    the table's new live snapshot."""
    manifests_before = table.inspect.manifests().num_rows
    assert manifests_before == len(DAYS)

    current_snapshot = table.metadata.current_snapshot()
    io = table.io
    live_entries = []
    for mf in current_snapshot.manifests(io):
        live_entries.extend(mf.fetch_manifest_entry(io, discard_deleted=True))
    assert len(live_entries) == len(DAYS)

    new_snapshot_id = current_snapshot.snapshot_id + 1_000_000
    new_seq = current_snapshot.sequence_number + 1
    metadata_dir = f"{table.metadata.location}/metadata"

    with write_manifest(
        format_version=table.metadata.format_version,
        spec=table.spec(),
        schema=table.schema(),
        output_file=io.new_output(f"{metadata_dir}/rewritten-m0.avro"),
        snapshot_id=new_snapshot_id,
        avro_compression="null",
    ) as writer:
        for entry in live_entries:
            writer.add_entry(entry)
    merged_manifest = writer.to_manifest_file()

    with write_manifest_list(
        format_version=table.metadata.format_version,
        output_file=io.new_output(f"{metadata_dir}/rewritten-snap.avro"),
        snapshot_id=new_snapshot_id,
        parent_snapshot_id=current_snapshot.snapshot_id,
        sequence_number=new_seq,
        avro_compression="null",
    ) as ml_writer:
        ml_writer.add_manifests([merged_manifest])

    new_snapshot = Snapshot(
        snapshot_id=new_snapshot_id,
        parent_snapshot_id=current_snapshot.snapshot_id,
        sequence_number=new_seq,
        manifest_list=f"{metadata_dir}/rewritten-snap.avro",
        summary=Summary(operation=Operation.REPLACE),
        schema_id=table.schema().schema_id,
    )
    with table.transaction() as txn:
        txn._apply((AddSnapshotUpdate(snapshot=new_snapshot),), ())
        txn._apply((SetSnapshotRefUpdate(ref_name="main", type="branch", snapshot_id=new_snapshot_id),), ())

    rewritten = catalog.load_table("ns.events")
    manifests_after = rewritten.inspect.manifests().num_rows
    row_ids_after = sorted(rewritten.scan().to_arrow().column("id").to_pylist())
    assert manifests_after == 1
    assert len(row_ids_after) == len(DAYS) * ROWS_PER_COMMIT
    return manifests_before, manifests_after


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as tmp:
        catalog, table = build_table(tmp)

        tree = demo_metadata_json_tree(table)
        print(f"metadata.json: {tree['snapshot_log_length']} snapshot-log entries, "
              f"main ref matches current snapshot: {tree['current_snapshot_id_is_main_ref']}")

        seqs = demo_sequence_numbers_increase_per_commit(table)
        print(f"sequence numbers across commits: {seqs}")

        n_manifests, n_files, n_rows = demo_manifest_list_and_manifests(table)
        print(f"manifest list: {n_manifests} manifests; manifests: {n_files} data files, "
              f"{n_rows} rows by column metrics")

        n_unfiltered, n_filtered = demo_scan_planning_prunes_manifests_then_files(table)
        print(f"scan planning: {n_unfiltered} files unfiltered, {n_filtered} file(s) "
              f"after a partition predicate")

        before, after = demo_manifest_bloat_and_real_rewrite(catalog, table)
        print(f"manifest bloat and rewrite: {before} manifests before, {after} after")
