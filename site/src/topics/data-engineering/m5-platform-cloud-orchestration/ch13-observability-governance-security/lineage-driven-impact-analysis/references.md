Last verified: 2 November 2026. Expert sign-off: pending. Several claims run in `examples.py` against a
toy lineage graph with table-level and column-level edges -- all asserts pass.

- [Object Model](https://openlineage.io/docs/spec/object-model) -- OpenLineage specification. The Job/Run/Dataset graph a blast-radius walk traces through.
- [Column Level Lineage Dataset Facet](https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet/) -- OpenLineage specification. DIRECT and INDIRECT, the distinction a column-level walk relies on.
- [Get a column lineage graph](https://marquezproject.ai/docs/api/get-column-lineage/) -- Marquez Project. A real API's own depth and downstream parameters.
- [Lineage Impact Analysis](https://docs.datahub.com/docs/act-on-metadata/impact-analysis) -- DataHub documentation. A real product's own upstream/downstream, owner-resolving impact view.
- [Incident Response](https://sre.google/workbook/incident-response/) -- Google SRE Workbook. The triage framing: locate the damage before fully explaining it.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=lineage-driven-impact-analysis:%20).
