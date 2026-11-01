"""The one topic in this chapter run end to end, not just simulated, for its storage-and-
table-format layer: a real S3-compatible object store (moto's local S3 server, since MinIO's
own open-source server/mc release channel returns HTTP 410 in this sandbox) and a real Apache
Iceberg table (via pyiceberg), writing real Parquet data files, Avro manifests and JSON
metadata, producing a real snapshot. Kubernetes and Spark/Trino as a JVM process are not run in
this sandbox (too heavy here) and are disclosed as named/described, not executed; pyiceberg
stands in as the query/write engine actually touching the table format. Requires `moto[s3]`,
`pyiceberg`, `pyarrow` and `boto3` (SOURCES.md, OUTLINE.md).
"""
import json
import os
import tempfile


def run_object_store_and_iceberg_demo():
    from moto.server import ThreadedMotoServer
    import boto3
    from pyiceberg.catalog.sql import SqlCatalog
    import pyarrow as pa

    server = ThreadedMotoServer(port=0)
    server.start()
    try:
        port = server._server.socket.getsockname()[1]
        endpoint = f"http://127.0.0.1:{port}"
        os.environ["AWS_ACCESS_KEY_ID"] = "test"
        os.environ["AWS_SECRET_ACCESS_KEY"] = "test"
        os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

        s3 = boto3.client("s3", endpoint_url=endpoint)
        s3.create_bucket(Bucket="warehouse")

        with tempfile.TemporaryDirectory() as tmp:
            catalog = SqlCatalog(
                "default",
                uri=f"sqlite:///{tmp}/catalog.db",
                warehouse="s3://warehouse/",
                **{
                    "s3.endpoint": endpoint,
                    "s3.access-key-id": "test",
                    "s3.secret-access-key": "test",
                },
            )
            catalog.create_namespace("plant")
            schema = pa.schema([("id", pa.int64()), ("region", pa.string())])
            table = catalog.create_table("plant.events", schema=schema)

            first_batch = pa.table({"id": [1, 2, 3], "region": ["eu", "us", "eu"]})
            table.append(first_batch)
            second_batch = pa.table({"id": [4, 5], "region": ["eu", "eu"]})
            table.append(second_batch)

            row_count = table.scan().to_arrow().num_rows
            snapshot_count = len(table.metadata.snapshots)
            return {"row_count": row_count, "snapshot_count": snapshot_count}
    finally:
        server.stop()


def object_store_and_iceberg_worked_example():
    result = run_object_store_and_iceberg_demo()
    assert result["row_count"] == 5
    assert result["snapshot_count"] == 2
    return result


ON_PREM_REASONS = ["data_gravity", "ot_proximity", "sovereignty", "steady_utilisation"]


def classify_on_prem_reasons(workload):
    """SOURCES.md/OUTLINE.md: each reason is a specific, falsifiable test, not a vague
    'it's sometimes cheaper' — a workload either meets a reason's own test or it doesn't."""
    reasons = []
    if workload.get("data_volume_tb", 0) > 500 and workload.get("egress_cost_exceeds_benefit", False):
        reasons.append("data_gravity")
    if workload.get("requires_sub_second_control_loop", False):
        reasons.append("ot_proximity")
    if workload.get("data_must_not_leave_jurisdiction", False):
        reasons.append("sovereignty")
    if workload.get("utilisation_profile") == "steady_high":
        reasons.append("steady_utilisation")
    return reasons


def reason_classification_worked_example():
    multi_petabyte_analytics = classify_on_prem_reasons({
        "data_volume_tb": 2000,
        "egress_cost_exceeds_benefit": True,
        "utilisation_profile": "steady_high",
    })
    plant_control_loop = classify_on_prem_reasons({"requires_sub_second_control_loop": True})
    bursty_reporting_job = classify_on_prem_reasons({"utilisation_profile": "spiky", "data_volume_tb": 2})
    result = {
        "multi_petabyte_analytics": multi_petabyte_analytics,
        "plant_control_loop": plant_control_loop,
        "bursty_reporting_job": bursty_reporting_job,
    }
    assert set(result["multi_petabyte_analytics"]) == {"data_gravity", "steady_utilisation"}
    assert result["plant_control_loop"] == ["ot_proximity"]
    assert result["bursty_reporting_job"] == []
    return result


def monthly_cost(utilisation_profile, on_prem_fixed_cost, cloud_rate_per_unit, units_if_steady, units_if_spiky):
    """A steady workload pays the cloud's per-unit rate on every one of those units, every
    month, with no idle window for elasticity to discount away. A spiky workload pays the same
    rate but only for the units it actually uses, which an always-on on-prem cluster can't
    shed."""
    units = units_if_steady if utilisation_profile == "steady_high" else units_if_spiky
    cloud_cost = units * cloud_rate_per_unit
    return {"on_prem_cost": on_prem_fixed_cost, "cloud_cost": cloud_cost, "cloud_is_cheaper": cloud_cost < on_prem_fixed_cost}


def cost_comparison_worked_example():
    steady = monthly_cost("steady_high", on_prem_fixed_cost=40000, cloud_rate_per_unit=70, units_if_steady=720, units_if_spiky=80)
    spiky = monthly_cost("spiky", on_prem_fixed_cost=40000, cloud_rate_per_unit=70, units_if_steady=720, units_if_spiky=80)
    result = {"steady_workload": steady, "spiky_workload": spiky}
    assert result["steady_workload"]["cloud_is_cheaper"] is False
    assert result["spiky_workload"]["cloud_is_cheaper"] is True
    return result


def main():
    print(json.dumps(object_store_and_iceberg_worked_example(), indent=2))
    print(json.dumps(reason_classification_worked_example(), indent=2))
    print(json.dumps(cost_comparison_worked_example(), indent=2))


if __name__ == "__main__":
    main()
