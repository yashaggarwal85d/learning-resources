# Fact-check: Lineage-driven impact analysis (`de.lineage-driven-impact-analysis`)

Last verified: 2 November 2026.

## Claims

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | A Job consumes/produces Datasets; a Run is one occurrence of a Job over time -- the graph a blast-radius walk traces through. | OpenLineage -- Object Model: "A Job is a process that consumes or produces Datasets." / "A Run is an instance of a Job that represents one of its occurrences in time." | Confirmed, quoted verbatim |
| 2 | DIRECT means the output column was derived from the input field; INDIRECT means the input affected the output without the output being derived from it. | OpenLineage -- Column Level Lineage Dataset Facet, both DIRECT/INDIRECT definitions | Confirmed, quoted verbatim |
| 3 | A real lineage API's own column-lineage endpoint is a bounded, directional walk (default depth 20, a `withDownstream` flag), not an unbounded one. | Marquez -- Get a column lineage graph: "depth integerDefault value: 20" / "withDownstream booleanDetermines if downstream lineage should be returned." | Confirmed, quoted verbatim |
| 4 | A real catalog's own impact-analysis feature resolves the full upstream/downstream set and exports it with owner, domain, tags and terms attached -- owner resolution is standard, not a toy addition. | DataHub -- Lineage Impact Analysis, all three quotes | Confirmed, quoted verbatim |
| 5 | Mitigating an incident only requires knowing where the root cause is, not fully understanding it -- locate before explain. | Google SRE Workbook -- Incident Response: "Mitigate the impact." / "To mitigate an incident, you don't have to fully understand the details—you only need to know the location of the root cause." | Confirmed, quoted verbatim |
| 6 | A table-level walk implicates every consumer of a table, including one that never touches the changed column; a column-level walk implicates a strict subset; owner-dedup collapses two affected tables under one owner into a single notification; an uninstrumented reader stays invisible to either walk. | This course's own measurement (`examples.py`) | Confirmed, asserts pass |

## Red-team: the predict questions (steps 3 and 7)

**Step 3 (table-level vs. column-level grouping).** The attack: isn't this just restating "fewer
edges means fewer results" as if it were a discovery? No -- the point isn't the count, it's
*which* consumer drops out and why that's correct rather than an artifact of under-counting.
The dropped consumer in `examples.py` genuinely never derives an output column from the dropped
input column; it reads the table for an unrelated column. Column-level lineage isn't a smaller,
lossier version of table-level lineage here -- it's a more precise answer to a different,
narrower question ("does my output depend on this column") than table-level lineage ever
answered ("do I read this table"). The reveal step says this explicitly rather than leaving it
as an unexplained smaller number.

**Step 7 (planted truth, does the column-level trace reach everything including the unwired
script).** The attack: if the answer is "no, it misses the script," doesn't that make
column-level lineage *worse* than just assuming the worst case (notify everyone who might
possibly be affected)? The topic's own post-notes.md Production section answers this directly:
a report with zero flagged risk from an incomplete graph means zero risk was *found*, not that
zero risk exists. The alternative -- notifying everyone indiscriminately -- doesn't fix the
coverage gap either; it just trades false negatives for false positives on the instrumented
side while still missing the uninstrumented one. The honest fix is closing the instrumentation
gap, not distrusting the graph's precision on the edges it does have.

## Abandoned approaches

A real lineage/catalog stack (OpenLineage event producer plus Marquez or DataHub as a consumer)
was considered and abandoned for this topic's own measurement, for the same reason prior
chapter-13 topics gave: standing up a real catalog and emitting real OpenLineage run events for
a handful of toy tables would spend most of the build on infrastructure rather than on the
walk-direction and column-vs-table distinction this topic is actually about. `examples.py`
instead builds the same graph shape (table-level and column-level edges, an owner map, one
unwired reader) directly as Python dataclasses, which is sufficient to demonstrate every
measured claim above and is checked against the real APIs' own documented shapes (Marquez's
`depth`/`withDownstream` parameters, DataHub's owner-resolving CSV export) rather than against a
live instance of either.
