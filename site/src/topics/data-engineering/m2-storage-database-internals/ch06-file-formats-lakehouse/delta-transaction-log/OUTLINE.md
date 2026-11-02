# OUTLINE — de.delta-transaction-log

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook** — Iceberg's own transaction log is a metadata tree of files. This topic opens the
   Delta arc: the same commit-and-history idea, built from a visibly different mechanism, an
   ordered JSON log.

2. **Predict: five real JSON commits sit in `_delta_log`. What do you need to read to know what
   files are in the table right now?** Options: just the latest commit file / every commit from
   the start, in order.

3. **Reveal: five real commits, written by hand to spec** — `00000000000000000000.json` through
   `00000000000000000004.json`, newline-delimited JSON, one action per line, named by zero-padded
   version number.

4. **Reveal: reconstructed by hand, from nothing but the raw log** — replaying all five commits'
   `add`/`remove`/`metaData`/`protocol` actions gives 4 live files, 9 rows; a file added in v0 and
   removed in v2 is correctly gone. Takeaway: a Delta reader's whole job is replaying ordered JSON
   actions and keeping the newest reference per file path.

5. **Predict: a real checkpoint gets written at version 2. To get version 4's state, does a
   reader still have to replay version 0?** Options: yes, checkpoints don't change that / no, it
   can start from the checkpoint and replay only what's newer.

6. **Reveal: a real Parquet checkpoint, verified against an independent replay** — a real classic
   checkpoint file, written via pyarrow, matches a from-scratch replay of the same range exactly.
   Takeaway: a checkpoint is the complete reconciled state up to a version, so a reader can start
   there instead of from the beginning.

7. **Reveal: short-circuited for real, same answer either way** — starting from the v2 checkpoint
   and replaying only versions 3-4 gives the identical file set as replaying from version 0, and
   `_last_checkpoint` is the pointer that lets a reader find it without listing the directory.

8. **Reveal: a real log compaction file, and a real version checksum** — a real
   `.compacted.json` for the range [3,4] matches reading those two commits directly; a real
   `.crc` file's `numFiles`/`tableSizeBytes` are computed from the real reconciled state, not
   asserted.

9. **Reveal: the same protocol, two different vocabularies** — version 0's protocol action uses
   only numeric `minReaderVersion`/`minWriterVersion`; after a real upgrade at version 3, the
   identical concept is expressed as named strings in `readerFeatures`/`writerFeatures`.
   Takeaway: table features replace a protocol *version number* with an explicit, named list of
   what a client must actually support.

10. **Recap** — a `_delta_log` directory is an ordered, replayable JSON log; a checkpoint is a
    reconciled snapshot of it; compaction and checksums are optional accelerants and integrity
    checks on top; protocol versions are being replaced by named table features. Next: how a
    single JSON file becomes an atomic commit, and where catalog-managed tables are heading.
