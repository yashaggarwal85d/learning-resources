# Sources: Lineage-driven impact analysis (`de.lineage-driven-impact-analysis`)

OpenLineage's own object-model and column-lineage-facet pages, Marquez's own lineage API
documentation, DataHub's own impact-analysis documentation, and the Google SRE Workbook's own
incident-response chapter.

## OpenLineage specification -- Object Model

URL: https://openlineage.io/docs/spec/object-model
Retrieved 2026-11-02

> A Job is a process that consumes or produces Datasets.

> A Run is an instance of a Job that represents one of its occurrences in time.

Contents: the Job/Run/Dataset model this topic's own blast-radius walk traces through -- the
"blast-radius scoring" clause's underlying graph.

## OpenLineage specification -- Column Level Lineage Dataset Facet

URL: https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet/
Retrieved 2026-11-02

> DIRECT - output column value was somehow derived from inputField value. In example result value is derived from source

> INDIRECT - output column value is impacted by the value of inputField column, but it's not derived from it. In example no part result value is derived from pred but pred has impact on the values of result in the output dataset

Contents: the DIRECT/INDIRECT distinction this topic's own column-level-vs-table-level
blast-radius comparison depends on -- the "with and without column-level lineage" clause.

## Marquez -- Get a column lineage graph

URL: https://marquezproject.ai/docs/api/get-column-lineage/
Retrieved 2026-11-02

> depth integerDefault value: 20

> withDownstream booleanDetermines if downstream lineage should be returned.

Contents: a real lineage API's own depth and downstream-direction parameters, confirming
downstream impact is a bounded graph walk, not an unbounded one -- the "blast-radius scoring"
clause's walk direction and bound.

## DataHub -- Lineage Impact Analysis

URL: https://docs.datahub.com/docs/act-on-metadata/impact-analysis
Retrieved 2026-11-02

> Lineage Impact Analysis is a powerful workflow for understanding the complete set of upstream and downstream dependencies of a Dataset, Dashboard, Chart, and many other DataHub Entities.

> Choose the Degree of Dependencies you are interested in. The default filter is "1 Degree of Dependency" to minimize processor-intensive queries.

> View the filtered set of dependencies via CSV, with details about assigned ownership, domain, tags, terms, and quick links back to those entities within DataHub

Contents: a real product's own impact-analysis feature -- depth-limited by default, and
resolving each dependency to its owner -- confirming the "automated notification of dependent
owners" clause's owner-resolution step against a real tool, not just this course's own model.

## Google SRE Workbook -- Incident Response

URL: https://sre.google/workbook/incident-response/
Retrieved 2026-11-02

> Mitigate the impact.

> To mitigate an incident, you don't have to fully understand the details—you only need to know the location of the root cause.

Contents: the triage framing CHAPTER.md names this source for -- locating the blast radius
(where the problem reaches) comes before, and matters more urgently than, fully explaining
it -- the "lineage as the backbone of incident triage" clause.

## This course's own measurement

URL: (none — this course's own code, not a fetched source)

`examples.py` builds a small lineage graph with both table-level and column-level edges, walks
it downstream from a proposed column drop, and shows the column-level walk implicates fewer,
more precise consumers than the table-level walk -- plus one planted reader (an unwired export
script) that neither walk reaches at all, demonstrating the permanent gap a lineage graph's own
coverage leaves.
