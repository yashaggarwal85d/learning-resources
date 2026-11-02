"""
This chapter's capstone lab: one real measurement, several sourced estimates applied to it.

A real local Apache Iceberg table (pyiceberg, a SQL catalog, real Parquet data files -- the same
pattern topics 31-33 and 36 used) stands in for "the same real dataset this chapter already
wrote as Iceberg." DuckDB queries it for real, with a real `EXPLAIN ANALYZE` plan and a real
bytes-scanned figure parsed from that plan's own output -- not estimated, not hand-computed.

Running that same query against a real Snowflake, BigQuery, or Redshift account is not feasible
in this sandbox (no accounts exist here, confirmed the same way as topics 37-39). So this script
takes the one number it CAN measure for real -- bytes scanned by the filtered query -- and prices
it at each warehouse's own currently published per-byte rate (BigQuery's on-demand $6.25/TiB,
Redshift Spectrum's $5/TB), producing a sourced cost estimate anchored to a real measurement, not
a literal warehouse bill. Snowflake bills virtual-warehouse compute time rather than bytes
scanned, so no comparable per-byte figure exists to apply -- that structural difference is itself
reported, not glossed over. Every rate is quoted word for word in SOURCES.md.

The five-dimension engine comparison matrix (workload isolation, concurrency/spilling,
cost-based tuning, data gravity/egress, governance/lock-in) is sourced data from each engine's
own current documentation, the same pattern topic 32's support matrix used -- disclosed in
SOURCES.md's Red team section, not an executed cross-engine benchmark.
"""

import os
import re
import shutil
import tempfile

import duckdb
import pyarrow as pa
from pyiceberg.catalog.sql import SqlCatalog

BIGQUERY_USD_PER_TIB = 6.25
REDSHIFT_SPECTRUM_USD_PER_TB = 5.00
TIB_BYTES = 1024 ** 4
TB_BYTES = 1000 ** 4

# Each cell is backed by a direct, word-for-word quote in SOURCES.md. "auto" = the vendor's own
# docs describe this as automatic/self-tuning; "manual" = administrator- or schema-driven.
COMPARISON_MATRIX = {
    "Trino": {
        "workload_isolation": "cluster-level, no built-in multi-tenant isolation primitive",
        "concurrency": "scales by adding worker nodes",
        "cost_tuning": "query-plan only (cost-based join enumeration from connector table statistics)",
        "data_gravity": "queries data where it sits, no managed storage tier",
        "governance": "open engine, no catalog lock-in",
    },
    "ClickHouse": {
        "workload_isolation": "per-replica query limit, isolation via replica count",
        "concurrency": "1000 concurrent queries per replica (ClickHouse Cloud)",
        "cost_tuning": "manual (primary key columns chosen by the table's own schema)",
        "data_gravity": "MergeTree favors local/attached storage",
        "governance": "open engine, no catalog lock-in",
    },
    "DuckDB": {
        "workload_isolation": "single process, no multi-tenant isolation",
        "concurrency": "single-node parallelism across row groups, not multi-tenant",
        "cost_tuning": "query-plan only (row-group parallelism, out-of-core spilling)",
        "data_gravity": "embedded, queries files in place (iceberg_scan/delta_scan)",
        "governance": "open engine, no catalog lock-in",
    },
    "Snowflake": {
        "workload_isolation": "multi-cluster warehouses, best for concurrency not slow queries",
        "concurrency": "auto-scale adds clusters as sessions/queries queue",
        "cost_tuning": "auto (Automatic Clustering service)",
        "data_gravity": "external volume; cross-region incurs egress cost",
        "governance": "external catalog integration possible, but billed compute+credits",
    },
    "BigQuery": {
        "workload_isolation": "project-level slot sharing",
        "concurrency": "up to 2,000 concurrent slots shared per project (on-demand)",
        "cost_tuning": "auto (adaptive file sizing, automatic clustering, garbage collection)",
        "data_gravity": "co-located single-region bucket avoids transfer charges",
        "governance": "column/row-level security and data masking built in",
    },
    "Redshift": {
        "workload_isolation": "cluster-level; Concurrency Scaling adds transient clusters",
        "concurrency": "~1 free hour/day of Concurrency Scaling credits per cluster",
        "cost_tuning": "auto (Automatic table optimization chooses sort/distribution keys)",
        "data_gravity": "Spectrum queries S3 directly, standard S3 rates apply",
        "governance": "Glue Data Catalog integration, standard Glue rates apply",
    },
}


def build_iceberg_table(warehouse_dir, n=600_000):
    """A real local Iceberg table, standing in for the chapter's own analytics.events table:
    pyiceberg SQL catalog, real Parquet data files, no simulation."""
    catalog = SqlCatalog(
        "default", uri=f"sqlite:///{warehouse_dir}/catalog.db", warehouse=f"file://{warehouse_dir}/data"
    )
    catalog.create_namespace("ns")
    data = pa.table(
        {
            "id": pa.array(range(n), type=pa.int64()),
            "status": pa.array(["ok" if i % 1000 != 0 else "error" for i in range(n)]),
        }
    )
    table = catalog.create_table("ns.events", schema=data.schema)
    table.append(data)
    return table.location().removeprefix("file://")


def demo_real_duckdb_bytes_scanned(location):
    """A real EXPLAIN ANALYZE plan against the real Iceberg table above: the actual bytes-read
    figure DuckDB's own query engine reports for a filtered scan, parsed from its own output."""
    con = duckdb.connect()
    con.sql("INSTALL iceberg; LOAD iceberg; SET unsafe_enable_version_guessing = true;")
    explain = con.sql(
        f"EXPLAIN ANALYZE SELECT count(*) FROM iceberg_scan('{location}', allow_moved_paths=true) "
        "WHERE status='error'"
    ).fetchall()[0][1]
    con.close()

    data_read_line = next(line.strip() for line in explain.splitlines() if "Data Read" in line)
    match = re.search(r"([\d.]+)\s*([kKMG]B)", data_read_line)
    value, unit = float(match.group(1)), match.group(2).lower()
    multiplier = {"kb": 1024, "mb": 1024 ** 2, "gb": 1024 ** 3}[unit]
    bytes_scanned = value * multiplier
    return bytes_scanned, data_read_line


def estimate_warehouse_costs(bytes_scanned):
    """The one real number above, priced at each warehouse's own currently published per-byte
    rate -- a sourced estimate applied to a real measurement, never an executed warehouse query."""
    bigquery_cost = (bytes_scanned / TIB_BYTES) * BIGQUERY_USD_PER_TIB
    redshift_cost = (bytes_scanned / TB_BYTES) * REDSHIFT_SPECTRUM_USD_PER_TB
    return bigquery_cost, redshift_cost


def engines_with_auto_cost_tuning():
    """Which engines in the real matrix above describe their own tuning as automatic, not
    administrator-driven -- read directly off COMPARISON_MATRIX, not re-typed."""
    return sorted(name for name, row in COMPARISON_MATRIX.items() if row["cost_tuning"].startswith("auto"))


if __name__ == "__main__":
    root = tempfile.mkdtemp(prefix="warehouse_vs_lakehouse_")
    try:
        location = build_iceberg_table(root)
        bytes_scanned, data_read_line = demo_real_duckdb_bytes_scanned(location)
        print(f"real DuckDB-over-Iceberg scan: {data_read_line} ({bytes_scanned:.0f} bytes)")
        assert bytes_scanned > 0

        bigquery_cost, redshift_cost = estimate_warehouse_costs(bytes_scanned)
        print(
            f"sourced cost estimate for the identical bytes scanned: "
            f"BigQuery on-demand ${bigquery_cost:.10f}, Redshift Spectrum ${redshift_cost:.10f}"
        )
        assert bigquery_cost > 0 and redshift_cost > 0
        # BigQuery's published rate ($6.25/TiB) is higher than Redshift Spectrum's ($5/TB), and
        # a TiB is larger than a TB, so for the identical byte count BigQuery's estimate is larger.
        assert bigquery_cost > redshift_cost

        auto_tuners = engines_with_auto_cost_tuning()
        print(f"engines whose own docs describe cost-based tuning as automatic: {auto_tuners}")
        assert auto_tuners == ["BigQuery", "Redshift", "Snowflake"]
        assert "DuckDB" not in auto_tuners  # DuckDB's auto-tuning is within a query, not across one

        print("All assertions passed.")
    finally:
        shutil.rmtree(root, ignore_errors=True)
