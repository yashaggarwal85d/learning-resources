# Fact-check — de.copy-on-write-vs

## Claims table

| # | Claim (as stated in the reel) | Source | Verified |
|---|---|---|---|
| 1 | COW: an update triggers creation of new base files; no log files are written | Hudi table_types docs | Yes — direct quote |
| 2 | COW reads only the base files, no merge needed | Hudi table_types docs | Yes — direct quote |
| 3 | MOR: updates/deletes go to a log file, merged dynamically with base files during query execution | Hudi table_types docs | Yes — direct quote |
| 4 | MOR: periodic compaction reconciles the delta log into a new base file version | Hudi table_types docs | Yes — direct quote |
| 5 | Delta's default behavior: a single-row delete rewrites the entire Parquet file (COW by default) | docs.delta.io deletion vectors | Yes — direct quote |
| 6 | Delta deletion vectors mark rows removed without rewriting the Parquet file (MOR, opt-in) | docs.delta.io deletion vectors | Yes — direct quote |
| 7 | Delta reads resolve current state by applying deletion-vector deletions at read time | docs.delta.io deletion vectors | Yes — direct quote |
| 8 | Delta's OPTIMIZE / REORG TABLE ... APPLY (PURGE) is Delta's compaction, converting deletion-vector debt back to rewritten base files | docs.delta.io deletion vectors | Yes — direct quotes |
| 9 | Iceberg deletion vectors are a per-file bitmap, more efficient at execution time than position delete files | Iceberg spec | Yes — direct quote |
| 10 | Iceberg position delete files identify deleted rows by file location and row position | Iceberg spec | Yes — direct quote |
| 11 | A real 1% update rewrites every touched file in full under COW, measured write cost in milliseconds | examples.py demo 1 | Yes — reproduced for real on local disk |
| 12 | A real 1% update under MOR writes a small log file at a small fraction of COW's write cost | examples.py demo 2 | Yes — reproduced for real on local disk |
| 13 | MOR's merge-prep read cost grows measurably as unmerged log files accumulate across repeated updates | examples.py demo 2 | Yes — reproduced for real, isolated and repeated-measured (21 reps/round) to separate signal from base-scan noise |
| 14 | Compaction (folding all logs into base files, then discarding them) brings the merge-prep cost back down to near zero | examples.py demo 2 | Yes — reproduced for real on local disk |

## Currency note

All three sources fetched 2026-10-31. Iceberg spec's current Delete Formats section (v2-v4 behavior). Hudi's `table_types` doc is versioned 1.2.1 (the current docs version at fetch time). Delta's deletion-vectors doc notes the feature is "in experimental support mode" as of Delta Lake 2.3.0+ — this topic treats it as Delta's real, documented MOR-equivalent mechanism, not a claim that it is Delta's default or stable-forever behavior.

## Red-team

1. **"Data files" in examples.py are plain CSV text files, not Parquet.** Disclosed in examples.py's own docstring. The measured cost shapes (full-file rewrite being far more expensive to write than a small log append; read cost growing with unmerged log count; compaction resetting it) are the real, general mechanism every row-oriented-log-over-columnar-base design shares — this topic never claims to reproduce Parquet's binary column-chunk layout or a real query engine's vectorized merge operator.
2. **The "merge" in `scan_base_with_overlay` is a Python dict lookup per row, not Iceberg's real equality/position-delete matching or a real RoaringBitmap scan.** The measured cost grows with the *number of unmerged log files* opened and parsed (`build_overlay_from_logs`), which is the dominant, representative cost in a real system too (more delete files/DVs to open and merge), even though the per-row matching mechanism itself is simplified.
3. **Both base-file scan time and overlay-merge time were measured separately (this topic's own fix, see "Problem-solving notes" below) because the full-table-scan time was too noisy at this sandbox's I/O variance to reliably show growth** — the reel and narration report the isolated merge-prep cost (round 1 through round 5, then post-compaction), which is the real contributor MOR adds and COW never pays, not the total wall-clock read time including base I/O.
4. **Hudi's own topics are explicitly skipped elsewhere in this syllabus** (per CHAPTER.md's own note); Hudi is named here only as the third real system facing the identical COW/MOR choice, not as a topic this chapter otherwise covers in depth.
5. **The "update rate, update spread, read SLA" decision rule named in the Recap is a synthesis of the sources' own stated use-case guidance** (Hudi's own "good use-cases for CoW" and "MoR tables are a great fit for" lists), not a single direct quote — each individual factor (write-heavy/read-heavy, how scattered the touched rows are, how fresh reads must be) is attributable to specific sentences in Hudi's own comparison table and use-case prose.
6. **Delta's MERGE support for deletion vectors was only added in version 3.1.0** per the doc's own supported-operations table — this topic doesn't claim deletion vectors were always available for every Delta write path, only that they exist and are Delta's documented MOR-equivalent today.

## Problem-solving notes

- `examples.py`'s first working version measured total MOR read time (base scan + merge) directly and asserted growth across 5 rounds; this was flaky (failed on roughly 1 in 3 runs) because the 48,000-row base-file scan's I/O noise swamped the small, real merge-overhead signal. Fixed by splitting the read into `build_overlay_from_logs` (the part COW never pays, isolated and timed on its own with 21 repeats/median) and `scan_base_with_overlay` (the part both COW and MOR share) — the isolated merge-prep-cost signal is clean and monotonic across 5 consecutive runs after the fix (0.18ms → 1.13ms growing cleanly, dropping to 0.01ms after compaction in a representative run).
