# Outline — de.openlineage-events-facets-lineage

## Syllabus clauses (6, each a literal substring of the syllabus line)

1. "the run/job/dataset event model (START/COMPLETE/FAIL)"
2. "facets (schema, column lineage, data quality, SQL)"
3. "integrations (Airflow provider built in, Spark listener, Flink, dbt)"
4. "consumers (Marquez reference server, DataHub, cloud catalogs)"
5. "column lineage from SQL parsing vs runtime plans"
6. "the gaps static lineage misses"

## Concept ledger

**Introduces:** `openlineage-run-job-dataset-events`, `openlineage-facets`,
`openlineage-integrations-consumers`, `column-lineage-parse-vs-runtime`, `lineage-coverage-gaps`.

**Uses:** `otel-vs-openlineage` (topic 2, `de.opentelemetry-across-batch-streaming`, live —
confirmed in `registry.ts`: this topic is the "complement" side of that comparison, naming the
lineage standard itself), `structured-logs-correlation-ids` (topic 1, live — a run id is a
correlation key), `metadata-graph-entities-relationships`, `crawl-vs-push-ingestion` (topic 10,
`de.metadata-platforms-active-catalogs`, held but in `registry.ts` — note: topic 10's own
`introduces` list uses these exact names, not `CHAPTER.md`'s planning-time guesses
`metadata-graph-architecture` / `pull-crawl-vs-push-event-ingestion`; the actual built names are
used here).

**Declared, with the gap logged (per `CHAPTER.md`'s own "Cross-chapter ids" rule):** this
topic's syllabus line builds on ideas from Chapter 1 (DSA, a lineage graph is a DAG read by
traversal — `dag-execution-model`, `graph-traversal`), Chapter 2 (`logical-vs-physical-query-plan`
— the plan a listener reads), Chapter 7 §7.1 (Spark's listener and plan — `spark-listener-and-plan`),
and Chapter 11 §11.1 (Airflow runs and tasks — `airflow-runs-and-tasks`) and §11.4 (dbt in CI —
`dbt-in-ci`). Checked directly against `registry.ts`: none of these six ids exist under any name —
Chapter 7's two live §7.1 topics introduce only `spark-task-hierarchy`, `spark-driver-executor-model`,
`spark-narrow-wide-dependency`, `spark-stage-boundary` (not the listener/plan concept this topic
needs); Chapter 11's three live §11.1 topics introduce `orchestrator-architecture-scheduler`,
`executor-model-comparison`, `ha-scheduler-row-locks`, `idempotent-tasks-failure-semantics`,
`zombie-task-detection`, `trigger-rule-propagation`, `data-interval-semantics`,
`resumable-backfill-design`, `backfill-blast-radius` (none of them "Airflow runs and tasks" by
name); Chapter 11 §11.4 ("dbt in CI") has not been built at all yet (no `section: '11.4'` entry
exists in `registry.ts`). All six are therefore `declared`, not `uses`, and this gap is logged
here rather than silently guessed, per the chapter plan's own instruction.

## Storyboard (10 steps)

1. **Hook** — a column in `analytics.daily_revenue` is wrong; the catalog says "derived from
   orders," but which input columns, through which transformations, actually produced that
   number — and does a regex read of the SQL agree with what the engine actually ran?
2. **Predict** (within the first four) — SQL-parsed versus runtime-plan column lineage for a
   query with a CASE expression and a table name that's still a runtime parameter at parse time.
3. **Reveal: the run/job/dataset event model** — a job, a run, a dataset; START then a terminal
   state; subsequent events additive.
4. **Reveal: facets** — optional, versioned attachments (`_schemaURL`), schema/column-lineage/SQL
   facets as examples. *Takeaway.*
5. **Reveal: integrations** — the Airflow provider (legacy integration retired, no more fixes),
   the Spark listener, Flink, dbt.
6. **Reveal: consumers** — Marquez as the reference implementation (built and released by WeWork),
   DataHub, cloud catalogs, all reading the same event stream. *Takeaway.*
7. **Reveal: the parent run facet** — a task's run names the DAG run that spawned it, so a lineage
   graph can be grouped back to one trigger.
8. **Reveal: SQL parse vs. runtime plan** — SQL-text parsing reads only the table and field names
   written in the query; traversing the resolved logical plan sees the CASE's own condition column
   and the parameter's resolved value. *Takeaway.*
9. **Recap.**
10. **Prove it** (second predict) — the same job's dynamic table name and CASE both affect the
    same prediction scenario revisited from a different angle: does lineage collected from a
    daily job whose table name changes each run show one dataset node or many, and why.

## Research note: what this topic can and can't run for real

No Docker, JVM-based catalog, Kafka broker or Spark cluster on this build machine (per
`CHAPTER.md`'s own "Engine of record" note, confirmed again here). What *is* real: `openlineage-python`
(pip-installable, verified working — `pip install openlineage-python` succeeded) provides the
actual client classes (`RunEvent`, `Run`, `Job`, `Dataset`, the facet builders) used by the real
Spark and Airflow integrations, and its `HttpTransport` posts to the real Marquez API path
(`POST /api/v1/lineage`, confirmed from the library's own default `endpoint` parameter). This
topic's lab builds real, schema-shaped `RunEvent`s with real schema, column-lineage and parent-run
facets through this library, and receives them over a real HTTP round trip at a local stand-in for
that endpoint (a Python `http.server` instance, not Marquez itself — Marquez's own storage, API
and UI are not run). The column-lineage comparison (SQL-text parsing versus a resolved runtime
plan) is a synthetic illustration of the structural claim the Spark docs make (text parsing sees
only names; plan traversal sees the CASE's condition column and the parameter's resolved value),
not a real Spark job — no Spark is available to run. Both limits are stated in `references.md` and
`REVIEW.md`, not hidden.
