# Sources: Orchestrator architecture: scheduler, executor, metadata DB (`de.orchestrator-architecture-scheduler`)

## Airflow 3.3.2 — Architecture Overview

URL: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html
Version: Airflow 3.3.2 documentation (fetched 30 Oct 2026; installed and run locally at the same version)

> A minimal Airflow installation consists of the following components:

> A scheduler, which handles both triggering scheduled
> workflows, and submitting Tasks to the executor to run. The executor, is
> a configuration property of the scheduler, not a separate component and runs within the scheduler
> process. There are several executors available out of the box, and you can also write your own.

> A Dag processor, which parses Dag files from a Dag bundle and serializes them into the
> metadata database.

> An API Server, which serves the REST API and presents a user interface to inspect, trigger and debug the behaviour of
> Dags and tasks. The API server is also used by tasks using the task SDK to communicate state back to Airflow, without requiring direct access
> to the metadata database.

> A metadata database, usually PostgreSQL or MySQL, which stores the state of tasks, Dags and variables.

> Optional worker, which executes the tasks given to it by the scheduler. In the basic installation
> worker might be part of the scheduler not a separate component. It can be run as a long running process
> in the CeleryExecutor, or as a POD in the
> KubernetesExecutor.

> Optional triggerer, which executes deferred tasks in an asyncio event loop. In basic installation
> where deferred tasks are not used, a triggerer is not necessary.

> The Dag processor is a required component in all Airflow 3 deployments. It always runs as a standalone process, ensuring the scheduler never has direct access
> to Dag bundles and cannot execute code provided by a Dag author.

> A worker never runs task code in its own process.
> For every task instance it starts a new subprocess, supervises it, and tears it down once the task instance finishes.

> The worker process is also the only side that holds the task's short-lived credentials and talks to the Execution API, so the subprocess running the task code never reaches the metadata database directly, in any language.

Contents (item by item, for the coverage map):
1. Required components: scheduler (executor runs inside it, not separate), Dag processor, API server, metadata database.
2. Optional components: worker (CeleryExecutor long-running process, or KubernetesExecutor pod), triggerer (asyncio event loop for deferred tasks), plugins folder.
3. Dag processor is mandatory in Airflow 3, always a standalone process, isolating scheduler from Dag author code.
4. Workers talk to Airflow through the Execution API / Task SDK rather than the metadata database directly.
5. Task execution architecture: one subprocess per task instance, never pooled or reused; worker holds short-lived credentials.
6. Three deployment shapes diagrammed: basic (single machine, LocalExecutor), distributed (separate roles: Deployment Manager, Dag author, Operations User), separate-Dag-processing (security isolation).

## Airflow 3.3.2 — Supported versions (Version Life Cycle)

URL: https://airflow.apache.org/docs/apache-airflow/stable/installation/supported-versions.html
Version: Airflow 3.3.2 documentation (fetched 30 Oct 2026)

> Version
> Current Patch/Minor
> State
> First Release
> Limited Maintenance
> EOL/Terminated
> 3
> 3.3.2
> Maintenance
> Apr 22, 2025
> TBD
> TBD
> 2
> 2.11.2
> EOL
> Dec 17, 2020
> Oct 22, 2025
> Apr 22, 2026

Contents:
1. Airflow 3's first release was 22 Apr 2025; as of this fetch (3.3.2) it is in "Maintenance" state with no EOL date yet set.
2. Airflow 2 (final minor 2.11.2) entered Limited Maintenance 22 Oct 2025 and reaches EOL/Terminated 22 Apr 2026 — confirms the syllabus line's "Airflow 2 reached end of life 22 Apr 2026" (this fetch is dated before that date; EOL is the documented sunset date, not yet past at research time, so the syllabus line is read as the documented target date, not a past event the builder could re-verify after the fact).

## PostgreSQL 16/18 — `SELECT ... FOR UPDATE SKIP LOCKED`

URL: https://www.postgresql.org/docs/current/sql-select.html
Version: PostgreSQL current documentation, `FOR UPDATE` clause, `SKIP LOCKED` option (fetched 30 Oct 2026); demonstrated directly against this sandbox's own PostgreSQL 16 cluster.

> With SKIP LOCKED, any selected rows that cannot be immediately locked are skipped. Skipping locked rows provides an inconsistent view of the data, so this is not suitable for general purpose work, but can be used to avoid lock contention with multiple consumers accessing a queue-like table.

Contents:
1. `SKIP LOCKED` is documented by PostgreSQL itself as the mechanism for multiple concurrent consumers to split rows from a queue-like table without contention or double-claiming.
2. Explicitly named by PostgreSQL as unsuitable for general-purpose reads (an "inconsistent view") — appropriate only for a queue-claiming pattern, which is exactly the role it plays for Airflow's HA scheduler loop.
