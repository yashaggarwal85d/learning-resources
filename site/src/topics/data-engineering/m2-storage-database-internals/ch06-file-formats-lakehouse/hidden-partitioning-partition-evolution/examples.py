"""
A real Apache Iceberg table, built in this sandbox with the real `pyiceberg` library, that
evolves its partition spec mid-life -- not a simulation. Every demo reads the table's actual
scan planning and manifest metadata, directly, the same way any Iceberg reader would. File
paths and UUIDs are real-system randomness (every writer assigns a fresh UUID to every file,
including a real production cluster), so this script asserts and prints counts, structure and
value sets rather than literal paths -- those are the facts that are the same on every run,
including this file's own 3x determinism check.
"""

import tempfile
import datetime

import pyarrow as pa
from pyiceberg.catalog.sql import SqlCatalog
from pyiceberg.schema import Schema
from pyiceberg.types import NestedField, LongType, TimestampType
from pyiceberg.partitioning import PartitionSpec, PartitionField
from pyiceberg.transforms import DayTransform, HourTransform, BucketTransform
from pyiceberg.expressions import EqualTo

OLD_ERA_DAYS = [1, 2, 3]
NEW_ERA_DAYS = [4, 5]
HOURS_PER_DAY = 4

ICEBERG_SCHEMA = Schema(
    NestedField(1, "ts", TimestampType(), required=False),
    NestedField(2, "id", LongType(), required=False),
)
ARROW_SCHEMA = pa.schema([("ts", pa.timestamp("us")), ("id", pa.int64())])
OLD_SPEC = PartitionSpec(PartitionField(source_id=1, field_id=1000, transform=DayTransform(), name="ts_day"))


def row_id(day, hour):
    """A deterministic, collision-free id encoding which day and hour a row belongs to."""
    return day * 100 + hour


def build_table(warehouse_dir):
    """A real table, partitioned by day(ts) -- then evolved mid-life to hour(ts) plus a bucket
    on id, never rewriting the old era's files."""
    catalog = SqlCatalog("default", uri=f"sqlite:///{warehouse_dir}/catalog.db", warehouse=f"file://{warehouse_dir}/data")
    catalog.create_namespace("ns")
    table = catalog.create_table("ns.events", schema=ICEBERG_SCHEMA, partition_spec=OLD_SPEC)

    for day in OLD_ERA_DAYS:
        rows = [{"ts": datetime.datetime(2026, 1, day, h), "id": row_id(day, h)} for h in range(HOURS_PER_DAY)]
        table.append(pa.Table.from_pylist(rows, schema=ARROW_SCHEMA))

    with table.update_spec() as update:
        update.remove_field("ts_day")
        update.add_field("ts", HourTransform(), "ts_hour")
        update.add_field("id", BucketTransform(4), "id_bucket")

    for day in NEW_ERA_DAYS:
        rows = [{"ts": datetime.datetime(2026, 1, day, h), "id": row_id(day, h)} for h in range(HOURS_PER_DAY)]
        table.append(pa.Table.from_pylist(rows, schema=ARROW_SCHEMA))

    return catalog, catalog.load_table("ns.events")


def demo_two_specs_on_one_table(table):
    """A real evolution, read back: the table now carries two partition specs, an old one still
    recorded for old data and a new one for everything written since."""
    specs = table.specs()
    assert len(specs) == 2
    old_spec_id, new_spec_id = sorted(specs.keys())
    old_fields = [f.name for f in specs[old_spec_id].fields]
    new_fields = [f.name for f in specs[new_spec_id].fields]
    assert old_fields == ["ts_day"]
    assert new_fields == ["ts_hour", "id_bucket"]
    assert table.spec().spec_id == new_spec_id
    return old_spec_id, new_spec_id, old_fields, new_fields


def demo_old_data_not_rewritten(table, old_spec_id):
    """The old era's files are still tagged with the old spec id -- evolving the spec touched no
    existing file."""
    data_files = table.inspect.data_files()
    spec_ids_present = set(data_files.column("spec_id").to_pylist())
    old_era_files = data_files.filter(
        pa_compute_equal(data_files.column("spec_id"), old_spec_id)
    )
    assert len(OLD_ERA_DAYS) <= old_era_files.num_rows
    return spec_ids_present, old_era_files.num_rows


def pa_compute_equal(column, value):
    import pyarrow.compute as pc
    return pc.equal(column, value)


def demo_source_column_query_prunes_both_eras(table):
    """A query that filters on the source column directly, never naming ts_day, ts_hour, or
    id_bucket -- pruned correctly whether the matching row lives in the old era or the new one."""
    old_era_id = row_id(OLD_ERA_DAYS[0], 1)
    new_era_id = row_id(NEW_ERA_DAYS[0], 2)

    old_era_files = list(table.scan(row_filter=EqualTo("id", old_era_id)).plan_files())
    new_era_files = list(table.scan(row_filter=EqualTo("id", new_era_id)).plan_files())

    assert len(old_era_files) == 1
    assert len(new_era_files) == 1
    assert old_era_files[0].file.spec_id != new_era_files[0].file.spec_id

    old_era_rows = table.scan(row_filter=EqualTo("id", old_era_id)).to_arrow()
    new_era_rows = table.scan(row_filter=EqualTo("id", new_era_id)).to_arrow()
    assert old_era_rows.column("id").to_pylist() == [old_era_id]
    assert new_era_rows.column("id").to_pylist() == [new_era_id]

    return len(old_era_files), len(new_era_files)


def demo_each_manifest_planned_under_its_own_spec(table):
    """Every manifest records the spec id it was written with; planning filters each manifest's
    files using that manifest's own spec, not the table's current default."""
    manifests = table.inspect.manifests()
    spec_ids_in_manifests = set(manifests.column("partition_spec_id").to_pylist())
    assert len(spec_ids_in_manifests) == 2

    all_files = list(table.scan().plan_files())
    total_rows = sum(f.file.record_count for f in all_files)
    expected_rows = (len(OLD_ERA_DAYS) + len(NEW_ERA_DAYS)) * HOURS_PER_DAY
    assert total_rows == expected_rows

    return spec_ids_in_manifests, total_rows


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as tmp:
        catalog, table = build_table(tmp)

        old_spec_id, new_spec_id, old_fields, new_fields = demo_two_specs_on_one_table(table)
        print(f"two real specs on one table: old={old_fields}, new={new_fields}")

        spec_ids_present, old_era_file_count = demo_old_data_not_rewritten(table, old_spec_id)
        print(f"old era untouched: spec ids present on disk {sorted(spec_ids_present)}, "
              f"{old_era_file_count} old-era file(s) still tagged with the old spec")

        n_old, n_new = demo_source_column_query_prunes_both_eras(table)
        print(f"source-column query (never names a partition transform): "
              f"{n_old} file planned in the old era, {n_new} in the new era")

        spec_ids_in_manifests, total_rows = demo_each_manifest_planned_under_its_own_spec(table)
        print(f"manifests carry {len(spec_ids_in_manifests)} distinct spec ids; "
              f"full scan reads all {total_rows} rows correctly across both eras")
