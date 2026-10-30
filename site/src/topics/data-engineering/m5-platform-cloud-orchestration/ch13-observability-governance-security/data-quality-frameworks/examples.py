"""de.data-quality-frameworks: a real dbt-duckdb project (seed, one model, generic data tests,
one unit test) and a real Great Expectations Core suite, both run against the same synthetic
shop orders data with the same two planted problems (a missing customer_id, a negative amount).
Deequ, Soda and Databricks DQX are not run (Deequ and DQX both need Apache Spark, which this
sandbox does not have — confirmed: `import pyspark` fails; Soda's checks need a real data
platform connection this sandbox also does not have) and are sourced-only, per CHAPTER.md's own
lab table ("Soda and DQX sourced from their documentation and disclosed")."""

import json
import shutil
import subprocess
import tempfile
from pathlib import Path

import pandas as pd

ORDERS_ROWS = [
    {"order_id": 1, "customer_id": 101, "status": "completed", "amount": 50.00},
    {"order_id": 2, "customer_id": 102, "status": "completed", "amount": 20.00},
    {"order_id": 3, "customer_id": 103, "status": "refunded", "amount": 10.00},
    {"order_id": 4, "customer_id": None, "status": "completed", "amount": 30.00},
    {"order_id": 5, "customer_id": 104, "status": "completed", "amount": -5.00},
]


def run_dbt_demo():
    """Writes a real dbt project (seed, one model, 4 generic data tests, 1 unit test) to a
    temp dir and runs `dbt build` through the real, installed dbt-duckdb adapter."""
    root = Path(tempfile.mkdtemp(prefix="dbt_dq_demo_"))
    project = root / "dq_demo"
    (project / "models").mkdir(parents=True)
    (project / "seeds").mkdir(parents=True)
    profiles_dir = root / "profiles"
    profiles_dir.mkdir()

    (project / "dbt_project.yml").write_text(
        "name: 'dq_demo'\nversion: '1.0.0'\nprofile: 'dq_demo'\n"
        "model-paths: [\"models\"]\ntest-paths: [\"tests\"]\nclean-targets: [\"target\"]\n"
    )
    (profiles_dir / "profiles.yml").write_text(
        f"dq_demo:\n  target: dev\n  outputs:\n    dev:\n      type: duckdb\n"
        f"      path: '{root / 'dq_demo.duckdb'}'\n      threads: 1\n"
    )

    seed_lines = ["order_id,customer_id,status,amount"] + [
        f"{r['order_id']},{r['customer_id'] if r['customer_id'] is not None else ''},{r['status']},{r['amount']}"
        for r in ORDERS_ROWS
    ]
    (project / "seeds" / "raw_orders.csv").write_text("\n".join(seed_lines) + "\n")
    (project / "models" / "orders_clean.sql").write_text("select * from {{ ref('raw_orders') }}\n")
    (project / "models" / "schema.yml").write_text(
        """models:
  - name: orders_clean
    columns:
      - name: order_id
        data_tests:
          - unique
          - not_null
      - name: customer_id
        data_tests:
          - not_null
      - name: status
        data_tests:
          - accepted_values:
              values: ['completed', 'refunded']
unit_tests:
  - name: test_orders_clean_passthrough
    model: orders_clean
    given:
      - input: ref('raw_orders')
        rows:
          - {order_id: 1, customer_id: 101, status: 'completed', amount: 50.00}
    expect:
      rows:
        - {order_id: 1, customer_id: 101, status: 'completed', amount: 50.00}
"""
    )

    env = {"DBT_PROFILES_DIR": str(profiles_dir)}
    import os

    full_env = {**os.environ, **env}
    subprocess.run(["dbt", "build"], cwd=project, env=full_env, capture_output=True, text=True)

    results_path = project / "target" / "run_results.json"
    results = json.loads(results_path.read_text())["results"]
    by_id = {r["unique_id"].split(".")[-2] if "." in r["unique_id"] else r["unique_id"]: r["status"] for r in results}

    status_by_check = {}
    for r in results:
        name = r["unique_id"]
        status_by_check[name] = r["status"]

    shutil.rmtree(root, ignore_errors=True)
    return status_by_check


def run_gx_demo():
    """Runs a real Great Expectations Core suite (installed library, 1.24.1) against the same
    synthetic orders data: a uniqueness check, a not-null check, and a range check dbt's four
    built-in generic tests don't cover."""
    import great_expectations as gx

    df = pd.DataFrame(ORDERS_ROWS)
    context = gx.get_context(mode="ephemeral")
    data_source = context.data_sources.add_pandas("orders_source")
    data_asset = data_source.add_dataframe_asset(name="orders_asset")
    batch_def = data_asset.add_batch_definition_whole_dataframe("orders_batch")
    batch = batch_def.get_batch(batch_parameters={"dataframe": df})

    suite = gx.ExpectationSuite(name="orders_suite")
    suite.add_expectation(gx.expectations.ExpectColumnValuesToBeUnique(column="order_id"))
    suite.add_expectation(gx.expectations.ExpectColumnValuesToNotBeNull(column="customer_id"))
    suite.add_expectation(gx.expectations.ExpectColumnValuesToBeBetween(column="amount", min_value=0))

    result = batch.validate(suite)
    return {
        "success": result.success,
        "per_expectation": [
            (r.expectation_config.type, r.success, r.result.get("unexpected_count"))
            for r in result.results
        ],
    }


def full_rescan_null_count(partitions):
    all_rows = [row for part in partitions for row in part]
    return sum(1 for row in all_rows if row["customer_id"] is None)


def incremental_null_count(partitions):
    """Compute the same metric per new partition and merge, instead of rescanning history."""
    total = 0
    for part in partitions:
        total += sum(1 for row in part if row["customer_id"] is None)
    return total


def sampled_null_estimate(partitions, sample_every_n):
    """A 1-in-n sample: estimate a rate from the sampled rows, scaled to the full row count —
    can miss a single rare bad row entirely if it never lands in the sample."""
    all_rows = [row for part in partitions for row in part]
    sampled = all_rows[::sample_every_n]
    sampled_null_rate = sum(1 for row in sampled if row["customer_id"] is None) / len(sampled)
    estimated_count = round(sampled_null_rate * len(all_rows))
    return estimated_count, len(sampled)


def gate_vs_posthoc_cost(row_count, gate_check_cost_per_row, full_scan_cost_per_row):
    """A gate's cost is bounded by what it checks on data already in flight; a post-hoc full
    scan re-reads the whole table after landing. Returns each as a fraction of a full rescan."""
    gate_cost = row_count * gate_check_cost_per_row
    posthoc_cost = row_count * full_scan_cost_per_row
    return {
        "gate_cost": gate_cost,
        "posthoc_cost": posthoc_cost,
        "posthoc_is_how_many_times_gate": posthoc_cost / gate_cost,
    }


def main():
    dbt_results = run_dbt_demo()
    fail_names = [k for k, v in dbt_results.items() if v == "fail"]
    pass_names = [k for k, v in dbt_results.items() if v in ("pass", "success")]
    assert len(fail_names) == 1
    assert any("not_null_orders_clean_customer_id" in k for k in fail_names)
    assert any("unit_test" in k for k in pass_names)
    print(f"dbt build: {len(pass_names)} passed, {len(fail_names)} failed")
    print(f"dbt caught: {[k for k in fail_names]}")

    gx_result = run_gx_demo()
    assert gx_result["success"] is False
    failing = [name for name, ok, _ in gx_result["per_expectation"] if not ok]
    assert len(failing) == 2
    assert "expect_column_values_to_not_be_null" in failing
    assert "expect_column_values_to_be_between" in failing
    print(f"GX Core suite: {len(gx_result['per_expectation']) - len(failing)} passed, {len(failing)} failed")
    print(f"GX caught (dbt's generic tests don't cover this one): expect_column_values_to_be_between")

    partitions = [ORDERS_ROWS[:2], ORDERS_ROWS[2:4], ORDERS_ROWS[4:]]
    full = full_rescan_null_count(partitions)
    incremental = incremental_null_count(partitions)
    assert full == incremental == 1
    print(f"full rescan null count: {full}, incremental null count: {incremental} (equal)")

    big_partitions = [ORDERS_ROWS * 20]
    estimate, sample_size = sampled_null_estimate(big_partitions, sample_every_n=10)
    full_on_big = full_rescan_null_count(big_partitions)
    print(f"full rescan on 100 rows: {full_on_big} nulls; 1-in-10 sample ({sample_size} rows) estimate: {estimate}")

    cost = gate_vs_posthoc_cost(row_count=100_000, gate_check_cost_per_row=0.001, full_scan_cost_per_row=0.01)
    assert cost["posthoc_is_how_many_times_gate"] == 10
    print(f"post-hoc full scan costs {cost['posthoc_is_how_many_times_gate']:.0f}x a gate check, same row count")
    print("de.data-quality-frameworks examples: all checks pass")


if __name__ == "__main__":
    main()
