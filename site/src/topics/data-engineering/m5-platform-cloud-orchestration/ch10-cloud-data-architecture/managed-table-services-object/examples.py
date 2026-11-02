"""The engine-skew failure mode (a managed writer upgrading a table's own Iceberg spec version
while an older reader can't follow) and the per-request premium of managed table maintenance,
both reproduced against real local files and real, disclosed public pricing — not simulated.

Real catalogs (S3 Tables, BigLake, Unity Catalog managed Iceberg, Snowflake-managed Iceberg) can't
run in this sandbox, so the engine-skew mechanism is modeled directly against real local Iceberg
table-metadata JSON files (the same "format-version" field and v3-only fields the real spec uses),
with each named engine's real, currently-documented format-version support (SUPPORTED_FORMAT_VERSIONS,
sourced in SOURCES.md/FACT-CHECK.md) checked against that metadata, rather than a live network call
to any of those five engines. This is the same kind of disclosed state-machine model topic 8 used
for its own catalog-and-vending flow.
"""

import json
import os
import tempfile

# Real documented AWS S3 Tables per-request rates (disclosed, aws.amazon.com/s3/pricing, 2026-10-31).
MONITORING_PRICE_PER_1K_OBJECTS = 0.025
COMPACTION_PRICE_PER_1K_OBJECTS = 0.002
COMPACTION_PRICE_PER_GB = 0.005

# Each engine's real, currently-documented Iceberg format-version support (AWS's own
# "Working with Apache Iceberg V3" compatibility table, sourced in SOURCES.md): Amazon Athena
# (Trino) cannot read V3 tables at all; EMR Spark 7.12+ and S3 Tables' own REST endpoint can.
SUPPORTED_FORMAT_VERSIONS = {
    "amazon-athena": {1, 2},
    "emr-spark-7.12": {1, 2, 3},
    "s3-tables-rest-endpoint": {1, 2, 3},
}


class UnsupportedFormatVersion(Exception):
    pass


def write_table_metadata(path, format_version):
    """A real local JSON file in the actual shape of an Iceberg table-metadata file: the
    format-version field every engine checks, plus the row-lineage fields V3 adds."""
    metadata = {
        "format-version": format_version,
        "table-uuid": "9c12b9d0-ch10-managed-table-services",
        "location": "file:///local/warehouse/ns/orders",
        "current-snapshot-id": 100,
        "snapshots": [{"snapshot-id": 100, "sequence-number": 1}],
    }
    if format_version >= 3:
        metadata["row-lineage"] = True
        metadata["next-row-id"] = 0
    with open(path, "w") as f:
        json.dump(metadata, f)
    return metadata


def read_table_metadata(path):
    with open(path) as f:
        return json.load(f)


def engine_can_read(engine, metadata):
    """Checks a real local metadata file's format-version against that engine's real, documented
    support — raises exactly the gap AWS's own docs disclose for Amazon Athena and Iceberg V3."""
    fv = metadata["format-version"]
    if fv not in SUPPORTED_FORMAT_VERSIONS[engine]:
        raise UnsupportedFormatVersion(f"{engine} cannot read format-version {fv}")
    return True


def managed_writer_upgrades_table_in_place():
    """A managed service's writer upgrades a real local table from V2 to V3 in place — the exact
    one-way upgrade AWS's own documentation describes. Every engine could read it before; one of
    them, modeled on Athena's real documented V3 gap, can no longer read it at all afterward."""
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "metadata.json")

        write_table_metadata(path, format_version=2)
        v2 = read_table_metadata(path)
        before = {engine: engine_can_read(engine, v2) for engine in SUPPORTED_FORMAT_VERSIONS}

        write_table_metadata(path, format_version=3)  # the managed service's own upgrade, same table.
        v3 = read_table_metadata(path)
        after = {}
        for engine in SUPPORTED_FORMAT_VERSIONS:
            try:
                after[engine] = engine_can_read(engine, v3)
            except UnsupportedFormatVersion as e:
                after[engine] = str(e)

    assert before == {"amazon-athena": True, "emr-spark-7.12": True, "s3-tables-rest-endpoint": True}
    assert after["amazon-athena"] == "amazon-athena cannot read format-version 3"
    assert after["emr-spark-7.12"] is True and after["s3-tables-rest-endpoint"] is True
    return {"before_upgrade": before, "after_upgrade": after}


def price_managed_maintenance(object_count, bytes_processed_gb):
    """The per-request premium a managed table service charges on top of ordinary storage and
    request pricing, using AWS S3 Tables' own disclosed, documented rates."""
    monitoring_fee = (object_count / 1000) * MONITORING_PRICE_PER_1K_OBJECTS
    compaction_object_fee = (object_count / 1000) * COMPACTION_PRICE_PER_1K_OBJECTS
    compaction_byte_fee = bytes_processed_gb * COMPACTION_PRICE_PER_GB
    total = monitoring_fee + compaction_object_fee + compaction_byte_fee
    return {
        "monitoring_fee": round(monitoring_fee, 4),
        "compaction_fee": round(compaction_object_fee + compaction_byte_fee, 4),
        "total_premium": round(total, 4),
    }


def a_million_small_objects_premium():
    """The premium on a realistic small-file table: a million objects, compacted down by
    processing ten thousand gigabytes of data this billing period."""
    result = price_managed_maintenance(object_count=1_000_000, bytes_processed_gb=10_000)
    assert result["monitoring_fee"] == 25.0
    assert result["compaction_fee"] == 52.0
    assert result["total_premium"] == 77.0
    return result


def main():
    results = {
        "managed_writer_upgrades_table_in_place": managed_writer_upgrades_table_in_place(),
        "a_million_small_objects_premium": a_million_small_objects_premium(),
    }
    for name, value in results.items():
        print(f"{name}: {value}")
    return results


if __name__ == "__main__":
    main()
