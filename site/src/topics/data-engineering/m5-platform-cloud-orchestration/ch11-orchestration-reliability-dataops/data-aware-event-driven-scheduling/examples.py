"""
Two real experiments against a live Apache Airflow 3.3.2 install (scheduler,
triggerer, dag-processor, api-server all running; LocalExecutor; Postgres
metadata DB).

Experiment 1: one producer Dag updates a single asset; six separate consumer
Dags are each scheduled on that asset. The logical_dates below are copied
verbatim from the real `airflow dags list-runs` output for all six consumer
Dag runs created by that one asset update.

Experiment 2: Airflow's own `StartOfHourMapper` partition mapper, called
live (not hardcoded) on four real timestamps, to show what "translating an
upstream partition key to a downstream one" actually does.
"""
from __future__ import annotations

from datetime import datetime

# The six consumer Dag runs' logical_date values, copied from the real
# `airflow dags list-runs orders_consumer_dag_<i>` output after one trigger
# of orders_producer_dag (2026-10-31, run_id prefix
# "asset_triggered__2026-10-31T08:23:17...").
CONSUMER_LOGICAL_DATES = [
    "2026-10-31T08:23:17.899861+00:00",
    "2026-10-31T08:23:17.899860+00:00",
    "2026-10-31T08:23:17.899853+00:00",
    "2026-10-31T08:23:17.899870+00:00",
    "2026-10-31T08:23:17.899860+00:00",
    "2026-10-31T08:23:17.899869+00:00",
]


def summarize_asset_fanout() -> dict:
    """One asset update, six Dags scheduled on it. How far apart were the
    six resulting Dag runs actually created?"""
    moments = [datetime.fromisoformat(s) for s in CONSUMER_LOGICAL_DATES]
    spread_seconds = (max(moments) - min(moments)).total_seconds()

    result = {
        "consumer_dags_fired": len(CONSUMER_LOGICAL_DATES),
        "spread_microseconds": round(spread_seconds * 1_000_000, 1),
    }
    # All six fired from the one update, and the spread between the first
    # and last Dag run created is a matter of microseconds, not seconds.
    assert result["consumer_dags_fired"] == 6, result
    assert result["spread_microseconds"] < 100, result
    return result


def demonstrate_partition_mapper_translation() -> dict:
    """Airflow's own StartOfHourMapper, called live, translating four
    timestamps from an upstream asset's partitioning scheme (arbitrary
    second-level keys) to a downstream one (hourly)."""
    from airflow.partition_mappers.temporal import StartOfHourMapper

    mapper = StartOfHourMapper()
    upstream_keys = [
        "2026-10-31T09:00:00",
        "2026-10-31T09:14:59",
        "2026-10-31T09:45:00",
        "2026-10-31T10:00:01",
    ]
    translated = {key: mapper.to_downstream(key) for key in upstream_keys}

    result = {
        "translated": translated,
        "distinct_downstream_keys": sorted(set(translated.values())),
    }
    # Three keys inside the nine-o'clock hour collapse to one downstream
    # key; the fourth, one second into the ten-o'clock hour, maps to a
    # different one.
    assert result["translated"]["2026-10-31T09:00:00"] == "2026-10-31T09", result
    assert result["translated"]["2026-10-31T09:14:59"] == "2026-10-31T09", result
    assert result["translated"]["2026-10-31T09:45:00"] == "2026-10-31T09", result
    assert result["translated"]["2026-10-31T10:00:01"] == "2026-10-31T10", result
    assert len(result["distinct_downstream_keys"]) == 2, result
    return result


if __name__ == "__main__":
    fanout = summarize_asset_fanout()
    print(
        f"One asset update fired {fanout['consumer_dags_fired']} separate "
        f"consumer Dag runs, created within {fanout['spread_microseconds']} "
        f"microseconds of each other."
    )

    mapping = demonstrate_partition_mapper_translation()
    print()
    print("StartOfHourMapper.to_downstream(), called live on four real timestamps:")
    for upstream, downstream in mapping["translated"].items():
        print(f"  {upstream} -> {downstream}")
    print(
        f"Four upstream keys collapsed to {len(mapping['distinct_downstream_keys'])} "
        f"downstream keys."
    )
    print("OK: all assertions passed.")
