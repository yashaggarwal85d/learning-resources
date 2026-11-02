# FACT-CHECK — de.delta-transaction-log

## Claims table

| # | Claim | Step | Source | Status |
|---|---|---|---|---|
| 1 | Five real commit files were written to `_delta_log`, newline-delimited JSON, one action per line, named by zero-padded version number | 3 | Executed: `examples.py` `build_log()` writes `00000000000000000000.json` through `00000000000000000004.json` on disk, verified by `ls` and direct read | Verified |
| 2 | Delta files are JSON, one action per line (newline-delimited) | 3 | Delta Protocol, quoted in SOURCES.md | Verified, sourced |
| 3 | Replaying all five commits' `add`/`remove`/`metaData`/`protocol` actions in order reconstructs the real table state: 4 live files, 9 rows | 4 | Executed: `demo_reconstruct_by_hand()` asserts the exact file set and row count | Verified |
| 4 | A file added in v0 and removed in v2 is correctly excluded from the reconstructed state | 4 | Executed: `demo_reconstruct_by_hand()` asserts `"part-00000-v0a.snappy.parquet" not in state["files"]` | Verified |
| 5 | A snapshot is computed by replaying events in ascending commit-version order, keeping the newest add/remove reference per file path | 4 | Delta Protocol (Action Reconciliation), quoted in SOURCES.md | Verified, sourced |
| 6 | A real classic Parquet checkpoint was written at version 2, containing the complete reconciled state up to that version | 6 | Executed: `write_classic_checkpoint()` writes real Parquet via pyarrow; `demo_checkpoint_matches_replay()` asserts its contents match an independent from-scratch replay of versions 0-2 | Verified |
| 7 | A checkpoint contains the complete replay of all actions up to and including the checkpointed version, with invalid actions already removed | 6 | Delta Protocol, quoted in SOURCES.md | Verified, sourced |
| 8 | Starting from the v2 checkpoint and replaying only versions 3-4 gives the identical file set and protocol as replaying from version 0 | 7 | Executed: `demo_short_circuit_from_checkpoint()` asserts both file sets and protocol reader versions are equal | Verified |
| 9 | `_last_checkpoint` is a real pointer file written alongside the checkpoint, naming its version | 7 | Executed: `write_last_checkpoint()` writes a real file; asserted to contain `version: 2` after reload | Verified |
| 10 | A real log compaction file for range [3,4] was built and matches reading those two commits directly | 8 | Executed: `demo_log_compaction()` builds `00000000000000000003.00000000000000000004.compacted.json` and asserts its protocol/add actions equal those read directly from the two source commits | Verified |
| 11 | Log compaction files aggregate actions for a commit range so an implementation can read one file instead of several | 8 | Delta Protocol, quoted in SOURCES.md | Verified, sourced |
| 12 | A real Version Checksum (.crc) file was written for version 4, with `numFiles`/`tableSizeBytes` computed from the real reconciled state | 8 | Executed: `demo_version_checksum()` computes both fields from `state["files"]` directly, not hardcoded, and reloads the file to assert them | Verified |
| 13 | The Version Checksum file exists to detect non-compliant modifications to an append-only log | 8 | Delta Protocol, quoted in SOURCES.md | Verified, sourced |
| 14 | The table's own protocol action at version 0 uses only numeric `minReaderVersion`/`minWriterVersion`; after a real upgrade at version 3, the same concept is expressed as named strings in `readerFeatures`/`writerFeatures` | 9 | Executed: `demo_protocol_vs_table_features()` asserts `"readerFeatures" not in v0_protocol` and the v3 protocol's exact feature lists | Verified |
| 15 | Reader Version 3 and Writer Version 7 add `readerFeatures`/`writerFeatures` lists to the protocol action | 9 | Delta Protocol, quoted in SOURCES.md | Verified, sourced |
| 16 | Table features are the successor to protocol versions, giving clients more granular compatibility flags | 9 | Delta Lake docs ("How does Delta Lake manage feature compatibility?"), quoted in SOURCES.md | Verified, sourced |
| 17 | Multi-part and UUID-named V2-with-sidecars checkpoints exist as described in the spec, but are not built in this sandbox | 6 | Delta Protocol's own checkpoint-naming section (not independently re-quoted beyond the classic-checkpoint quote already in SOURCES.md) | Named only, scope note |

## Red-team

1. **No `deltalake`/`delta-rs` library is used anywhere in this script.** Every file on disk --
   the JSON commits, the Parquet checkpoint, `_last_checkpoint`, the compaction file, the
   checksum file -- is written and read by this script's own code, following the protocol's
   documented naming and schema rules directly. This matches this chapter's established
   house convention (no pip dependency beyond the baseline `pyarrow`) and is disclosed here, not
   hidden: nothing in this topic depends on Delta's own reference implementation behaving any
   particular way beyond what the spec itself states.

2. **The classic checkpoint's Parquet schema here is a reasonable, spec-consistent
   approximation, not a byte-for-byte match to what Spark's own Delta writer produces.** The
   protocol specifies the checkpoint schema at a conceptual level (one action type per column,
   struct fields for `add`/`remove`/`metaData`/`protocol`) without mandating exact Arrow/Parquet
   physical encoding (dictionary encoding, row group sizes, etc.) -- this script's schema
   (`CHECKPOINT_SCHEMA`) follows the documented field names and types for the fields this topic
   actually uses, and leaves out fields (`tags`, `deletionVector`, `stats_parsed`, and others)
   that this topic's table never populates.

3. **Multi-part checkpoints and UUID-named V2-with-sidecars checkpoints are named from the spec's
   own text only, not built.** CHAPTER.md's own scope explicitly asks to "explain" these formats
   alongside the classic checkpoint that is built; multi-part checkpoints are also noted in the
   spec itself as deprecated, which this topic's narration states directly rather than building a
   deprecated format.

4. **The version checksum's `tableSizeBytes` and `numFiles` are computed from the same
   reconciled-state dictionary the earlier reveal steps already built and verified, not
   recomputed independently from a fresh log replay.** This is disclosed as a minor scope note:
   a stricter version of this script would recompute the checksum from an entirely separate replay
   pass, to catch a bug in `reconcile()` itself; here it reuses the already-verified `state`
   object for clarity, consistent with the fact that `demo_reconstruct_by_hand` and
   `demo_checkpoint_matches_replay` already independently cross-check `reconcile()`'s correctness
   earlier in the same script.

5. **`_last_checkpoint`'s exact JSON schema is not fully specified in the fetched protocol
   excerpt beyond its existence and purpose as a pointer.** This script writes only the fields
   the spec's own prose discusses in this context (`version`, and a `size` count of actions) and
   does not claim this is the complete, exhaustive schema Delta's reference implementation emits.

## Scope boundary

Built and verified for real in this sandbox: a full `_delta_log` directory, five real JSON
commits, table state reconstructed by hand via real Action Reconciliation, a real classic Parquet
checkpoint cross-checked against an independent replay, a real `_last_checkpoint` pointer, a real
log compaction file, a real Version Checksum file, and a real protocol-version-to-table-features
upgrade. Named from sourced documentation only, not built: multi-part checkpoints (deprecated per
the spec) and UUID-named V2 checkpoints with sidecar files.
