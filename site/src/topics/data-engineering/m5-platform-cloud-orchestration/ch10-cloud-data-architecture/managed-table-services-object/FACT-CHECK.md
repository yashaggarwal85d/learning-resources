# Fact-check — de.managed-table-services-object

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | S3 Tables launched December 3, 2024 with automatic compaction, snapshot management and unreferenced-file removal | AWS News Blog: New – Amazon S3 Tables | Confirmed — quoted verbatim |
| 2 | S3 Tables' current standing documentation confirms the same three maintenance operations today | AWS: Working with Amazon S3 Tables and table buckets | Confirmed — quoted verbatim |
| 3 | S3 Tables claims up to 3x faster query performance and 10x higher TPS versus self-managed tables | AWS News Blog: New – Amazon S3 Tables | Confirmed — quoted verbatim |
| 4 | Amazon Athena cannot read Iceberg V3 tables; the V2-to-V3 upgrade is one-way | AWS: Working with Apache Iceberg V3 | Confirmed — quoted verbatim, including AWS's own compatibility table |
| 5 | BigQuery's managed Iceberg tables automate compaction, clustering and post-time-travel-window garbage collection | Google Cloud: BigQuery tables for Apache Iceberg | Confirmed — quoted verbatim |
| 6 | Unity Catalog manages all read/write/storage/optimization for managed tables; its Iceberg REST Catalog grants external clients read, write and create access | Databricks: Unity Catalog managed tables | Confirmed — quoted verbatim |
| 7 | Snowflake performs maintenance automatically only on Snowflake-managed Iceberg tables, not on externally managed ones | Snowflake: Manage Apache Iceberg tables | Confirmed — quoted verbatim |
| 8 | S3 Tables charges a separate object-monitoring fee and compaction processing fee on top of storage/request pricing | AWS: Amazon S3 pricing | Confirmed — quoted verbatim; rates measured directly in `examples.py` |
| 9 | The engine-skew failure mode (an older reader can't parse a newer writer's format version) reproduces for real against local metadata | `examples.py`'s real local reproduction | Confirmed — measured directly: `managed_writer_upgrades_table_in_place()` |

## Red-team: the hook and the engine-skew mechanism

**Risk:** a learner could think engine skew is a hypothetical, rare edge case, or that it's a bug
in the older engine rather than a deliberate spec-version boundary.

**Mitigation:** this topic uses AWS's own, currently published compatibility table rather than an
invented scenario — Amazon Athena, a flagship AWS query engine, genuinely cannot read Iceberg V3
tables as of this chapter's research date, and AWS's own upgrade documentation calls the V2-to-V3
move one-way and tells operators to "verify that every engine that reads or writes the table
supports V3" before upgrading. `examples.py` reproduces the exact before/after split (every engine
reads the V2 table; one specific, named engine fails on the V3 table) against real local metadata
files, not an assertion about a hypothetical engine.

## Red-team: "maintenance as a service" is not one mechanism under four names

**Risk:** topic 8 taught five catalogs converging on one mechanism; a learner could assume this
topic's four managed-table services are the same pattern again, collapsing real differences.

**Mitigation:** each vendor's own documentation is quoted for what it specifically automates, and
the differences are kept rather than flattened: AWS names three distinct operations (compaction,
snapshot management, unreferenced-file removal); Google names a different three (compaction,
clustering, time-travel-window garbage collection); Databricks gives external Iceberg clients
read/write/create access through its REST Catalog, not AWS's read-only REST endpoint; Snowflake
draws the managed-vs-externally-managed line as an explicit per-table choice rather than a
vendor-wide default. The reel's vendor cards show filled/empty circles per operation rather than a
single "automated: yes" checkmark, so the differences stay visible.

## Outcome

Every quote in SOURCES.md is verified word-for-word (`node scripts/sources.mjs check` — 0
problems, 21 quotes across 7 sources). The engine-skew failure mode and the per-request premium
are both reproduced against real local files and real, disclosed public pricing
(`python3 examples.py` — 2/2 functions pass), not simulated in the abstract. The one substitution
(a local metadata-version check standing in for five real managed services, none of which can run
in this sandbox) is disclosed in OUTLINE.md's "Changes from the chapter plan" and in
`examples.py`'s own docstring.
