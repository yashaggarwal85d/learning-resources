<section data-section="outcomes">

## Outcomes

By the end of this topic you can: name which of the scheduler, executor, Dag processor or metadata database a given symptom points to; choose Local, Celery or Kubernetes executor for a given scale and justify it; show two schedulers coordinating safely through the metadata database with a real `SKIP LOCKED` demo; predict and measure where DAG-parsing cost becomes the ceiling as DAG-file count grows.

</section>

<section data-section="internals">

## Internals

Airflow 3's own architecture documentation is explicit that **the executor is a configuration property of the scheduler, not a separate component**, and runs within the scheduler process. Several executors ship out of the box (and you can write your own); this topic measures the conceptual shapes of three — Local (same process), Celery (a broker plus a worker pool) and Kubernetes (one pod per task instance) — without running Celery or Kubernetes themselves in this sandbox, since neither a broker nor a cluster was available at research time (disclosed; the LocalExecutor and the row-lock experiment below did run for real).

The Dag processor is a **required** component in every Airflow 3 deployment, and it always runs as its own standalone process specifically so the scheduler never has direct access to Dag bundles and can't execute Dag-author-supplied code. Workers talk to Airflow through the **Execution API** (via the Task SDK), not the metadata database directly — the subprocess running a task's actual code never reaches the database in any language. A worker never runs task code in its own process either: it starts a brand-new subprocess per task instance (a forked interpreter for Python, a new JVM for Java, a new process for a compiled Go binary), supervises it, and tears it down — nothing pooled or reused, which is the resource topic 5's pools exist to bound.

One nuance from the same source worth carrying forward: with the default local-disk Dag bundle backend (no versioning), the Dag processor and workers can briefly see different versions of a Dag file until both catch up to the latest change on disk. A versioned backend (Git) avoids this by letting the scheduler pin a specific bundle version when it dispatches each task.

The HA-coordination SQL this topic's `examples.py` runs, in full:

```sql
SELECT id, task_name FROM task_queue
WHERE claimed_by IS NULL
ORDER BY id
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

PostgreSQL's own documentation is explicit that `SKIP LOCKED` provides "an inconsistent view of the data" and is "not suitable for general purpose work" — its entire value here is narrow and specific: avoiding lock contention between multiple consumers claiming rows from a queue-like table, which is exactly Airflow's own real HA-scheduler use of the identical mechanism.

</section>

<section data-section="lab">

## Lab

Two experiments, both executed against real software in this sandbox (`examples.py`):

1. **DAG-parsing cost at scale.** Generate synthetic single-purpose DAG files (two `EmptyOperator` tasks each) at 100, 1,000 and 5,000 files, then time `airflow.models.dagbag.DagBag`'s parse pass over each folder. Measured on this run: about 0.16s at 100 files, about 1.6s at 1,000, and about 10.2s at 5,000 — a per-file cost that stays in roughly the same 1.5-2 ms band at every scale, so the *total* cost grows in close to direct proportion to file count rather than levelling off.
2. **HA-scheduler coordination.** Two Python threads, each opening its own PostgreSQL connection, race to claim ten rows from one `task_queue` table using the SQL above. Measured every run: 10 rows claimed, 10 unique, zero rows claimed by more than one thread.

Reproduce: install `apache-airflow==3.3.2` with its PyPI constraints file for your Python version, point `AIRFLOW__DATABASE__SQL_ALCHEMY_CONN` at a PostgreSQL database your user can create tables in, `airflow db migrate` once, then `python examples.py`.

</section>

<section data-section="production">

## Production

The row-lock coordination this topic measures at a ten-row toy scale is the same mechanism Airflow's own documented HA-scheduler deployments rely on in production: multiple scheduler processes pointed at one shared metadata database, each claiming the next schedulable task instance with `SKIP LOCKED` so no two scheduler processes ever both think they own the same task instance. The DAG-parsing cost this topic measures is a documented operational concern for exactly this reason: a deployment with a healthy-looking, low-CPU scheduler process can still be degraded end to end because the Dag processor (parsing) and the metadata database (every state write) are each absorbing load the scheduler process's own CPU graph never shows.

</section>

<section data-section="frontier">

## Frontier

The **Edge executor**, for running workers outside the primary cluster's network, is named in Airflow 3's own architecture documentation as one of the executor shapes alongside Local, Celery and Kubernetes. It is not demonstrated here — this topic's hands-on comparison covers the three the syllabus line explicitly names — and is carried only as a named, sourced pointer for a reader who needs it.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The executor's whole job is to retry a task that fails. That retry is only safe if running the same task twice does no harm — and the two ways a task can fail without ever reporting a clean "failed" state (a zombie worker, an `upstream_failed` chain) are exactly where idempotency actually gets tested. The next topic is that property, and the interval-keyed output design that makes a retry harmless.

</section>
