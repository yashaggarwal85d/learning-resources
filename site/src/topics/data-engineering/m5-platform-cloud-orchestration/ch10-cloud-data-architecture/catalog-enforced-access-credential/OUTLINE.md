# Outline — de.catalog-enforced-access-credential

**Kind:** full, §10.2. About 15 minutes.

## Scope (full syllabus line)

"the shared mechanism behind Lake Formation, Unity Catalog, BigLake metastore, Apache Polaris and
OneLake security: the catalog holds policy, a trusted engine enforces row/column filters, and the
catalog vends short-lived, down-scoped storage credentials (Iceberg REST credential vending) so
engines never hold bucket-wide IAM; tag-based grants, cross-account sharing, Spark-native
fine-grained writes (Glue 5.1); the bypass failure mode"

- Clause 1: the shared mechanism (catalog holds policy, trusted engine enforces row/column
  filters, catalog vends short-lived down-scoped storage credentials), under five vendor names.
- Clause 2: Iceberg REST credential vending as the open-protocol instance.
- Clause 3: tag-based grants, cross-account sharing, Spark-native fine-grained writes (Glue 5.1).
- Clause 4: the bypass failure mode.

## Outcomes

Draw the catalog-and-vending diagram from memory and name it under at least three vendor
products. Implement a row filter and a column mask against a local stand-in. Explain Iceberg REST
credential vending as the open-protocol instance of the pattern. Reproduce the bypass failure
mode and say exactly what closes it.

## Changes from the chapter plan

None of the five real catalogs (Lake Formation, Unity Catalog, BigLake metastore, Apache Polaris,
OneLake security) can run in this sandbox. The chapter plan itself already names a Postgres view
as the local stand-in for row/column filters — this topic follows that plan directly, using
PostgreSQL 16's own row-level security (`CREATE POLICY`) for the row filter and a
`security_invoker` view for the column mask, both real Postgres mechanisms, not a mock. The
bypass failure mode is reproduced with a real Postgres role carrying the `BYPASSRLS` attribute,
standing in for an engine handed the underlying bucket's own bulk IAM role instead of a
catalog-vended, scoped credential — the same failure shape (direct access skips every policy),
a different storage engine underneath it, disclosed here and in `examples.py`'s own docstring.

Spark-native fine-grained writes and cross-account sharing are named from AWS's own Lake Formation
and Glue documentation (quoted in SOURCES.md) rather than reproduced locally, since neither needs a
running engine to state correctly — consistent with this topic's own scope boundary ("Leaves out":
the object-storage mechanics the credential rides on are topic 2; managed table maintenance is
topic 9; Unity Catalog in full depth is topic 13). AWS's own current documentation names this
capability for "Glue version 5.0 and higher," not specifically 5.1 as the chapter plan's wording
suggested — the newer, more precise name is used and the discrepancy disclosed here, same as the
two vendor renames found while researching topic 7.

## Engagement arc

- Hook: step 1 — an analytics engine configured with the data lake's broad IAM role as a "quick
  fix" reads every file in the bucket directly, and a column mask the catalog enforces for every
  other tool silently never applies to it.
- Early prediction: step 2 — what exactly makes the bypass possible, given the mask works for
  every other engine?
- Teaching: steps 3-6 — the catalog-and-vending diagram drawn once, then relabelled under four
  vendor names; the row filter and column mask reproduced live against the local Postgres stand-in;
  Iceberg REST credential vending as the open-protocol instance; tag-based grants named.
- Worked payoff: step 7 — the bypass reproduced for real, side by side with the scoped read.
- Recap: step 8.
- Prove it: step 9 — a lab-style question about what specifically closes the bypass.

## Concept ledger

**Introduces:** `catalog-credential-vending`, `row-column-policy-enforcement`, `catalog-bypass-failure`.
**Uses:** `cross-cloud-service-rosetta`, `short-lived-federated-credential`, `object-store-consistency-guarantee`.
**Declared:** none beyond topic 7.

## Bridge / handoff (verbatim from CHAPTER.md)

**Bridge:** "Four cells of that table all pointed at one mechanism. This topic is that mechanism
itself: a catalog that holds policy, an engine the catalog trusts to enforce it, and a credential
handed out scoped to exactly what one query needs — never a bucket-wide key."

**Handoff:** "A catalog that vends credentials is also the natural place to make someone else run
the table's own upkeep — compaction, snapshot expiry, orphan cleanup — as a service instead of a
cron job you own."

## Claims to fact-check

1. Lake Formation's four-step flow (get metadata, check permissions, get credentials, get data)
   names this exact mechanism, including the phrase "credential vending."
2. LF-Tags attach grants to a key-value attribute on a resource rather than to the object itself.
3. Unity Catalog enforces access control automatically beneath every query, not per-engine.
4. BigLake moves access control to the table level; BigQuery row-level security and data masking
   are named directly as a row filter and a column rule respectively.
5. Apache Polaris is a real open-source catalog implementing Iceberg's REST API.
6. The Iceberg REST spec's `LoadTableResult` carries a `storage-credentials` field for
   vended-credentials access delegation, checked before any other config.
7. OneLake enforces a data plane (OneLake security) separately from a control plane, scoped down
   to rows and columns.
8. A role with Postgres's own `BYPASSRLS` attribute reads every row with no filter applied,
   reproducing the bypass failure mode for real.
9. A Lake Formation cross-account grant shares a database or table with another AWS account (or a
   principal inside it) through the catalog's own permission model, not a bucket-level ACL.
10. Glue's Spark-native fine-grained access control enforces row/column/cell filters inside the
    Spark job itself, naming AWS's current "Glue version 5.0 and higher" rather than 5.1.
