# Outline — de.lineage-driven-impact-analysis

## Syllabus clauses (5, each a literal substring of the syllabus line)

1. "blast-radius scoring before a schema change or deprecation"
2. "stale-table propagation"
3. "automated notification of dependent owners"
4. "deprecation workflows"
5. "lineage as the backbone of incident triage (§11.3) and contract enforcement (§11.4)"

## Concept ledger

**Introduces:** `blast-radius-scoring`, `stale-propagation-along-lineage`,
`owner-notification-deprecation-workflow`.

**Uses (confirmed live in `registry.ts`):** `openlineage-run-job-dataset-events`,
`openlineage-facets`, `column-lineage-parse-vs-runtime`, `lineage-coverage-gaps` (topic 11),
`metadata-graph-entities-relationships` (topic 10 — corrected: `CHAPTER.md`'s planning-time guess
`metadata-graph-architecture` does not exist anywhere in `registry.ts`; topic 10's own entry was
read directly and its real `introduces` array starts with `metadata-graph-entities-relationships`),
`technical-vs-business-catalog` (topic 10), `federated-computational-governance`,
`self-serve-table-registration-gate` (topic 13), `error-budget-burn-rate`, `actionable-page-test`
(topic 3), `dag`, `graph-traversal`, `critical-path` (Chapter 1), `tag-propagation-lineage`
(topic 4).

**Declared, with the gap logged:** `data-incident-response-blast-radius` (Chapter 11 §11.3, "Data
incident response and blast radius" — checked directly: no `section: '11.3'` entry exists anywhere
in `registry.ts`); `contract-enforcement-ci` (Chapter 11 §11.4 — checked directly: no
`section: '11.4'` entry exists either, the same gap topics 11, 12 and 13 each logged for their own
Chapter 11 dependencies).

## Storyboard (10 steps)

1. **Hook** — a data engineer wants to rename `orders.cust_id`. The catalog's own static index
   says three tables use it. How many owners actually need telling, and how many will be missed
   even with lineage that works perfectly?
2. **Predict** (within the first four) — the catalog's own count, a full lineage walk's count, and
   whether either one is the true number of people who should be told.
3. **Reveal: the lineage graph, walked table-level** — starting from the renamed column's table,
   follow every downstream edge, any number of hops, regardless of which column actually carries
   the data; backed by a real walk finding far more consumers than the catalog's static index knew
   about.
4. **Reveal: the lineage graph, walked column-level** — follow only the edges where the column
   itself (DIRECT or INDIRECT) actually propagates; backed by a real walk that excludes genuine
   false positives the table-level walk wrongly implicated — tables downstream of the renamed
   column's table that never actually read it. *Takeaway.*
5. **Reveal: stale-partition propagation** — a different question from blast radius: when a run
   fails outright, the whole partition is suspect, not one column, so staleness propagates along
   the table-level graph, not the column-level one; backed by a real run marking every table-level
   dependent of a failed table stale.
6. **Reveal: deduplicated owner notification** — resolve every affected table to its owner and
   send one message per owner listing everything of theirs that's affected, not one message per
   table; backed by a real run collapsing eleven affected tables into four notifications.
   *Takeaway.*
7. **Reveal: the deprecation workflow, blocked** — a table with live dependents cannot be
   deprecated until every dependent's owner has signed off; backed by a real run refusing to
   deprecate a table with unsigned-off dependents and naming exactly which owners are still
   missing.
8. **Reveal: the deprecation workflow, cleared** — once every dependent owner has signed off (or a
   table never had any dependents to begin with), the same workflow proceeds; backed by both cases
   running for real on the same graph.
9. **Recap.**
10. **Prove it** (second predict) — a table read by name inside a script that never calls the
    lineage API: will blast-radius scoring, stale propagation, or owner notification ever see it,
    no matter how complete the rest of the graph becomes.

## Research note: what this topic runs for real

The lineage graph, its table-level and column-level blast-radius walks, stale-partition
propagation, deduplicated owner notification, and the deprecation workflow are all real, asserted
Python (`examples.py`) run directly on a planted 14-table, 2-dashboard graph built in this topic's
own data model (reusing topic 11's DIRECT/INDIRECT column-lineage representation) — not a call to
Marquez, DataHub or any other third-party service. Per `CHAPTER.md`'s own note ("where the machine
has no Marquez, the graph is built from the OpenLineage events as files and traversed in Python,
disclosed as such"), this sandbox has no connected Marquez server (confirmed by the same absence
topic 11 found), so the graph is the shop's own in-memory structure, traversed by hand-written
code, not queried through Marquez's lineage API — `SOURCES.md` quotes Marquez's and DataHub's own
documentation for how a production system would describe and query the same kind of graph, not as
a claim that this topic calls either system. The Google SRE Workbook's own incident-response
chapter does not use the phrase "blast radius" anywhere (checked directly, fetched in full); its
own closest language ("assess the impact of the incident," prioritizing mitigation) is quoted and
used only for the triage-framing idea, not as the source of the term itself.
