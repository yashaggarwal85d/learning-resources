# Fact-check — de.delta-dml-execution-merge

## Claims

| # | Claim | Source | Verified |
|---|---|---|---|
| 1 | MERGE finds the files it needs to touch, then rewrites them. | General Delta MERGE semantics; reproduced directly | `find_touched_files()` locates files by committed row-range metadata, matching the demo's design. |
| 2 | Without deletion vectors, a touched file is rewritten whole, including unmodified rows. | Databricks, Low shuffle merge docs | Quoted in SOURCES.md; reproduced: 1000-row file rewritten to change 11 rows, 17834 bytes written. |
| 3 | With deletion vectors, MERGE marks old versions of matched rows deleted and writes only the new/changed rows, not the whole file. | De.deletion-vectors-across-formats' own established mechanism, applied here to MERGE specifically | Reproduced: 252 bytes written (22-byte DV + 230-byte new-rows file) for the same matched-row set. |
| 4 | MERGE INTO and COMPACTION "can conflict." | Delta Lake, Concurrency control docs, Write conflicts table | Quoted in SOURCES.md. |
| 5 | A concurrent operation deleting a file that MERGE read raises a conflict (ConcurrentDeleteReadException). | Delta Lake, Concurrency control docs | Quoted in SOURCES.md; reproduced: a real read-set/remove-set intersection check detects the conflict. |
| 6 | A conflicting MERGE can retry against the new tip and succeed. | Delta Lake, Concurrency control docs ("validate and commit"); demo-specific retry logic | Quoted in SOURCES.md; reproduced: the retried MERGE finds the compacted replacement file and commits as v2. |
| 7 | A fresh (default generated) Row ID is recomputed from a file's `baseRowId` + in-file position, and changes whenever a row moves to a new file or position. | PROTOCOL.md, Row Tracking | Quoted in SOURCES.md; reproduced: row 500's fresh ID changes from 500 to 8277 after a rewrite to a new base/position. |
| 8 | A stable (materialized) Row ID is preserved across an update or rewrite. | PROTOCOL.md, Row Tracking | Quoted in SOURCES.md; reproduced: row 500's stable ID stays 500 across the same rewrite. |
| 9 | Low-shuffle merge processes unmodified rows separately from modified rows, without shuffling the unmodified ones, reducing MERGE's shuffled-data volume. | Databricks, Low shuffle merge docs | Quoted in SOURCES.md; named and explained in narration, not reproduced in code (see Scope boundary). |
| 10 | Change Data Feed is Delta's outbound CDC stream for MERGE/UPDATE/DELETE activity. | CHAPTER.md's own cross-reference to topic 20 (`de.incremental-reads-change-feeds`) | Named in narration, pointing back to the already-built topic; not rebuilt here. |

## Red-team

1. **No `deltalake`/`delta-rs` library anywhere**, matching the chapter's established convention —
   plain CSV data files, a real local-disk put-if-absent commit log (the same primitive topics 13
   and 28 used), and the exact `DeletionVector` array-container shape topic's own sibling
   (`de.deletion-vectors-across-formats`) already built and verified. Disclosed in SOURCES.md.
2. **Low-shuffle merge is narrated, not coded.** It is a physical-execution optimization inside a
   real distributed query engine's shuffle planner (avoiding a Spark shuffle stage for unmodified
   rows); this sandbox has no query engine or shuffle to measure. Disclosed in SOURCES.md and the
   topic's own docstring.
3. **Demo 2's conflict detection reproduces one specific, named conflict pair** (MERGE vs.
   COMPACTION, ConcurrentDeleteReadException) — it is not Delta's full conflict-detection surface
   (ConcurrentAppendException, MetadataChangedException, ConcurrentTransactionException,
   ProtocolChangedException are all named in the same docs but not exercised here, since this
   topic's scope is specifically "why MERGE conflicts with concurrent compaction").
4. **The deletion-vector-mode byte count (252 bytes) and the full-rewrite byte count (17834
   bytes) are measured on the same matched-row set and the same original file**, so the ~70x ratio
   is a real, apples-to-apples comparison, not two different workloads being compared.
5. **Row Tracking's "fresh ID changes, stable ID doesn't" demo uses a synthetic rewrite** (a new
   `baseRowId` of 7777, chosen arbitrarily to make the position-based recomputation visibly
   different) rather than a real compaction job — the point being demonstrated (the formula
   `baseRowId + position` necessarily changes when either operand changes) is a direct
   consequence of the spec's own stated definition, not something that needs a real OPTIMIZE job
   to verify.

## Scope boundary

This topic does not run a real Spark MERGE, does not measure a real shuffle stage, and does not
rebuild Change Data Feed (already real in topic 20). It reproduces, for real: the two physical
rewrite strategies MERGE chooses between (full file vs. deletion vector plus small new file,
measured in real bytes written), a real conflict between MERGE and a concurrent compaction (the
specific pair and exception Delta's own docs name) with a real successful retry, and the real
mathematical consequence of Row Tracking's fresh-vs-stable Row ID definitions.
