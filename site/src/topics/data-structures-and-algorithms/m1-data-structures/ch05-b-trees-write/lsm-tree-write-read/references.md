Last verified: 2026-10-23. Expert sign-off: pending.

- Carnegie Mellon 15-445/645 Database Systems (Fall 2024), "Lecture 4: Database Storage II" — the LSM write path (log, MemTable, SSTable), PUT/DELETE log entries, newest-to-oldest reads, and the summary-table/key-filter structures this topic teaches as the fence pointer and the Bloom filter. [source](https://15445.courses.cs.cmu.edu/fall2024/slides/04-storage2.pdf)
- Carnegie Mellon 15-445/645 Database Systems (Fall 2024), "Lecture 8: Indexes & Filters I" — the precise index-vs-filter distinction this topic's fence-pointer/Bloom-filter split is built on. [source](https://15445.courses.cs.cmu.edu/fall2024/slides/08-indexes1.pdf)
- leveldb Implementation Notes (`main` branch) — the write-ahead log, memtable, and immutable sorted table mechanics, and deletion markers, in a real, current LSM storage engine. [source](https://raw.githubusercontent.com/google/leveldb/main/doc/impl.md)
- leveldb File Format (`main` branch) — the literal on-disk form of a fence pointer (an index block) and a Bloom filter (a filter block) inside a real SSTable. [source](https://raw.githubusercontent.com/google/leveldb/main/doc/table_format.md)
- RocksDB Terminology (wiki) — a second production engine's own WAL, immutable-memtable, SST-file, index, and sequence-number definitions. [source](https://raw.githubusercontent.com/wiki/facebook/rocksdb/Terminology.md)
- RocksDB Write-Ahead-Log File Format (wiki) — the exact crash-recovery mechanism a WAL provides, and why it becomes obsolete once its memtable is flushed. [source](https://raw.githubusercontent.com/wiki/facebook/rocksdb/Write-Ahead-Log-File-Format.md)
- RocksDB Bloom Filter (wiki) — a real, current bits-per-key-to-false-positive-rate table, and confirmation that the filter lives embedded per SST file. [source](https://raw.githubusercontent.com/wiki/facebook/rocksdb/RocksDB-Bloom-Filter.md)

Canonical numbers (the WAL-replay reconstruction of an unflushed memtable; the Bloom filter's
observed false-positive rate against RocksDB's own published bits-per-key table; the run-count a
point read actually opens with a Bloom filter and a fence pointer in place against an unfiltered
baseline on the identical key set; and a tombstone correctly shadowing an older value with zero
compactions run) are computed and asserted directly in this topic's `examples.py`, on this
machine, in one run.

Related tracks (see Prerequisites): `dsa.b-tree-b-tree` (this chapter) for the in-place, page-based
structure this topic is built to avoid; LSM compaction and amplification (next) for what it costs
to clean up the runs this topic lets accumulate.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=lsm-tree-write-read:%20).
