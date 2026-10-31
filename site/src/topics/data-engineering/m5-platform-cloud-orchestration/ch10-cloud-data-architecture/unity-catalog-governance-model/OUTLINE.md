# Outline: Unity Catalog governance model

**Syllabus line (syllabus/data-engineering.md):** "metastore → `catalog.schema.object` namespace, securables (tables, volumes, functions, models), privilege inheritance, ABAC row-filter/column-mask policies on governed tags plus automated classification, column-level lineage and audit in system tables, Lakehouse Federation, the Delta Sharing open protocol (bearer-token REST plus pre-signed file URLs); open-source Unity Catalog (LF AI & Data) vs the managed service."

## Claims to fact-check

1. Every Unity Catalog asset is a securable object addressed by a three-level namespace (`catalog.schema.object`), with tables/volumes/functions/models all first-class securables (Databricks: What is Unity Catalog?).
2. Catalogs are the top layer registered in a metastore; a Databricks account has one metastore per region, so catalogs are inherently region-isolated (Databricks: What are catalogs in Databricks?).
3. Privilege inheritance means granting a privilege at the catalog or schema level automatically grants it on all current and future objects inside, without a separate per-object grant (Databricks: Unity Catalog privileges reference).
4. ABAC policies are matched by tag conditions and apply centrally across many tables automatically, distinct from a table-level row filter/column mask that targets one object at a time (Databricks: Row filters and column masks).
5. Unity Catalog captures lineage automatically down to the column level and aggregates it across every workspace attached to the metastore (Databricks: Lineage in Unity Catalog).
6. An audit log system table holds account activity, queryable as an ordinary table rather than hidden behind a separate UI (Databricks: Audit log system table reference).
7. Lakehouse Federation provides governed, read-only access to external data through Unity Catalog foreign catalogs, with two distinct sub-types (query federation, catalog federation) that run queries differently (Databricks: Connect to external databases and catalogs).
8. Delta Sharing is an open protocol whose recipient holds a bearer token, and whose server can answer with either pre-signed file URLs or temporary cloud credentials depending on the client's own access mode (Delta Sharing Protocol specification).
9. Unity Catalog's open-source implementation is Apache-2.0-licensed, compatible with Hive's metastore API and Iceberg's REST catalog API, and hosted as a sandbox project by the LF AI & Data Foundation (Unity Catalog open source README).

## Changes from the chapter plan

CHAPTER.md's scope line drops a parenthetical the real syllabus line keeps: "(bearer-token REST plus pre-signed file URLs)" right after naming the Delta Sharing open protocol. That parenthetical is this topic's own content, not a forward pointer, so this topic teaches it directly (claim 8) even though CHAPTER.md's shorter paraphrase doesn't spell it out.

A second note: this topic cannot run a real Unity Catalog metastore in this sandbox. Every claim about the namespace, privilege inheritance, ABAC, lineage, audit tables, Lakehouse Federation and Delta Sharing's own protocol mechanics is sourced directly from Databricks' current documentation and the Delta Sharing protocol's own specification on GitHub, rather than reproduced against a live account. The worked reproduction (`examples.py`) models the privilege-inheritance tree and the tag-based ABAC "applies automatically to new objects" claim as a local, disclosed simulation.

## Engagement arc

Hook: a new table is created inside a schema already tagged `pii-restricted`, and without a single new rule being written, the table inherits the tag's row filter and column mask the instant it's created — while a rival per-table manual-grant design leaves exactly this kind of new table briefly ungoverned. Early prediction: before explaining the mechanism, ask what has to be true about a policy for it to apply to a table that doesn't exist yet. Teaching: the three-level namespace and why the extra level exists; the four securable types; privilege inheritance as a small permission tree; tag-driven ABAC versus per-table rules; column-level lineage and the audit log as queryable system tables; Lakehouse Federation; Delta Sharing's actual protocol mechanics. Recap + takeaways. Second predict step: what a Delta Sharing recipient can do without their own Databricks account.

## Concept ledger

**Introduces:** `unity-catalog-namespace-securables`, `tag-based-abac-policy`, `delta-sharing-protocol`.
**Uses:** `catalog-credential-vending` (topic 8), `row-column-policy-enforcement` (topic 8), `auto-loader-discovery-checkpoint` (topic 12).
**Declared:** none beyond topic 12.

## Bridge / handoff

**Bridge:** "This chapter's catalog-and-vending mechanism, taught generically in 10.2, has one especially complete, concrete instance in the platform this section is about. This topic is that instance: a three-level namespace, four kinds of securable, tag-driven policy, and an open protocol for sharing a table with someone who has never heard of your Databricks account."

**Handoff:** "Databricks is one lakehouse platform among several a learner will actually have to choose between, on real criteria: who owns the storage, how open the format really is, and what the exit cost looks like — which closes this section."
