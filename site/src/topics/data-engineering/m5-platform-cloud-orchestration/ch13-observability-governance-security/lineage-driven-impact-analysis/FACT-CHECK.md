# Fact-check — de.lineage-driven-impact-analysis

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Marquez's lineage-graph API identifies a node as a dataset node, a dataset field node, or a job node, addressed by a namespaced `nodeId` string. | Marquez — Get a lineage graph (API docs) | Verified, quoted. |
| 2 | Marquez's lineage-graph response describes edges with an origin node ID and a destination node ID. | Marquez — Get a lineage graph (API docs) | Verified, quoted. |
| 3 | A data lineage impact analysis reads the lineage graph outward from a chosen asset; read downstream it answers what breaks, read upstream it answers where a bad value came from. | DataHub — Data Lineage Impact Analysis: How to Run One | Verified, quoted. |
| 4 | Table-level lineage tells you which datasets are connected; column-level lineage tells you which of them actually read the specific field being changed. | DataHub — Data Lineage Impact Analysis: How to Run One | Verified, quoted. |
| 5 | The Google SRE Workbook's incident-response chapter does not use the phrase "blast radius" anywhere. | Read directly by fetching the full page's plain text in this session (`sources.mjs fetch`), not assumed from a summary. | Verified by direct inspection — confirmed absent. |
| 6 | The Workbook states first responders must prioritize mitigation above all else, and that assessing the incident's impact is the first step of an active-incident response. | Google SRE Workbook — Incident Response | Verified, quoted. |
| 7 | `metadata-graph-architecture`, `CHAPTER.md`'s planning-time guess for a `uses` id from topic 10, does not exist anywhere in `registry.ts`; topic 10's own entry introduces `metadata-graph-entities-relationships` instead. | Read directly from `registry.ts` (topic 10's own entry) in this session, not a vendor page. | Verified by direct inspection. |
| 8 | No `section: '11.3'` or `section: '11.4'` entry exists anywhere in `registry.ts` — Chapter 11 §11.3 (data incident response and blast radius) and §11.4 (contract enforcement in CI) are both unbuilt. | Read directly from `registry.ts` via `grep` in this session, not a vendor page. | Verified by direct inspection. |
| 9 | On the planted 14-table, 2-dashboard graph, the catalog's static index finds three consumers of the renamed column, a table-level walk finds fourteen downstream tables, and a column-level walk finds eleven — excluding exactly the three tables that never actually read the column. | Read directly from this session's own Python run (see `examples.py`). | Verified by direct execution. |
| 10 | A failed partition's staleness propagates to every table-level dependent (ten tables on this graph), including ones that never read the renamed column — a different reachability rule from blast-radius scoring. | Read directly from this session's own Python run (see `examples.py`). | Verified by direct execution. |
| 11 | Eleven column-level-affected tables collapse into exactly four owner notifications, and a deprecation attempt on a table with live dependents is blocked and names every owner still missing a sign-off, then succeeds once all have signed off. | Read directly from this session's own Python run (see `examples.py`). | Verified by direct execution. |

## Red-team analysis

- **Is "blast radius" misattributed to the SRE Workbook?** No — `SOURCES.md` and this fact-check
  table do not quote the Workbook as using that phrase; the page was fetched in full and checked
  directly, and the term never appears. `reel.tsx`'s own prose uses "blast radius" as this topic's
  own name for the concept (matching `CHAPTER.md`'s own syllabus wording, "blast-radius scoring"),
  not as a quoted SRE term.
- **Is the graph's numeric claims (fourteen, eleven, three, ten, four) genuinely computed, or
  hand-picked to match a target?** Genuinely computed — the graph (`EDGES`, `OWNERS`,
  `CATALOG_DIRECT_CONSUMERS`) is written once as fixed data, and every count in `examples.py`'s
  `main()` is the output of a real graph-traversal function (`downstream_table_level`,
  `downstream_column_level`, `propagate_stale`, `notify_owners`) run against it and asserted, not
  typed in directly; the false-positive set (`pricing_staging`, `finance_recon`,
  `campaign_rollup`) is asserted by name, not just by count, so a wrong traversal would fail loudly.
- **Does calling the uninstrumented partner reader "invisible to both methods" overstate what the
  code shows?** No — the assertion is narrow: `UNINSTRUMENTED_READER`'s name is checked not to
  appear in either the table-level or column-level reachable sets, which is true by construction
  (it was never added as a node or edge); the honest framing in `reel.tsx` and `OUTLINE.md` is that
  no lineage-graph algorithm can find a reader the graph was never told about, not that this
  specific example proves something about all undiscoverable readers in general.
- **Does reusing topic 11's DIRECT/INDIRECT column-lineage model without re-sourcing it risk an
  unsupported claim?** No — this topic's `uses` list already includes `column-lineage-parse-vs-
  runtime` from topic 11, and the model (an edge names which upstream column, DIRECT or INDIRECT,
  produced each downstream column) is composed here, not re-asserted as a new sourced claim; the
  topic's own new ground truth is the graph-walking algorithms run on top of that model.
- **Is Marquez or DataHub actually called by this topic's code?** No, and `OUTLINE.md`'s research
  note says so explicitly — this sandbox has no connected Marquez server (the same absence topic
  11 confirmed for its own build), so `examples.py`'s graph is a plain Python dict, traversed by
  hand-written BFS-style functions, not a call to either vendor's API; `SOURCES.md`'s quotes
  describe how a production system would model and query the same shape of graph, used here to
  back the general claims in `reel.tsx`'s prose, not as evidence that this topic's code calls them.
