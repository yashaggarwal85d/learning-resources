# Fact-check: LSM-tree write and read paths

Role: adversarial re-derivation of every claim in `OUTLINE.md`'s claims list, against the fetched
source texts in `sources/`, not against memory of having written the outline.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | LSM write path: PUT/DELETE log → MemTable → SSTable | Confirmed | `sources/cmu-storage2.txt`, quoted directly: "Instead of storing tuples in pages and updating the in-place, the DBMS maintains a log that records changes to tuples." / "The DBMS applies changes to an in-memory data structure (MemTable) and then writes out the changes sequentially to disk (SSTable)." |
| 2 | A delete is its own kind of entry, not an in-place removal | Confirmed | `sources/cmu-storage2.txt`: "Deletes marks the tuple as deleted." `sources/leveldb-impl.txt`: "Each entry is either a value for the key, or a deletion marker for the key. (Deletion markers are kept around to hide obsolete values present in older sorted tables)." |
| 3 | Index (locates) vs. filter (membership only) distinction | Confirmed | `sources/cmu-indexes1.txt`, quoted directly: "A filter is a data structure that answers set membership queries; it tells you whether a record (likely) exists for a key but not where it is located." |
| 4 | WAL + memtable + flush-to-sorted-table, with a size threshold | Confirmed | `sources/leveldb-impl.txt`: "A log file (*.log) stores a sequence of recent updates... When the log file reaches a pre-determined size (approximately 4MB by default), it is converted to a sorted table." |
| 5 | Memtable consulted on every read | Confirmed | `sources/leveldb-impl.txt`: "A copy of the current log file is kept in an in-memory structure (the `memtable`). This copy is consulted on every read so that read operations reflect all logged updates." |
| 6 | Fence pointer = index block; Bloom filter = filter block, in a real file format | Confirmed | `sources/leveldb-table-format.txt`: "An 'index' block. This block contains one entry per data block, where the key is a string >= last key in that data block..." and "a filter block is stored in each table." |
| 7 | RocksDB's own WAL/immutable-memtable/SST/index/sequence-number terminology | Confirmed | `sources/rocksdb-terminology.txt`, each quoted directly (Write-Ahead-Log, Immutable memtable, SST File, Index, Sequence number entries). |
| 8 | WAL recovery mechanism; WAL obsolete once memtable flushed | Confirmed | `sources/rocksdb-wal-format.txt`: "WAL files can be used to recover the database to its consistent state, by reconstructing the memtable from the logs." / "When a memtable is flushed out to persistent medium safely, the corresponding WAL log(s) become obsolete." |
| 9 | Bits-per-key → false-positive-rate table; filter embedded per SST file | Confirmed | `sources/rocksdb-bloom.txt`, quoted directly (1.5/4.9/9.9 bits-per-key rows) and "each SST file is created with a Bloom filter, embedded in the SST file itself." |

## Red team

- **Edge case: can a Bloom filter ever cause a wrong answer?** No — re-derived from the source's
  own framing (a filter "tells you whether a record (likely) exists... but not where") and from
  the standard Bloom filter guarantee (no false negatives, only false positives): a "maybe" sends
  the read to check the run for real, and a "definitely not" is always correct, since a Bloom
  filter never produces a false negative by construction. The reel's step 8 states this correctly
  as "only ever skip or narrow work," never "can occasionally skip the wrong run."
- **Edge case: what does a fence pointer's min/max key range actually rule out?** Only whole runs
  or whole blocks whose key range cannot contain the target key — it narrows, it never confirms a
  key is present, matching CMU's own index/filter distinction (an index narrows location, a filter
  answers membership). `examples.py`'s fence-pointer check only ever rules a run in or out by key
  range, never asserts presence from the fence pointer alone.
- **Edge case: does "newest wins" ever fail to resolve a tie?** Re-derived from the sequence-number
  mechanism (RocksDB Terminology: "each write to the database will be assigned an auto-incremented
  ID number... attached with the key-value pair in WAL file, memtable, and SST files") — ties are
  structurally impossible, since every write gets a distinct, strictly increasing number, and
  "newest" means highest sequence number, not wall-clock time.
- **Predict-question distractor check (step 4, flush):** "merged into an existing run" imports
  compaction, which this topic explicitly defers to topic 29; "oldest half discarded" invents data
  loss the sources never describe; "converted into an index" conflates the SSTable's own index
  block (built as part of writing the SSTable) with the memtable itself, which is a different
  structure entirely.
- **Predict-question distractor check (step 6, read):** "the oldest value, because it was written
  first" is the natural but wrong assumption if a reader doesn't yet know a later write/delete
  shadows an earlier one; "merge of all three" imports a different technique (RocksDB's own
  Merge() operator, out of scope); "whichever is fastest to find" has no mechanism behind it at
  all — the real rule is positional (memtable, then newest-to-oldest run), not speed-based.
- **Counter-example tried: does immutability ever get violated for a flushed run?** Re-derived in
  `examples.py`: once a run is flushed, the simulation never mutates its stored records in place;
  every later change (overwrite or delete) is represented as a brand-new entry in a newer
  structure (the current memtable or a later run), confirmed by inspecting that no flushed run's
  byte content changes across the whole test run.

## Claims not made (restated from OUTLINE.md, confirmed still out of scope)

- Compaction (leveled, tiered, or otherwise) and the read/write/space amplification trade-off are
  explicitly left to topic 29, per this topic's own handoff in `CHAPTER.md`.
- The original 1996 LSM-tree paper's own algorithm is named as the structure's origin in post-notes
  only, not re-derived as its own mechanism (not fetched; the production docs actually read and
  quoted are the primary sources for this topic's mechanics).
- RocksDB's Ribbon filter and other non-Bloom filter implementations are named only in passing in
  the frontier section, not taught as their own mechanism.
