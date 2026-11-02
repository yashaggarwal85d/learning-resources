"""
The same three-stage orders pipeline, expressed as an Airflow task DAG
instead of a Dagster asset graph. Used only to count dependency-wiring
lines against defs.py -- not run.
"""
from __future__ import annotations

import datetime

from airflow.sdk import dag, task


@dag(dag_id="orders_pipeline_dag", schedule=None, start_date=datetime.datetime(2026, 1, 1), catchup=False)
def orders_pipeline_dag():
    @task
    def extract_raw_orders():
        return [{"order_id": 1, "amount": 100}, {"order_id": 2, "amount": -50}, {"order_id": 3, "amount": 75}]

    @task
    def stage_orders(raw_orders):
        return raw_orders

    @task
    def check_no_negative_amounts(staged):
        bad = [r for r in staged if r["amount"] < 0]
        if bad:
            raise ValueError(f"{len(bad)} negative amount row(s) found")
        return True

    @task
    def load_fact_orders(staged, _check_passed):
        return [r for r in staged if r["amount"] >= 0]

    raw = extract_raw_orders()
    staged = stage_orders(raw)
    checked = check_no_negative_amounts(staged)
    load_fact_orders(staged, checked)


orders_pipeline_dag()
