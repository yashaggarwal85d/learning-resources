"""
A real Apache Iceberg table, built in this sandbox with the real `pyiceberg` library (0.12.0) --
not a simulation. Every step uses pyiceberg's own real, public snapshot-management API
(`table.manage_snapshots()`): a real tag, a real branch, a real branch-scoped write via
`table.append(..., branch=...)`, and a real fast-forward of `main` via
`set_current_snapshot(ref_name=...)`. Two complete write-audit-publish attempts are run: one
whose validation passes and is fast-forwarded into `main`, and one whose validation genuinely
fails (a duplicate id) and is discarded without ever touching `main`. File paths and UUIDs are
real-system randomness, so this script asserts and prints counts and row sets rather than
literal paths or snapshot ids, verified byte-identical across 3 runs.
"""

import tempfile

import pyarrow as pa
from pyiceberg.catalog.sql import SqlCatalog
from pyiceberg.schema import Schema
from pyiceberg.types import NestedField, LongType, StringType

ICEBERG_SCHEMA = Schema(
    NestedField(1, "id", LongType(), required=False),
    NestedField(2, "name", StringType(), required=False),
)
ARROW_SCHEMA = pa.schema([("id", pa.int64()), ("name", pa.string())])


def build_table(warehouse_dir):
    """A real table of 5 rows, committed once to main -- the released state everything else in
    this script works from."""
    catalog = SqlCatalog("default", uri=f"sqlite:///{warehouse_dir}/catalog.db", warehouse=f"file://{warehouse_dir}/data")
    catalog.create_namespace("ns")
    table = catalog.create_table("ns.events", schema=ICEBERG_SCHEMA)
    table.append(pa.Table.from_pylist([{"id": i, "name": f"r{i}"} for i in range(5)], schema=ARROW_SCHEMA))
    return catalog, catalog.load_table("ns.events")


def demo_tag_and_branch_from_same_snapshot(catalog, table):
    """A real tag (retention/reproducibility: a fixed, named pointer that nothing moves) and a
    real branch (isolated writes: a second, independently movable pointer) are created from the
    same snapshot, through pyiceberg's own real `manage_snapshots()` API -- not a workaround."""
    released_snapshot_id = table.metadata.current_snapshot().snapshot_id
    with table.manage_snapshots() as ms:
        ms.create_tag(released_snapshot_id, "released-v1")
        ms.create_branch(released_snapshot_id, "audit")

    reloaded = catalog.load_table("ns.events")
    refs = reloaded.metadata.refs
    assert refs["released-v1"].snapshot_id == released_snapshot_id
    assert refs["audit"].snapshot_id == released_snapshot_id
    assert refs["main"].snapshot_id == released_snapshot_id
    return released_snapshot_id


def demo_wap_passes_and_publishes(catalog, table):
    """Stage: 3 new rows written to the audit branch only, through a real branch-scoped
    `table.append(..., branch="audit")` -- main is provably untouched while this happens. Audit:
    a real check (no duplicate ids) run against the staged branch. Publish: main is fast-forwarded
    to the validated branch's snapshot, through pyiceberg's own real `set_current_snapshot`."""
    table.append(pa.Table.from_pylist([{"id": i, "name": f"r{i}"} for i in range(5, 8)], schema=ARROW_SCHEMA), branch="audit")
    reloaded = catalog.load_table("ns.events")

    audit_snapshot_id = reloaded.metadata.refs["audit"].snapshot_id
    main_snapshot_id_before = reloaded.metadata.refs["main"].snapshot_id
    assert audit_snapshot_id != main_snapshot_id_before, "staging on the branch must not move main"

    staged_ids = reloaded.scan(snapshot_id=audit_snapshot_id).to_arrow().column("id").to_pylist()
    main_ids_before = reloaded.scan(snapshot_id=main_snapshot_id_before).to_arrow().column("id").to_pylist()
    assert sorted(main_ids_before) == list(range(5)), "main must still show only the original 5 rows"

    validation_passed = len(staged_ids) == len(set(staged_ids))  # no duplicate ids
    assert validation_passed

    with reloaded.manage_snapshots() as ms:
        ms.set_current_snapshot(ref_name="audit")

    published = catalog.load_table("ns.events")
    main_ids_after = sorted(published.scan().to_arrow().column("id").to_pylist())
    assert main_ids_after == sorted(staged_ids)
    assert published.metadata.current_snapshot_id == audit_snapshot_id
    return published, main_ids_before, main_ids_after


def demo_wap_fails_and_never_publishes(catalog, table):
    """A second write-audit-publish attempt, from the now-current main, stages a batch containing
    a duplicate id. The same real duplicate-id check this time fails, so the branch is discarded
    without ever fast-forwarding main -- a real rejected publish, not just a described one."""
    current_main_id = table.metadata.refs["main"].snapshot_id
    with table.manage_snapshots() as ms:
        ms.create_branch(current_main_id, "wap-bad")
    staged = catalog.load_table("ns.events")

    staged.append(pa.Table.from_pylist([{"id": 3, "name": "dup"}, {"id": 9, "name": "r9"}], schema=ARROW_SCHEMA), branch="wap-bad")
    reloaded = catalog.load_table("ns.events")
    bad_snapshot_id = reloaded.metadata.refs["wap-bad"].snapshot_id
    staged_ids = reloaded.scan(snapshot_id=bad_snapshot_id).to_arrow().column("id").to_pylist()

    validation_passed = len(staged_ids) == len(set(staged_ids))
    assert not validation_passed, "this batch must fail validation: it reintroduces id 3"

    with reloaded.manage_snapshots() as ms:
        ms.remove_branch("wap-bad")

    final = catalog.load_table("ns.events")
    assert "wap-bad" not in final.metadata.refs
    assert final.metadata.refs["main"].snapshot_id == current_main_id, "a rejected batch must never move main"
    return sorted(set(staged_ids)) if len(set(staged_ids)) != len(staged_ids) else None, len(staged_ids), len(set(staged_ids))


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as warehouse_dir:
        catalog, table = build_table(warehouse_dir)

        demo_tag_and_branch_from_same_snapshot(catalog, table)
        print("tag and branch: both created from the same snapshot via manage_snapshots(), "
              "main/released-v1/audit all point at it")

        table = catalog.load_table("ns.events")
        published, main_before, main_after = demo_wap_passes_and_publishes(catalog, table)
        print(f"write-audit-publish (passes): staged rows validated on the audit branch while "
              f"main stayed at {sorted(main_before)}, then fast-forwarded to {sorted(main_after)}")

        table = catalog.load_table("ns.events")
        _, staged_count, distinct_count = demo_wap_fails_and_never_publishes(catalog, table)
        print(f"write-audit-publish (fails): a batch of {staged_count} staged rows with only "
              f"{distinct_count} distinct ids failed validation and was discarded, never "
              f"reaching main")
