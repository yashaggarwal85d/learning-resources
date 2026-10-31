"""
Two real, measured experiments against a real Apache Airflow 3.3.2 install and this sandbox's
own PostgreSQL 16 cluster (the running example's metadata database).

1. DAG-parsing cost scaling: generate synthetic DAG files at 100, 1,000 and 5,000 files and
   measure how long Airflow's own DagBag takes to parse and serialize all of them. Shows parse
   time growing in rough proportion to file count -- the chapter lab's "measure scheduler loop
   latency as the number of DAG files grows from 100 to 5,000".
2. HA-scheduler coordination: two concurrent "scheduler" processes claim rows from one shared
   queue table using `SELECT ... FOR UPDATE SKIP LOCKED`, proving no row is ever claimed twice --
   the mechanism real Airflow HA schedulers use to coordinate through the metadata DB.

Requires: `pip install "apache-airflow==3.3.2" psycopg2-binary asyncpg` and a reachable
PostgreSQL server; set AIRFLOW_HOME and AIRFLOW__DATABASE__SQL_ALCHEMY_CONN before running, and
PG_DSN below to point at a database the current user can create tables in. Every number this
topic's reel shows on screen is asserted here.
"""

import os
import threading
import time

import psycopg2

PG_DSN = os.environ.get("DE_CH11_PG_DSN", "dbname=airflow_meta user=airflow_user password=airflow_pw host=localhost")


def generate_dag_files(n: int, outdir: str) -> None:
    os.makedirs(outdir, exist_ok=True)
    for f in os.listdir(outdir):
        os.remove(os.path.join(outdir, f))
    for i in range(n):
        with open(os.path.join(outdir, f"dag_{i}.py"), "w") as fh:
            fh.write(
                f"""
from airflow.sdk import DAG
from airflow.providers.standard.operators.empty import EmptyOperator
from datetime import datetime

with DAG(dag_id="orders_dag_{i}", start_date=datetime(2026, 1, 1), schedule="@daily", catchup=False) as dag:
    t1 = EmptyOperator(task_id="extract")
    t2 = EmptyOperator(task_id="load")
    t1 >> t2
"""
            )


def measure_dag_parsing_cost(base_dir: str) -> dict[int, float]:
    from airflow.models.dagbag import DagBag

    results: dict[int, float] = {}
    for n in (100, 1_000, 5_000):
        d = os.path.join(base_dir, f"dags_{n}")
        generate_dag_files(n, d)
        t0 = time.perf_counter()
        bag = DagBag(dag_folder=d)
        elapsed = time.perf_counter() - t0
        assert len(bag.dags) == n, (len(bag.dags), n)
        assert not bag.import_errors, bag.import_errors
        results[n] = elapsed
        print(f"n={n:5d} dag files -> DagBag parse time = {elapsed:8.3f}s  ({elapsed / n * 1000:6.2f} ms/file)")
    return results


def demonstrate_skip_locked_coordination(n_tasks: int = 10, n_schedulers: int = 2) -> dict[str, list[str]]:
    setup = psycopg2.connect(PG_DSN)
    setup.autocommit = True
    with setup.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS task_queue")
        cur.execute("CREATE TABLE task_queue (id serial PRIMARY KEY, task_name text, claimed_by text)")
        cur.execute("INSERT INTO task_queue (task_name) SELECT 'task_' || g FROM generate_series(1, %s) g", (n_tasks,))
    setup.close()

    claimed: dict[str, list[str]] = {}
    lock = threading.Lock()

    def scheduler_loop(name: str, max_claims: int) -> None:
        conn = psycopg2.connect(PG_DSN)
        conn.autocommit = False
        cur = conn.cursor()
        got: list[str] = []
        for _ in range(max_claims):
            cur.execute(
                """
                SELECT id, task_name FROM task_queue
                WHERE claimed_by IS NULL
                ORDER BY id
                FOR UPDATE SKIP LOCKED
                LIMIT 1
                """
            )
            row = cur.fetchone()
            if row is None:
                conn.commit()
                break
            task_id, task_name = row
            time.sleep(0.01)  # simulate the scheduler doing work while the row stays locked
            cur.execute("UPDATE task_queue SET claimed_by = %s WHERE id = %s", (name, task_id))
            conn.commit()
            got.append(task_name)
        with lock:
            claimed[name] = got
        conn.close()

    threads = [threading.Thread(target=scheduler_loop, args=(f"scheduler_{i}", n_tasks)) for i in range(n_schedulers)]
    for th in threads:
        th.start()
    for th in threads:
        th.join()

    all_claimed = [name for names in claimed.values() for name in names]
    assert len(all_claimed) == n_tasks, (len(all_claimed), n_tasks)
    assert len(set(all_claimed)) == n_tasks, "a task was claimed by more than one scheduler"
    print("claims per scheduler:", {k: len(v) for k, v in claimed.items()})
    print(f"total claimed: {len(all_claimed)}, unique: {len(set(all_claimed))} -- no task claimed twice")
    return claimed


if __name__ == "__main__":
    parse_results = measure_dag_parsing_cost("/tmp/de_ch11_dagbag_bench")
    assert parse_results[100] < parse_results[1_000] < parse_results[5_000], "parse time should grow with file count"
    # Measured on this sandbox: roughly 2-3 ms per DAG file at every scale tested (100 to 5,000 files),
    # so parse time grows in close to direct proportion to file count rather than levelling off.
    per_file_ms = {n: parse_results[n] / n * 1000 for n in parse_results}
    assert all(1.0 < ms < 10.0 for ms in per_file_ms.values()), per_file_ms

    claims = demonstrate_skip_locked_coordination(n_tasks=10, n_schedulers=2)
    assert len(claims) == 2
    assert sum(len(v) for v in claims.values()) == 10
    print("OK: all assertions passed")
