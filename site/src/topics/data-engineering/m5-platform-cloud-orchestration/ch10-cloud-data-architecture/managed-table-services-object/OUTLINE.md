# Outline — de.managed-table-services-object

**Kind:** full, §10.2. About 15 minutes.

## Scope (full syllabus line)

"S3 Tables (table buckets, Iceberg-native, Dec 2024; automatic compaction, snapshot expiry and
orphan-file removal; Iceberg REST endpoint), BigLake Iceberg tables in BigQuery, Unity Catalog
managed Iceberg, Snowflake-managed Iceberg: maintenance-as-a-service vs running your own
rewrite_data_files/expire_snapshots jobs, per-request premiums, and engine skew on new spec
versions (Iceberg v3 readers lag writers)"

- Clause 1: S3 Tables (table buckets, Iceberg-native, Dec 2024; automatic compaction, snapshot
  expiry and orphan-file removal; Iceberg REST endpoint).
- Clause 2: BigLake Iceberg tables in BigQuery, Unity Catalog managed Iceberg, Snowflake-managed
  Iceberg.
- Clause 3: maintenance-as-a-service vs running your own rewrite_data_files/expire_snapshots jobs.
- Clause 4: per-request premiums.
- Clause 5: engine skew on new spec versions (Iceberg v3 readers lag writers).

## Outcomes

Explain what S3 Tables, BigLake Iceberg tables, Unity Catalog managed Iceberg and Snowflake-managed
Iceberg each actually automate, from their own documentation, not from the general idea of "managed
Iceberg." Price the added per-request premium of a managed table service on top of base storage.
Name the engine-skew risk and how to guard against it.

## Changes from the chapter plan

None. Every claim in CHAPTER.md's plan held up against primary sources, with one addition: AWS's
own "Working with Apache Iceberg V3" documentation gives a concrete, named instance of the
engine-skew risk rather than a hypothetical one — Amazon Athena, AWS's own query engine, cannot
read Iceberg V3 tables at all as of this chapter's research date, and AWS's own upgrade guidance
calls the V2-to-V3 upgrade a one-way operation. This is used directly as the topic's worked
example instead of an invented scenario.

The four vendor products automate genuinely different things, not the same three operations under
different names — confirmed directly from each vendor's own documentation: AWS names compaction,
snapshot management and unreferenced-file removal; Google names compaction, clustering and
time-travel-window garbage collection; Databricks names its own optimization plus Iceberg REST
Catalog read/write/create access for external clients (not read-only, unlike AWS's REST endpoint);
Snowflake draws the managed-vs-externally-managed line explicitly inside one product rather than
across vendors. This topic teaches the difference as the point, not a footnote.

## Engagement arc

- Hook: step 1 — a team adopts a managed Iceberg service expecting it to make the snapshot-expiry
  mistakes of topic 3 impossible, only to find the service's writer has moved to Iceberg V3 while
  one of their own read-only engines (modeled on Athena's real, documented V3 gap) can no longer
  read the table at all.
- Early prediction: step 2 — what's actually different about the one engine that broke?
- Teaching: steps 3-6 — four vendor cards, each showing what it actually automates (not assumed
  identical); the real per-request premium priced on top of topic 6's base model; the
  maintenance-as-a-service vs. own-jobs trade-off.
- Worked payoff: step 7 — the engine-skew failure reproduced for real against a local stand-in.
- Recap: step 8.
- Prove it: step 9.

## Concept ledger

**Introduces:** `managed-table-maintenance-service`, `engine-spec-version-skew`.
**Uses:** `catalog-credential-vending`, `lifecycle-snapshot-corruption`, `cloud-cost-four-dimensions`.
**Declared:** none beyond topic 8.

## Bridge / handoff (verbatim from CHAPTER.md)

**Bridge:** "A catalog that vends credentials is also the natural place to run a table's own
upkeep for you. This topic is that idea under four names: S3 Tables, BigLake Iceberg tables, Unity
Catalog managed Iceberg and Snowflake-managed Iceberg, and what each one actually automates versus
what it still charges you to find out."

**Handoff:** "Every one of these services runs on compute somewhere, billed either by the second
it's reserved or by the request it serves — and that split, serverless against provisioned, is the
section's last and most consequential cost question."

## Claims to fact-check

1. S3 Tables launched December 3, 2024, with automatic compaction, snapshot management and
   unreferenced-file removal performed as managed background operations.
2. S3 Tables' current standing documentation confirms the same three operations today.
3. S3 Tables claims up to 3x faster query performance and 10x higher TPS versus self-managed
   tables.
4. Amazon Athena cannot read Iceberg V3 tables, and AWS's own guidance calls the V2-to-V3 upgrade
   a one-way operation that requires verifying every engine's support first.
5. BigQuery's managed Iceberg tables automate compaction, clustering and post-time-travel-window
   garbage collection — not identically named to AWS's three operations.
6. Unity Catalog managed tables give Unity Catalog all read/write/storage/optimization
   responsibility, and its Iceberg REST Catalog grants external Iceberg clients read, write and
   create access — a stronger access claim than AWS's own.
7. Snowflake draws an explicit managed-vs-externally-managed line: Snowflake performs maintenance
   automatically only on Snowflake-managed Iceberg tables, not on externally managed ones.
8. S3 Tables charges a separate object-monitoring fee and a separate compaction processing fee
   (per object and per GB), on top of ordinary storage and request pricing.
