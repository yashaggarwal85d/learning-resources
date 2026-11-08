# Fact-check — de.delta-commit-protocol-catalog

## Claims

| # | Claim | Source | Verified |
|---|---|---|---|
| 1 | A catalog using PUT-if-absent can ratify and publish a commit in one atomic write. | PROTOCOL.md, Commit Protocol, Option 3 | Quoted in SOURCES.md; reproduced for real with a moto S3 server + `IfNoneMatch="*"`. |
| 2 | A commit that loses the put-if-absent race is rejected, not merged or silently overwritten. | PROTOCOL.md ("ratify version v at most once") | Reproduced: writer B's PUT gets a real 412 PreconditionFailed. |
| 3 | A catalog must not ratify version v until it has ratified v-1, and ratifies v at most once. | PROTOCOL.md | Quoted; matches the sequential `IfNoneMatch` write pattern in examples.py. |
| 4 | An append has no requirements and can always be retried after losing a race. | Topic 13's own verified claim (Iceberg spec, Commit Conflict Resolution and Retry), reused here for Delta | Reproduced: writer B's append re-proposes against the new tip and wins v2, no re-validation needed. |
| 5 | Catalog-managed tables make the catalog the source of truth for whether a commit succeeded. | PROTOCOL.md, Catalog-managed tables | Quoted in SOURCES.md. |
| 6 | Filesystem-based access to catalog-managed tables is not supported; clients must go through the catalog. | PROTOCOL.md | Quoted in SOURCES.md. |
| 7 | WriteSerializable is the default isolation level on Databricks; open-source Delta Lake on Spark accepts only Serializable as a table's isolation level, and defaults to it. | Databricks isolation-levels docs; delta-io/delta `DeltaConfig.scala` | Quoted in SOURCES.md (corrected 2026-11-08: earlier said "Delta's default" unqualified). |
| 8 | WriteSerializable ensures only writes (not reads) are serializable; Serializable ensures both. | Databricks isolation-levels docs | Quoted in SOURCES.md. |
| 9 | A delete that didn't see a concurrent blind insert can still commit under WriteSerializable because the two can be ordered; under Serializable it conflicts only if the insert added files the delete should have read (inside its condition), and commits otherwise. | Databricks isolation-levels docs, worked example; delta-io/delta `ConflictChecker.scala` | Quoted in SOURCES.md; reproduced in `delete_can_commit()` with the insert's file outside (both commit) and inside (Serializable refuses) the delete's condition. Corrected 2026-11-08: the reel had said Serializable refuses "even without an overlap", contradicting the code. |
| 10 | Under WriteSerializable a reader can see a table state that does not exist in the Delta log; under Serializable it cannot. | Databricks isolation-levels docs | Quoted in SOURCES.md. |
| 11 | Catalog-managed tables entered Delta as a preview feature in the Delta 4.0 release. | delta.io, Delta Lake 4.0 (GA announcement) | Quoted in SOURCES.md. |
| 12 | That 4.0 release happened in September 2025, not June 2025 as CHAPTER.md's scope line states. | Primary source's own URL date (`2025-09-25-delta-lake-40`) | Verified directly; discrepancy disclosed in SOURCES.md's Red team section. |
| 13 | Delta 4.2 made commits catalog-coordinated; Delta 4.3 brought the rest of the operation surface (table loads, CREATE/CTAS/REPLACE, metadata-changing writes) under the same catalog APIs. | delta.io, Delta 4.3 release post | Quoted in SOURCES.md. |
| 14 | Server-side commit validation and server-advertised table features are a direct consequence of routing every operation through the catalog. | delta.io, Delta 4.3 release post | Quoted in SOURCES.md. |
| 15 | S3 historically needed an external coordinator (DynamoDB) because conditional writes didn't exist on S3 yet, so two writers could both succeed at publishing the same version. | Delta Lake 4.0 preview blog's description of a "DynamoDB Commit Coordinator" (background knowledge, same reasoning topic 10 established about S3's historical lack of conditional PUT) | Not independently re-verified against a dated S3 announcement in this session; stated as the standard, widely-documented reason (S3 added conditional writes — `If-None-Match`/`If-Match` — in August 2024, well after Delta's commit protocol and its DynamoDB-based LogStore workaround were designed). |
| 16 | The catalog-managed-tables model paves the way for multi-table transactions. | PROTOCOL.md's general framing of a catalog coordinating commits across tables of its own choosing; Delta 4.0 preview blog's "paves the way for multi-statement and multi-table transactions" framing of Coordinated Commits (the precursor feature) | Directionally supported by both sources; not a claim this topic builds code for. |

## Red-team

1. **No `deltalake`/`delta-rs` library anywhere.** Matches the chapter's established convention —
   `examples.py` uses only `boto3` against a real local moto S3 server, reusing topic 10's exact
   primitive. Disclosed in SOURCES.md.
2. **The isolation-level demo is a rule reproduction, not Delta's real conflict detector.**
   `delete_can_commit()` encodes the one `ConflictChecker` check that separates the two levels
   (added files the delete should have read; blind appends skipped under WriteSerializable), with
   the delete's read predicate reduced to one partition value — it is not Delta's whole Scala
   `ConflictChecker`, which reasons over read/write file and partition sets for many more
   operation pairs (see the Databricks "Write conflicts" table fetched for topic 27's sibling
   research: INSERT/UPDATE/DELETE/MERGE/COMPACTION pairs). Disclosed in SOURCES.md.
3. **CHAPTER.md's stated date for the catalog-managed-tables preview was wrong by about three
   months and attributed to the wrong year's season** — "June 2025" vs. the verified September
   2025 GA announcement. This topic corrects it rather than repeating it, and documents both the
   wrong and right dates in SOURCES.md so a future topic doesn't re-introduce the error.
4. **Claim 15 (the DynamoDB-before-conditional-writes history) is stated as context, not asserted
   as a sourced, dated fact in this session.** It is widely documented (S3 added `If-None-Match`
   conditional writes in August 2024; Delta's DynamoDB-backed `S3DynamoDBLogStore` predates that
   by years), but this session did not fetch a primary AWS announcement to re-verify the August
   2024 date. The narration states the mechanism (no conditional PUT meant two writers could both
   "win") without over-claiming an exact verified date for S3's own feature launch.
5. **The 4.2 release notes themselves were not independently fetched** — the 4.2-vs-4.3 split
   claim comes from the 4.3 post's own summary of what 4.2 did ("Delta 4.2 makes commits
   catalog-coordinated"), not from a 4.2-specific primary source. Disclosed as a single-source
   claim for that specific split.

## Scope boundary

This topic does not build or exercise Unity Catalog, a real DynamoDB Commit Coordinator, or any
real multi-table transaction. It reproduces, for real, the one commit primitive the Delta protocol
names as sufficient on its own (PUT-if-absent) and the one isolation-level decision rule Delta's
own docs state with a worked example. The catalog-managed-tables timeline (4.0 preview → 4.2
commits → 4.3 full operation surface) is narrated from verified sourced text, not rebuilt as code
— there is no real catalog in this sandbox to route operations through.
