# Fact-check — de.openlineage-events-facets-lineage

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | A Job is a process that consumes or produces Datasets; a Run is one occurrence of a Job in time; a Dataset is an abstract representation of data. | OpenLineage Object Model | Verified, quoted in `SOURCES.md`. |
| 2 | Usually the first Run State for a Job is START and the last is COMPLETE; a run cycle is likely to have at least two Run State updates, and perhaps more. | OpenLineage Object Model | Verified, quoted. The page's own wording is "usually"/"likely," not a hard requirement — the reel's prose matches that softness, never claims START+terminal is mandatory. |
| 3 | A facet is an atomic piece of metadata identified by its name, with a `_schemaURL` field pointing to the corresponding version of the facet schema, an immutable pointer. | OpenLineage Facets & Extensibility | Verified, quoted. |
| 4 | Custom facets can be promoted to the standard spec by including them in it. | OpenLineage Facets & Extensibility | Verified, quoted. |
| 5 | DIRECT means an output column value was somehow derived from the input field's value; INDIRECT means the output is impacted by the input but not derived from it; CONDITIONAL (an INDIRECT subtype) means the input value is used in an IF, CASE WHEN or COALESCE statement. | OpenLineage Column Lineage Dataset Facet | Verified, quoted. |
| 6 | The Airflow integration has been relocated to the official OpenLineage Airflow Provider, supporting Airflow 2.7 and newer; the legacy integration is no longer maintained and will not receive bug fixes, security updates or new features. | OpenLineage Airflow integration docs | Verified, quoted. |
| 7 | A JDBC-relation SQL parse collects only the table/view and field name as written in the query text. | OpenLineage Spark Column Lineage | Verified, quoted. |
| 8 | `ColumnLevelLineageBuilder` traverses the resolved logical plan to build column-level lineage; most expressions are DIRECT, with `If`, `CaseWhen` and `Coalesce` as the exceptions carrying condition expressions; nodes like Aggregate, Join, Filter and Sort mark all their dependencies INDIRECT. | OpenLineage Spark Column Lineage | Verified, quoted. |
| 9 | Marquez was released and open-sourced by WeWork. | Marquez project site | Verified, quoted. |
| 10 | The parent run facet lets a run report which job spawned it, to preserve job hierarchy — the page's own example is an Airflow DAG execution spawning Airflow tasks which then spawn Spark jobs. | OpenLineage Parent Run Facet | Verified, quoted. |
| 11 | `openlineage-python`'s `HttpTransport` posts to `api/v1/lineage` by default. | Read directly from the installed library's own `HttpTransport.__init__` signature (`endpoint: str = 'api/v1/lineage'`), confirmed by inspection, not a vendor page — this is the actual installed client code, version 1.55.0. | Verified by direct inspection and a working local round trip (see `examples.py`). |

## Red-team analysis

- **Could the "usually"/"likely" softness in claim 2 be sharpened into a false "must" in the reel
  prose?** Checked: `reel.tsx`'s own wording says "START then a terminal state" as the model the
  topic teaches, without claiming the spec forbids any other sequence — matches the source's own
  hedging.
- **Does calling the local `http.server` instance "a stand-in for Marquez" overstate what it
  proves?** No: the lab claims only that the wire transport and payload shape are real (the actual
  `openlineage-python` `HttpTransport`, the actual default endpoint path, the actual serialized
  facet JSON), never that Marquez's own storage, graph API or UI were exercised. `OUTLINE.md`'s
  research note and `references.md` both say this explicitly.
- **Is the SQL-parse-vs-runtime-plan comparison honest about being synthetic?** Yes — no Spark is
  installed in this environment (confirmed: `import pyspark` fails). The comparison in
  `examples.py` is a hand-built illustration of the structural claim the Spark docs make (text
  parsing sees names only; plan traversal sees the CASE condition and the resolved parameter), not
  a real Spark job's output. Disclosed in `OUTLINE.md`, `references.md` and `REVIEW.md`.
- **Column-lineage facet schema used in `examples.py` — does it match the real spec's field
  shape?** Checked against the installed `openlineage.client.facet_v2.column_lineage_dataset`
  module's own class signatures (`ColumnLineageDatasetFacet`, `Fields`, `InputField`,
  `Transformation`) by direct Python inspection before writing the lab, not guessed.
- **Parent run facet — does the lab's DAG-run/task-run pairing match the real facet's shape?**
  Checked against the installed `openlineage.client.facet_v2.parent_run.ParentRunFacet`
  constructor (`run`, `job`, optional `root`) by direct inspection; the lab's task run carries a
  `parent` facet pointing at the DAG's own `Run`/`Job`, matching the page's own named example.
