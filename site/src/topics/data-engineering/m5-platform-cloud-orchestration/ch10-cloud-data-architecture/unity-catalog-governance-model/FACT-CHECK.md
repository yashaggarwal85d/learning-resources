# Fact-check: Unity Catalog governance model

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | Every asset is a securable object addressed by a three-level namespace, with tables/views/volumes/functions/models all first-class | Databricks: What is Unity Catalog? | Confirmed, verbatim quote |
| 2 | Catalogs are the top namespace layer, registered in a metastore; one metastore per region makes catalogs region-isolated | Databricks: What are catalogs in Databricks? | Confirmed, verbatim quotes |
| 3 | Privilege inheritance: granting SELECT on a schema or catalog automatically grants it on current and future tables/views inside | Databricks: Unity Catalog privileges reference | Confirmed, verbatim quote |
| 4 | ABAC policies match by tag condition and apply centrally across many tables automatically, distinct from a table-level row filter/column mask | Databricks: Row filters and column masks | Confirmed, verbatim quote |
| 5 | Lineage is captured automatically down to the column level, aggregated across every workspace on the metastore | Databricks: Lineage in Unity Catalog | Confirmed, verbatim quote |
| 6 | An audit log system table holds account activity, queryable like an ordinary table | Databricks: Audit log system table reference | Confirmed, verbatim quote |
| 7 | Lakehouse Federation gives governed, read-only access to external data through foreign catalogs; query federation and catalog federation run queries differently | Databricks: Connect to external databases and catalogs | Confirmed, verbatim quotes |
| 8 | Delta Sharing's recipient holds a bearer token; its server responds with pre-signed file URLs or temporary cloud credentials depending on access mode | Delta Sharing Protocol specification | Confirmed, verbatim quotes |
| 9 | Unity Catalog's open-source implementation is Apache-2.0, compatible with Hive's metastore API and Iceberg's REST catalog API, hosted by LF AI & Data | Unity Catalog open source README | Confirmed, verbatim quotes |
| 10 | Privilege inheritance and tag-based ABAC both apply to an object created after the grant/policy already exists, not just objects that existed when the rule was written | Derived in `examples.py`, run and verified locally | Confirmed by running the code |

## Red-team

- **Is "applies automatically to new objects" an invented framing, or does Databricks' own documentation actually say that?** Yes — the privileges reference explicitly says a grant covers "all current and future" objects, and the row-filter/column-mask comparison table explicitly contrasts ABAC's "centralized rules applied automatically across many tables" against a table-level rule's narrower scope. `examples.py` encodes exactly this distinction: a plain privilege grant inherits down the tree regardless of when a child node was created, and a tag-based policy applies to any node carrying the tag, including one created after the policy.
- **Does the examples.py tag simulation overstate what Unity Catalog actually guarantees?** No — it deliberately shows the policy does NOT apply to a new table until that table actually carries the tag (`policy.applies_to(new_table) is False` before tagging), then shows it applies once tag inheritance gives the table the tag. This mirrors the real mechanism: ABAC is driven by the tag, not by object creation order, and a table only benefits automatically if tags themselves inherit down the namespace the same way privileges do.
- **Is Lakehouse Federation the same thing as Delta Sharing?** No, and the topic keeps them distinct: Federation queries another system live without copying data, governed through a foreign catalog; Delta Sharing is a separate open protocol for handing a recipient outside your own account read access to your own tables. Conflating them would be a real error this fact-check guards against.

## Outcome

19 quotes across 9 sources, 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean, asserting both the privilege-inheritance and tag-based-ABAC mechanisms against a synthetic namespace tree.
