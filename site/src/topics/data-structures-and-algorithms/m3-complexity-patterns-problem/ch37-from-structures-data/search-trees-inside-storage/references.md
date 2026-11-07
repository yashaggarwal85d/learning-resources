# References

- PostgreSQL, "nbtree/README", source code documentation, `master` branch.
  [README](https://raw.githubusercontent.com/postgres/postgres/master/src/backend/access/nbtree/README)
  — fetched 2026-11-07. Read in full for the heap-TID tiebreaker and the ascending-TID
  duplicate split.
- RocksDB, "db/dbformat.h", source code, `main` branch.
  [dbformat.h](https://raw.githubusercontent.com/facebook/rocksdb/main/db/dbformat.h) — fetched
  2026-11-07. Read for the internal-key comparator (user key ascending, sequence descending).
- RocksDB wiki, "Partitioned Index/Filters".
  [Partitioned Index/Filters](https://github.com/facebook/rocksdb/wiki/Partitioned-Index-Filters)
  — fetched 2026-11-07 (via the wiki's raw git mirror, the `github.com/.../wiki/...` page itself
  returning HTTP 403 to automated fetches). Read in full for the filter-size problem and the
  partitioned fix.
- RocksDB wiki, "RocksDB Bloom Filter".
  [RocksDB Bloom Filter](https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter) —
  fetched 2026-11-07. Read in full to check the current default filter construction; no single
  current default could be quoted without risking a stale claim, recorded as an open question
  in post-notes.md "Frontier" rather than guessed.
- RocksDB wiki, "A Tutorial of RocksDB SST formats".
  [A Tutorial of RocksDB SST formats](https://github.com/facebook/rocksdb/wiki/A-Tutorial-of-RocksDB-SST-formats)
  — fetched 2026-11-07. Background only, for the block-based table layout the partitioned-filter
  page assumes; not quoted.
- Chapter 5 (B+-trees and LSM trees) and Chapter 12 (Bloom filters), this site's own live
  topics — read 2026-11-07 for the textbook mechanics this topic assumes rather than repeats
  (node split/merge, sibling links, bulk loading, memtable, SSTable, write-ahead log,
  compaction policy, per-level filter sizing, the false-positive-rate formula).
- Topics 119 ("Heaps inside compaction, shuffle and top-N") and 121 ("Union-find inside entity
  resolution") — confirmed **not yet live** in `registry.ts` at build time (2026-11-07). Named
  once in prose (step 10) as the topic whose merging iterator shares this topic's internal-key
  comparator, without claiming a registry id that does not yet exist.

Last verified: 2026-11-07. Expert sign-off: pending.
