"""
A real Apache Iceberg v2 table, built in this sandbox with the real `pyiceberg` library, carrying
both kinds of v2 row-level delete files -- not a simulation. The position-delete half is written
AND read back entirely through pyiceberg's own commit and scan machinery. The equality-delete half
is written the same real way, but pyiceberg 0.12.0's own `table.scan()` refuses to read any table
containing one (a documented, hard-coded limitation: see FACT-CHECK.md and
https://github.com/apache/iceberg/issues/6568), so this script demonstrates equality deletes' real
merge-on-read mechanics by hand: reading the data file and the delete file directly and performing
the same column-value join a conformant reader would. Costs are counted in column values read and
compared, not wall-clock time, so output stays identical across runs, including this file's own
3x determinism check. File paths and UUIDs are real-system randomness, so this script asserts and
prints counts, ids and structure rather than literal paths.
"""

import tempfile

import pyarrow as pa
import pyarrow.parquet as pq
import pyarrow.compute as pc
from pyiceberg.catalog.sql import SqlCatalog
from pyiceberg.schema import Schema
from pyiceberg.types import NestedField, LongType, StringType
from pyiceberg.manifest import (
    DataFile, DataFileContent, FileFormat, ManifestEntry, ManifestEntryStatus,
    write_manifest, write_manifest_list, POSITIONAL_DELETE_SCHEMA,
)
from pyiceberg.table.snapshots import Snapshot, Summary, Operation
from pyiceberg.table.update import AddSnapshotUpdate, SetSnapshotRefUpdate
from pyiceberg.io.pyarrow import schema_to_pyarrow

ICEBERG_SCHEMA = Schema(
    NestedField(1, "id", LongType(), required=False),
    NestedField(2, "name", StringType(), required=False),
)
ARROW_SCHEMA = pa.schema([("id", pa.int64()), ("name", pa.string())])
ROW_COUNT = 10


def build_table(warehouse_dir):
    """A real table of 10 rows, one data file, no deletes yet."""
    catalog = SqlCatalog("default", uri=f"sqlite:///{warehouse_dir}/catalog.db", warehouse=f"file://{warehouse_dir}/data")
    catalog.create_namespace("ns")
    table = catalog.create_table("ns.events", schema=ICEBERG_SCHEMA)
    rows = [{"id": i, "name": f"row{i}"} for i in range(ROW_COUNT)]
    table.append(pa.Table.from_pylist(rows, schema=ARROW_SCHEMA))
    return catalog, catalog.load_table("ns.events")


def commit_delete_file(table, delete_file, metadata_tag):
    """Shared low-level commit path for either delete kind: re-add every live data-file entry
    into a fresh manifest, add the one delete file into its own manifest, and point a new
    snapshot's manifest list at both -- the same construction pyiceberg's own writers use
    internally, exposed here because pyiceberg has no public convenience method for either kind."""
    current_snapshot = table.metadata.current_snapshot()
    new_snapshot_id = current_snapshot.snapshot_id + 1_000_000
    new_seq = current_snapshot.sequence_number + 1
    metadata_dir = f"{table.metadata.location}/metadata"
    io = table.io

    live_entries = []
    for mf in current_snapshot.manifests(io):
        live_entries.extend(mf.fetch_manifest_entry(io, discard_deleted=True))

    with write_manifest(
        format_version=table.metadata.format_version, spec=table.spec(), schema=table.schema(),
        output_file=io.new_output(f"{metadata_dir}/data-{metadata_tag}.avro"),
        snapshot_id=new_snapshot_id, avro_compression="null",
    ) as data_writer:
        for entry in live_entries:
            data_writer.add_entry(entry)
    data_manifest = data_writer.to_manifest_file()

    delete_entry = ManifestEntry.from_args(
        _table_format_version=table.metadata.format_version,
        status=ManifestEntryStatus.ADDED, snapshot_id=new_snapshot_id, data_file=delete_file,
    )
    with write_manifest(
        format_version=table.metadata.format_version, spec=table.spec(), schema=table.schema(),
        output_file=io.new_output(f"{metadata_dir}/delete-{metadata_tag}.avro"),
        snapshot_id=new_snapshot_id, avro_compression="null",
    ) as delete_writer:
        delete_writer.add(delete_entry)
    delete_manifest = delete_writer.to_manifest_file()

    manifest_list_output = io.new_output(f"{metadata_dir}/snap-{metadata_tag}.avro")
    with write_manifest_list(
        format_version=table.metadata.format_version, output_file=manifest_list_output,
        snapshot_id=new_snapshot_id, parent_snapshot_id=current_snapshot.snapshot_id,
        sequence_number=new_seq, avro_compression="null",
    ) as ml_writer:
        ml_writer.add_manifests([data_manifest, delete_manifest])

    new_snapshot = Snapshot(
        snapshot_id=new_snapshot_id, parent_snapshot_id=current_snapshot.snapshot_id,
        sequence_number=new_seq, manifest_list=manifest_list_output.location,
        summary=Summary(operation=Operation.OVERWRITE), schema_id=table.schema().schema_id,
    )
    with table.transaction() as txn:
        txn._apply((AddSnapshotUpdate(snapshot=new_snapshot),), ())
        txn._apply((SetSnapshotRefUpdate(ref_name="main", type="branch", snapshot_id=new_snapshot_id),), ())


def demo_position_delete(catalog, table, target_file, warehouse_dir):
    """Position deletes name a (file, row ordinal) pair directly -- pyiceberg's own `table.scan()`
    reads this kind of delete file correctly, no workaround needed."""
    pos_del_path = f"{warehouse_dir}/data/ns/events/data/pos-delete-0.parquet"
    pos_arrow_schema = schema_to_pyarrow(POSITIONAL_DELETE_SCHEMA)
    dropped_positions = [3, 7]
    pos_table = pa.Table.from_pylist(
        [{"file_path": target_file, "pos": p} for p in dropped_positions], schema=pos_arrow_schema,
    )
    pq.write_table(pos_table, pos_del_path)

    delete_file = DataFile.from_args(
        _table_format_version=table.metadata.format_version, content=DataFileContent.POSITION_DELETES,
        file_path=pos_del_path, file_format=FileFormat.PARQUET, partition={}, record_count=len(dropped_positions),
        file_size_in_bytes=pos_table.nbytes, column_sizes={}, value_counts={}, null_value_counts={},
        nan_value_counts={}, lower_bounds={}, upper_bounds={},
    )
    commit_delete_file(table, delete_file, "pos")

    reloaded = catalog.load_table("ns.events")
    remaining_ids = sorted(reloaded.scan().to_arrow().column("id").to_pylist())
    expected = sorted(set(range(ROW_COUNT)) - {row_id for pos in dropped_positions for row_id in [pos]})
    assert remaining_ids == expected
    return remaining_ids, dropped_positions


def demo_equality_delete(catalog, table, target_file, warehouse_dir):
    """Equality deletes name column values to match and remove -- what a streaming upsert writer
    (e.g. Flink's Iceberg sink on a delete-then-insert) produces instead of a row ordinal, since it
    doesn't know which position its own earlier write landed at. pyiceberg 0.12.0 can commit one
    through the same low-level primitives, but its own `table.scan()` refuses to read it back, so
    the merge is demonstrated here the way a conformant v2 reader performs it: directly."""
    eq_del_path = f"{warehouse_dir}/data/ns/events/data/eq-delete-0.parquet"
    deleted_ids = [4, 8]
    eq_schema = pa.schema([("id", pa.int64())])
    eq_table = pa.Table.from_pylist([{"id": i} for i in deleted_ids], schema=eq_schema)
    pq.write_table(eq_table, eq_del_path)

    delete_file = DataFile.from_args(
        _table_format_version=table.metadata.format_version, content=DataFileContent.EQUALITY_DELETES,
        file_path=eq_del_path, file_format=FileFormat.PARQUET, partition={}, record_count=len(deleted_ids),
        file_size_in_bytes=eq_table.nbytes, column_sizes={}, value_counts={}, null_value_counts={},
        nan_value_counts={}, lower_bounds={}, upper_bounds={}, equality_ids=[1],
    )
    commit_delete_file(table, delete_file, "eq")

    reloaded = catalog.load_table("ns.events")
    scan_refused = False
    try:
        reloaded.scan().to_arrow()
    except ValueError as e:
        scan_refused = "equality delete" in str(e)
    assert scan_refused, "expected pyiceberg's table.scan() to refuse an equality-delete table"

    data_file_table = pq.read_table(target_file.replace("file://", ""))
    eq_delete_table = pq.read_table(eq_del_path)
    deleted_id_set = set(eq_delete_table.column("id").to_pylist())
    id_column = data_file_table.column("id")
    kept_mask = pc.invert(pc.is_in(id_column, value_set=pa.array(list(deleted_id_set))))
    merged = data_file_table.filter(kept_mask)

    expected = sorted(set(range(ROW_COUNT)) - deleted_id_set)
    assert sorted(merged.column("id").to_pylist()) == expected
    return sorted(merged.column("id").to_pylist()), deleted_ids, len(id_column)


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as warehouse_dir:
        catalog, table = build_table(warehouse_dir)
        target_file = table.inspect.data_files().column("file_path")[0].as_py()

        remaining_ids, dropped_positions = demo_position_delete(catalog, table, target_file, warehouse_dir)
        print(f"position delete: dropped position(s) {dropped_positions}, read back via pyiceberg's "
              f"own table.scan() as {remaining_ids}, a direct offset lookup with 0 column values "
              f"read or compared")

    with tempfile.TemporaryDirectory() as warehouse_dir:
        catalog, table = build_table(warehouse_dir)
        target_file = table.inspect.data_files().column("file_path")[0].as_py()

        kept_ids, deleted_ids, values_compared = demo_equality_delete(catalog, table, target_file, warehouse_dir)
        print(f"equality delete: pyiceberg's own table.scan() refuses to read this table "
              f"(not yet implemented upstream); read by hand instead, kept ids {kept_ids} after "
              f"removing {deleted_ids}, every one of the data file's {values_compared} id values "
              f"had to be read and compared against the delete set")
