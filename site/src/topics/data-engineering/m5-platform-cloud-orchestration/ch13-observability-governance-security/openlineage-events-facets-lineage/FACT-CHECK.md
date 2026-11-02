# Fact-check — de.openlineage-events-facets-lineage

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | A Job is a process that consumes or produces Datasets; a Run is an instance of a Job representing one occurrence in time. | OpenLineage specification -- Object Model | Confirmed, quoted verbatim. |
| 2 | Job Metadata Updates (JobEvent) describe design-time metadata about a job and are not associated with a Run. | OpenLineage specification -- Object Model | Confirmed, quoted verbatim. |
| 3 | Each Run State Update's detail is additive: input datasets can be specified along with START, along with COMPLETE, or both. | OpenLineage specification -- Object Model | Confirmed, quoted verbatim. |
| 4 | A batch job is typically represented as a START event followed by a COMPLETE event; COMPLETE, ABORT and FAIL are terminal events. | OpenLineage specification -- The Run Cycle | Confirmed, quoted verbatim. |
| 5 | DIRECT means the output column value was derived from the input field; INDIRECT means the input impacted the output without being derived from it; IDENTITY means the value is taken as-is. | OpenLineage specification -- Column Level Lineage Dataset Facet | Confirmed, quoted verbatim. |
| 6 | The Airflow integration has relocated to the official OpenLineage Airflow Provider for Airflow 2.7 and newer; the legacy package is no longer maintained. | OpenLineage -- Apache Airflow integration page | Confirmed, quoted verbatim. |
| 7 | Marquez is the reference implementation of OpenLineage, open-sourced by WeWork, and already works with the community's integrations. | Marquez Project -- site | Confirmed, quoted verbatim. |
| 8 | A toy run's START event carries an empty output list; its COMPLETE event, for the identical run id, adds the output dataset and a schema facet. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 9 | Parsing a job's SQL text finds only a UDF's one visible argument, missing a second column it actually reads internally; the runtime plan finds both. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 10 | A SQL-text parse never resolves a table name built from a runtime parameter; the runtime plan resolves it exactly. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |

## Red-team: the predict questions (steps 3 and 6)

**Question 1 (step 3):** does a run's COMPLETE event already know the output dataset at START?

**Attack -- "the job planned its output before it ever started, so START should already know
it."** Planning and reporting are different things. Even if a job's code always writes to the
same table, OpenLineage's own event model reports what is true at each state update, and
`examples.py`'s own `RunEventEmitter.start()` is called before any output exists to report --
the output only enters the record at `complete()`, exactly matching the spec's own additive
design.

**Question 2 (step 6):** does SQL-text parsing find the same column lineage as the runtime
plan, for a query with a UDF and a dynamic table name?

**Attack -- "the UDF call is right there in the text, so the parser can at least see its
argument and infer the rest."** Seeing a call is not the same as seeing what it does.
`examples.py`'s own `sql_parsed_lineage()` finds exactly the one argument visible in the text
(`region`) and has no way to discover `locale_config`, a column the UDF's real implementation
reads internally -- the text parse's edge set is a strict subset of the plan walker's, not an
approximation of it.

## Abandoned approaches

Wiring a real Spark job into a real local Marquez server was considered first, per this
topic's own CHAPTER.md lab description, but a working Marquez deployment (its own API server
plus a Postgres backing store) and a Spark job actually configured with the OpenLineage
listener would cost far more sandbox setup than this topic's own 15-minute scope allows;
per CHAPTER.md's own disclosed fallback ("where Marquez or Airflow cannot run... sourced and
disclosed"), the toy `RunEventEmitter` and the SQL-parse-vs-plan-walk comparison instead model
the exact mechanisms OpenLineage's own specification documents, which is what this topic's
claims rest on. A real OpenLineage Spark listener attached to a live cluster, running the exact
CASE/UDF/dynamic-table query, was also considered for Claim 2, but the toy plan walker already
demonstrates the identical structural gap (visible text vs. actual runtime resolution) without
needing a cluster.
