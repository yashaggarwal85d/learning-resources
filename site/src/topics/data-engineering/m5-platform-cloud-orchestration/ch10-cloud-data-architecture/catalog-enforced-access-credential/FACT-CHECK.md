# Fact-check — de.catalog-enforced-access-credential

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Lake Formation's four-step flow names this mechanism, using the phrase "credential vending" | AWS Lake Formation: How it works | Confirmed — quoted verbatim |
| 2 | LF-Tags attach grants to a key-value attribute, distinct from IAM tags | AWS Lake Formation tag-based access control | Confirmed — quoted verbatim |
| 3 | Unity Catalog enforces access control automatically beneath every query | Databricks Unity Catalog docs | Confirmed — quoted verbatim |
| 4 | BigLake moves access control to the table level; row-level security and data masking are real named BigQuery features | GCP BigLake / row-level security / data masking docs | Confirmed — quoted verbatim |
| 5 | Apache Polaris is a real open-source Iceberg REST catalog | Apache Polaris home page | Confirmed — quoted verbatim |
| 6 | Iceberg REST's `LoadTableResult` carries `storage-credentials` for vended-credentials delegation | Apache Iceberg REST catalog OpenAPI spec | Confirmed — quoted verbatim from the spec file itself |
| 7 | OneLake separates a control plane from a data plane (OneLake security), scoped to rows/columns | Microsoft Fabric OneLake security docs | Confirmed — quoted verbatim |
| 8 | A `BYPASSRLS` role reads every row with no filter applied | `examples.py`'s real Postgres reproduction | Confirmed — measured directly: `bypass_reads_everything_the_policy_was_supposed_to_hide()` returns both regions and all four rows |
| 9 | A Lake Formation cross-account grant shares a database/table with another AWS account through the catalog's own permission model, not a bucket ACL | AWS Lake Formation: Cross-account data sharing | Confirmed — quoted verbatim |
| 10 | Glue's Spark-native fine-grained access control enforces row/column/cell filters inside the Spark job itself, replacing the older GlueContext-only path | AWS: Using AWS Glue with AWS Lake Formation for fine-grained access control | Confirmed — quoted verbatim; AWS's own text names "Glue version 5.0 and higher," not 5.1 specifically — discrepancy disclosed in OUTLINE.md |

## Red-team: the hook and the bypass mechanism

**Risk:** a learner could think the bypass is a bug in the catalog's enforcement logic — something
a patch could fix — rather than a structural consequence of which credential an engine holds.

**Mitigation:** `examples.py` reproduces the scoped read and the bypass read against the exact
same table and the exact same policy, with the only difference being which role's credential
the connecting engine uses (`east_analyst`, scoped, vs. `bulk_engine`, carrying `BYPASSRLS`).
Nothing about the row-filter policy changes between the two reads — the mitigation is "vend a
scoped credential, never a bulk one," not "fix the policy," which the fact-check table's claim 8
demonstrates directly rather than asserting.

## Red-team: the prove-it question (step 9)

**Risk:** "revoke the bulk role's access entirely" sounds like the fix, but the real five-catalog
pattern is narrower: the bulk role (or an equivalent IAM identity) often still needs *some* bucket
access for operational reasons (backup, replication) — the actual fix is removing `BYPASSRLS`
specifically (or the equivalent "skip the catalog" IAM path), not deleting the identity.

**Mitigation:** the reel's explain text for the prove-it step states this precisely: what closes
the bypass is removing the identity's ability to skip the catalog's policy check, not removing
the identity's existence — matching how every one of the five real catalogs' own documentation
frames the fix (route every engine through the catalog, never hand out a path around it).

## Outcome

Every quote in SOURCES.md is verified word-for-word (`node scripts/sources.mjs check` — 0
problems, 44 quotes across 11 sources). The row filter, column mask and bypass are all reproduced
against a real local PostgreSQL 16 instance (`python3 examples.py` — 4/4 functions pass), not
simulated in Python. The one substitution (Postgres RLS/views in place of a real catalog) is
disclosed in OUTLINE.md's "Changes from the chapter plan" and in `examples.py`'s own docstring,
consistent with the chapter plan's own choice of a Postgres stand-in.
