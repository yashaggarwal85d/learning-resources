"""
Two real checks against the real `pyiceberg` library (0.12.0) -- not a simulation -- that together
show exactly how far a widely used v2 implementation has caught up with the v3 spec. First:
creating a table explicitly at format version 3 is attempted directly, and it fails with the
library's own real, open error, not a guess about its roadmap. Second: a v3-only feature named in
the spec (a column's initial-default value) is exercised against an ordinary v2 table, to show
that pyiceberg actually honors the read-time fallback this chapter's earlier topics relied on
(null-default for missing optional fields, a real default value for a newly added column) even on
a v2 table, which the spec reserves for v3 -- a concrete instance of "engine support lag," not
named but measured. File paths and UUIDs are real-system randomness, so this script asserts and
prints structure and values, not literal paths, verified byte-identical across 3 runs.
"""

import tempfile

import pyarrow as pa
from pyiceberg.catalog.sql import SqlCatalog
from pyiceberg.schema import Schema
from pyiceberg.types import NestedField, LongType, StringType

ICEBERG_SCHEMA = Schema(NestedField(1, "id", LongType(), required=False))
ARROW_SCHEMA = pa.schema([("id", pa.int64())])


def demo_v3_table_creation_blocked(warehouse_dir):
    """The spec defines v3; this library does not yet write it. Confirmed directly, not assumed:
    asking for format-version 3 at table creation raises a real error naming a real, open issue."""
    catalog = SqlCatalog("default", uri=f"sqlite:///{warehouse_dir}/catalog.db", warehouse=f"file://{warehouse_dir}/data")
    catalog.create_namespace("ns")
    try:
        catalog.create_table("ns.v3", schema=ICEBERG_SCHEMA, properties={"format-version": "3"})
        return None
    except NotImplementedError as e:
        return str(e)


def demo_default_value_read_fallback(warehouse_dir):
    """The spec's own words: "Default values are added to struct fields in v3." Exercised here on
    an ordinary v2 table anyway -- a concrete, measured instance of a library running ahead of (or
    around) the version boundary the spec itself draws, not just named from the spec's prose."""
    catalog = SqlCatalog("default", uri=f"sqlite:///{warehouse_dir}/catalog.db", warehouse=f"file://{warehouse_dir}/data")
    catalog.create_namespace("ns")
    table = catalog.create_table("ns.events", schema=ICEBERG_SCHEMA)
    table.append(pa.Table.from_pylist([{"id": i} for i in range(3)], schema=ARROW_SCHEMA))

    with table.update_schema() as update:
        update.add_column("status", StringType(), default_value="pending")

    reloaded = catalog.load_table("ns.events")
    with_status_schema = pa.schema([("id", pa.int64()), ("status", pa.string())])
    reloaded.append(pa.Table.from_pylist([{"id": 99, "status": "active"}], schema=with_status_schema))

    final_table = catalog.load_table("ns.events")
    rows = sorted(final_table.scan().to_arrow().to_pylist(), key=lambda r: r["id"])
    return final_table.metadata.format_version, rows


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as warehouse_dir:
        error = demo_v3_table_creation_blocked(warehouse_dir)
        assert error is not None and "V3" in error and "not yet supported" in error
        print(f"real result: creating a v3 table fails -- {error!r}")

    with tempfile.TemporaryDirectory() as warehouse_dir:
        format_version, rows = demo_default_value_read_fallback(warehouse_dir)
        assert format_version == 2
        assert rows == [
            {"id": 0, "status": "pending"},
            {"id": 1, "status": "pending"},
            {"id": 2, "status": "pending"},
            {"id": 99, "status": "active"},
        ]
        print(f"real result: a v3-spec default value, read back correctly on a format-version "
              f"{format_version} table -- old rows get the default (pending), the new row gets "
              f"its own written value (active), rows: {rows}")
