"""
Two real experiments for this topic.

1. Idempotent vs non-idempotent retry: a task that writes its output keyed to its data interval,
   run twice to simulate "the scheduler retried it after a zombie". An **overwrite** write leaves
   identical state after one or two runs; an **append** write doubles the row count on the second
   run -- the exact duplicate-work failure a retry causes when the task isn't idempotent.
2. Trigger-rule propagation, run for real against Apache Airflow 3.3.2 with `airflow dags test`
   (the DebugExecutor's synchronous, in-process run -- no scheduler/worker daemons needed): a task
   that deliberately fails, a downstream task on the default trigger rule (never runs, becomes
   `upstream_failed`), and a downstream task on `trigger_rule="one_failed"` (runs anyway).

The heartbeat-timeout ("zombie task") detection itself is Airflow's own documented mechanism
(Apache Airflow 3.3.2, "Tasks" -> "Task Instance Heartbeat Timeout"), not reproduced live here:
it requires a persistent scheduler process heartbeating against the metadata DB over real wall
time, which this single sandboxed session could not run reliably (Airflow's own `standalone`
command failed in this container with a subprocess PATH error spawning its sub-processes). This
is disclosed in FACT-CHECK.md; the claim is sourced from Airflow's own documented reproduction
recipe, quoted verbatim in SOURCES.md, not invented.
"""

import json
import os
import subprocess


def write_interval_output(mode: str, outdir: str, interval: str, rows: list[str]) -> list[str]:
    path = os.path.join(outdir, f"orders_{interval}.jsonl")
    os.makedirs(outdir, exist_ok=True)
    if mode == "overwrite":
        with open(path, "w") as f:
            for r in rows:
                f.write(json.dumps({"interval": interval, "row": r}) + "\n")
    elif mode == "append":
        with open(path, "a") as f:
            for r in rows:
                f.write(json.dumps({"interval": interval, "row": r}) + "\n")
    else:
        raise ValueError(mode)
    with open(path) as f:
        return f.readlines()


def demonstrate_idempotent_vs_append(base_dir: str) -> dict[str, int]:
    rows = ["order_1", "order_2", "order_3"]

    overwrite_dir = os.path.join(base_dir, "overwrite")
    for _ in range(2):  # simulate: original run, then a retry of the "same" task instance
        lines_overwrite = write_interval_output("overwrite", overwrite_dir, "2026-10-30", rows)

    append_dir = os.path.join(base_dir, "append")
    for _ in range(2):
        lines_append = write_interval_output("append", append_dir, "2026-10-30", rows)

    result = {"overwrite_rows_after_two_runs": len(lines_overwrite), "append_rows_after_two_runs": len(lines_append)}
    assert result["overwrite_rows_after_two_runs"] == len(rows), result
    assert result["append_rows_after_two_runs"] == len(rows) * 2, result
    print(f"overwrite (idempotent): {result['overwrite_rows_after_two_runs']} rows after two runs (correct: {len(rows)})")
    print(f"append (not idempotent): {result['append_rows_after_two_runs']} rows after two runs (doubled)")
    return result


def run_trigger_rule_demo(airflow_home: str, pg_dsn_sqlalchemy: str, pg_dsn_psycopg2: str) -> dict[str, str]:
    """Runs the real `trigger_rule_demo` DAG with `airflow dags test` and reads back real
    TaskInstance states from the metadata DB. Requires `apache-airflow==3.3.2` on PATH and a
    migrated metadata DB pointed to by AIRFLOW__DATABASE__SQL_ALCHEMY_CONN."""
    import psycopg2

    env = {**os.environ, "AIRFLOW_HOME": airflow_home, "AIRFLOW__DATABASE__SQL_ALCHEMY_CONN": pg_dsn_sqlalchemy, "AIRFLOW__CORE__LOAD_EXAMPLES": "False"}
    subprocess.run(["airflow", "dags", "test", "trigger_rule_demo", "2026-01-01"], env=env, check=False, capture_output=True, text=True)

    conn = psycopg2.connect(pg_dsn_psycopg2)
    cur = conn.cursor()
    cur.execute("SELECT task_id, state FROM task_instance WHERE dag_id = 'trigger_rule_demo' ORDER BY task_id")
    states = dict(cur.fetchall())
    conn.close()
    print("trigger_rule_demo task states:", states)
    assert states == {"a_fails": "failed", "b_default_rule": "upstream_failed", "c_one_failed_rule": "success"}, states
    return states


if __name__ == "__main__":
    idempotency_result = demonstrate_idempotent_vs_append("/tmp/de_ch11_idempotency_demo")

    trigger_states = run_trigger_rule_demo(
        airflow_home="/tmp/airflow_home2",
        pg_dsn_sqlalchemy="postgresql+psycopg2://airflow_user:airflow_pw@localhost:5432/airflow_meta2",
        pg_dsn_psycopg2="dbname=airflow_meta2 user=airflow_user password=airflow_pw host=localhost",
    )

    print("OK: all assertions passed")
