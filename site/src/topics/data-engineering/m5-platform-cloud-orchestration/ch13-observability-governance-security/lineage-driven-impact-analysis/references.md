Last verified: 30 October 2026. Expert sign-off: pending. The lineage graph, its table-level and
column-level blast-radius walks, stale propagation, deduplicated notification and deprecation
workflow are the shop's own graph algorithms, run and asserted directly in this build
(`examples.py`) — there is no connected Marquez server in this sandbox (the same absence topic 11
confirmed), so the two sourced claims below describe how a production system would model and query
the same shape of graph, not a system this topic's code actually calls.

- Marquez, "Get a lineage graph": [marquezproject.ai](https://marquezproject.ai/docs/api/get-lineage). A lineage node's types, and edges by origin/destination ID.
- DataHub, "Data Lineage Impact Analysis: How to Run One": [datahub.com](https://datahub.com/blog/data-lineage-impact-analysis/). Table-level versus column-level lineage precision.
- Google SRE Workbook, "Incident Response": [sre.google](https://sre.google/workbook/incident-response/). Assessing impact first; the phrase "blast radius" does not appear on this page (checked directly) — quoted here only for the triage-priority framing, not as the source of the term.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=lineage-driven-impact-analysis:%20).
