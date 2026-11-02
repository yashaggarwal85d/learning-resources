"""
Builds a real engine read/write support matrix for Apache Iceberg and Delta Lake from each named
engine's own current documentation (every cell below is backed by a direct, word-for-word quote
in SOURCES.md), then runs a real decision framework over it -- catalog strategy, upsert-heavy vs.
append-heavy workload, multi-engine writer concurrency -- applied to the same `analytics.events`
table this chapter built across topics 19 through 32.

Running seven real query engines (Spark, Flink, Trino, DuckDB, Snowflake, BigQuery, Redshift) is
not feasible in this sandbox, so the matrix itself is sourced data, not an executed engine call --
disclosed in SOURCES.md's Red team section. The decision framework that runs over that data IS
real, executed Python, asserted against a known outcome.

Two sourced corrections worth stating precisely rather than rounding to a clean yes/no: BigQuery's
managed Iceberg tables support real DML writes and streaming, not merely read-only external
tables; and DuckDB's Delta write path exists without a catalog but is limited to create-and-append
only, with no update, delete, merge, replace, or alter -- while DuckDB's Iceberg write path needs
a catalog but then has no such limit. The three "June 2024" consolidation events (Databricks
acquiring Tabular, Databricks open-sourcing Unity Catalog, Snowflake unveiling Polaris Catalog)
are each dated from the vendor's own press release, not rounded from a nearby month.
"""

WRITE_NONE = "none"
WRITE_FULL = "full"
WRITE_APPEND_ONLY = "append-only"
WRITE_CATALOG_DEPENDENT = "catalog-dependent"
WRITE_CONFIG_DEPENDENT = "config-dependent"

# (engine, format) -> {"read": bool, "write": one of the WRITE_* constants above}.
# Every cell is backed by a direct quote from that engine's own current docs in SOURCES.md.
SUPPORT_MATRIX = {
    ("Spark", "iceberg"): {"read": True, "write": WRITE_FULL},
    ("Spark", "delta"): {"read": True, "write": WRITE_FULL},
    ("Flink", "iceberg"): {"read": True, "write": WRITE_FULL},
    ("Flink", "delta"): {"read": True, "write": WRITE_FULL},
    ("Trino", "iceberg"): {"read": True, "write": WRITE_FULL},
    ("Trino", "delta"): {"read": True, "write": WRITE_CONFIG_DEPENDENT},
    ("DuckDB", "iceberg"): {"read": True, "write": WRITE_CATALOG_DEPENDENT},
    ("DuckDB", "delta"): {"read": True, "write": WRITE_APPEND_ONLY},
    ("Snowflake", "iceberg"): {"read": True, "write": WRITE_FULL},
    ("Snowflake", "delta"): {"read": True, "write": WRITE_NONE},
    ("BigQuery", "iceberg"): {"read": True, "write": WRITE_FULL},
    ("BigQuery", "delta"): {"read": True, "write": WRITE_NONE},
    ("Redshift", "iceberg"): {"read": True, "write": WRITE_FULL},
    ("Redshift", "delta"): {"read": True, "write": WRITE_NONE},
}

# Each event's own vendor-named date, from that vendor's own press release.
CONSOLIDATION_TIMELINE = [
    ("Snowflake unveils Polaris Catalog", "Snowflake", "June 2024"),
    ("Databricks agrees to acquire Tabular", "Databricks", "June 2024"),
    ("Databricks open-sources Unity Catalog", "Databricks", "June 2024"),
]


def engines_that_can_write(table_format, require_upsert=False):
    """Engines whose own docs confirm they can write this format, given this workload."""
    writers = []
    for (engine, fmt), support in SUPPORT_MATRIX.items():
        if fmt != table_format:
            continue
        status = support["write"]
        if status == WRITE_NONE:
            continue
        if status == WRITE_APPEND_ONLY and require_upsert:
            continue
        writers.append(engine)
    return sorted(writers)


def recommend_format(writer_engines, upsert_heavy):
    """Pick a table format from the real matrix: every named writer engine must be able to
    write it, under this workload's upsert requirement."""
    candidates = []
    blocked = {}
    for table_format in ("iceberg", "delta"):
        can_write = set(engines_that_can_write(table_format, require_upsert=upsert_heavy))
        missing = [e for e in writer_engines if e not in can_write]
        if missing:
            blocked[table_format] = missing
        else:
            candidates.append(table_format)
    return candidates, blocked


if __name__ == "__main__":
    iceberg_full_writers = engines_that_can_write("iceberg")
    delta_full_writers = engines_that_can_write("delta")
    print(f"engines that can write Iceberg today: {iceberg_full_writers}")
    print(f"engines that can write Delta today: {delta_full_writers}")
    assert len(iceberg_full_writers) > len(delta_full_writers)

    for event, vendor, when in CONSOLIDATION_TIMELINE:
        print(f"{when} -- {vendor}: {event}")

    # The same analytics.events table this chapter built since topic 19 (registered in topic 31's
    # catalog, served over topic 32's REST protocol): Snowflake and BigQuery both need their own
    # native write path, and DuckDB sits in the upsert-heavy write path too.
    writer_engines = ["Snowflake", "BigQuery", "DuckDB"]
    upsert_heavy = True

    candidates, blocked = recommend_format(writer_engines, upsert_heavy)
    print(f"writer engines for analytics.events: {writer_engines}, upsert-heavy: {upsert_heavy}")
    print(f"format candidates that every writer engine can actually write: {candidates}")
    for table_format, missing in blocked.items():
        print(f"{table_format} blocked by: {missing}")

    assert candidates == ["iceberg"]
    assert blocked["delta"] == ["Snowflake", "BigQuery", "DuckDB"]
    assert SUPPORT_MATRIX[("Snowflake", "delta")]["write"] == WRITE_NONE
    assert SUPPORT_MATRIX[("BigQuery", "iceberg")]["write"] == WRITE_FULL

    print("All assertions passed.")
