# Fact-check — de.snapshot-lifecycle-time-travel

## Claims table

| # | Claim (as stated in the reel) | Source | Verified |
|---|---|---|---|
| 1 | Each write to an Iceberg table creates a new snapshot; snapshots can be used for time-travel queries, or the table can be rolled back to any valid snapshot | Iceberg maintenance docs | Yes — direct quote |
| 2 | Expiring old snapshots removes them from metadata, so they are no longer available for time travel queries | Iceberg maintenance docs | Yes — direct quote |
| 3 | Data files are not deleted until no longer referenced by a snapshot that may be used for time travel or rollback; regularly expiring snapshots deletes unused data files | Iceberg maintenance docs | Yes — direct quote |
| 4 | It is dangerous to remove orphan files with a retention interval shorter than the time expected for any write to complete, because it can corrupt the table | Iceberg maintenance docs | Yes — direct quote |
| 5 | Delta's VACUUM removes files no longer referenced and older than the retention threshold; the default retention threshold is 7 days | Delta utility-commands docs | Yes — direct quote |
| 6 | The ability to time travel back to a version older than the retention period is lost after running vacuum | Delta utility-commands docs | Yes — direct quote |
| 7 | A retention interval shorter than the longest running concurrent transaction can let VACUUM corrupt the table or fail concurrent readers | Delta utility-commands docs | Yes — direct quote |
| 8 | Delta's RESTORE command restores a table to an earlier state, by version or by timestamp | Delta utility-commands docs | Yes — direct quote |
| 9 | GDPR/CCPA require permanently and completely deleting PII on request (the "right to be forgotten") | Databricks GDPR docs | Yes — direct quote |
| 10 | Delta's VACUUM is what actually, permanently deletes data no longer referenced, past the retention threshold | Databricks GDPR docs | Yes — direct quote |
| 11 | By default Delta retains table history, including deleted records, for 30 days, available for time travel; even removed versions' data stays in cloud storage until vacuumed | Databricks GDPR docs | Yes — direct quote |
| 12 | Reproduced for real: time travel by snapshot id and by timestamp both return the exact file list of the snapshot they resolve to; rollback moves the current pointer back | examples.py demo 1 | Yes — reproduced for real on local disk |
| 13 | Reproduced for real: expiring two old snapshots and removing the files they alone referenced reclaims exactly 80,000 bytes (two 40,000-byte files); time travel to an expired snapshot then raises `FileNotFoundError` | examples.py demo 2 | Yes — reproduced for real, measured via `os.path.getsize` |
| 14 | Reproduced for real: a "GDPR delete" commit's original PII file survives on disk and is still time-travelable until the old snapshot referencing it is expired and vacuumed, after which it is gone and time travel to it fails | examples.py demo 3 | Yes — reproduced for real on local disk |
| 15 | Reproduced for real: a retention window shorter than a reader's in-flight read corrupts that read with a real `FileNotFoundError`; the identical scenario with a long-enough window succeeds | examples.py demo 4 | Yes — reproduced for real, both branches run in the same script |

## Currency note

All three sources fetched 2026-10-31. Iceberg's maintenance page is its latest (1.12.0) docs.
Delta's utility-commands page and Databricks' GDPR-compliance page are both current docs, the
latter explicitly dated "Last updated on Oct 9, 2026."

## Red-team

1. **The "table" in `examples.py` is a real local directory tree with real JSON snapshot files
   and real binary data files, not Iceberg's or Delta's actual on-disk metadata/manifest format.**
   Disclosed in the script's own docstring, consistent with this chapter's established
   real-mechanism-simplified-storage pattern (same as topics 13-16). What transfers is the real
   mechanism: an explicit snapshot chain, time travel, rollback by pointer, expiry, and orphan-file
   removal — the same operations Iceberg's `expireSnapshots`/`deleteOrphanFiles` and Delta's
   `VACUUM`/`RESTORE` perform.
2. **This topic's "rollback" moves the current pointer directly to an old snapshot's metadata
   file, matching Iceberg's own documented behavior ("the table can be rolled back to any valid
   snapshot")** rather than Delta's `RESTORE`, which creates a new version. Both are real,
   sourced mechanisms; this topic demonstrates the simpler of the two and names Delta's `RESTORE`
   as the other format's equivalent (step 3's fig / step 9).
3. **The "GDPR delete" demo is a stand-in for a real column-level redaction/rewrite**, not an
   actual row-level `DELETE ... MERGE` statement against a real PII schema. The mechanism
   demonstrated — a rewritten file becomes current, but the pre-delete file survives until
   expiry+vacuum — is the real conflict both Delta's own retention docs and Databricks' GDPR docs
   describe, independent of exactly how the delete itself is expressed in SQL.
4. **Demonstration 4's "too-short" and "long-enough" retention scenarios are simulated by whether
   expiry runs before or after the reader finishes its read**, not by an actual wall-clock race
   between two real concurrent processes. This is a deterministic, sourced reproduction of the
   exact failure mode Iceberg's and Delta's own danger notes describe (a retention interval
   shorter than an in-flight read/write), not a claim of having reproduced real-world process
   concurrency timing.
5. **This topic does not demonstrate `write.metadata.delete-after-commit` or metadata-file-level
   cleanup** (Iceberg's separate "remove old metadata files" maintenance operation) — only
   snapshot expiry and orphan data-file removal, which is the chapter's own stated scope for this
   topic (expiring snapshots, removing orphan files, VACUUM).
6. **The lab referenced by CHAPTER.md (§6.3 chapter lab's compaction/expiry/retention leg) is
   hosted by this topic per CHAPTER.md's own note** but is not separately built here beyond the
   four demonstrations above, which already compact, expire, and vacuum a real table and verify
   time travel fails past the retention window.

## Problem-solving notes

No flaky or intermittent failures were hit building this topic's `examples.py` — all four
demonstrations are pure in-memory logic plus small, deterministic local file reads/writes/deletes
with no timing assertions (demonstration 4's two branches are distinguished by code path, not by
wall-clock race), verified by running the full script 3 times consecutively with byte-identical
output each time.
